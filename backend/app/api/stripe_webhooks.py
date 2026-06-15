"""
Stripe webhook handler — keeps subscription tiers in sync with payment events.
"""
import stripe
from fastapi import APIRouter, Header, HTTPException, Request

from app.core.config import get_settings
from app.db.client import get_supabase

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY

PRICE_TO_TIER = {}  # populated lazily below


def _get_price_tier(price_id: str) -> str:
    if price_id == settings.STRIPE_STARTER_PRICE_ID:
        return "starter"
    if price_id == settings.STRIPE_PRO_PRICE_ID:
        return "pro"
    return "free"


@router.post("/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    supabase = get_supabase()
    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        # New subscription created
        customer_id = data["customer"]
        subscription_id = data["subscription"]
        user_email = data.get("customer_details", {}).get("email")

        # Fetch subscription details from Stripe
        sub = stripe.Subscription.retrieve(subscription_id)
        price_id = sub["items"]["data"][0]["price"]["id"]
        tier = _get_price_tier(price_id)

        # Find user by email
        profile = supabase.table("profiles").select("id").eq("email", user_email).single().execute()
        if profile.data:
            user_id = profile.data["id"]
            supabase.table("subscriptions").upsert({
                "user_id": user_id,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id,
                "stripe_price_id": price_id,
                "tier": tier,
                "status": "active",
                "current_period_start": str(sub["current_period_start"]),
                "current_period_end": str(sub["current_period_end"]),
            }, on_conflict="stripe_subscription_id").execute()

            supabase.table("profiles").update({"tier": tier}).eq("id", user_id).execute()

    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        subscription_id = data["id"]
        status = data["status"]
        price_id = data["items"]["data"][0]["price"]["id"]
        tier = _get_price_tier(price_id) if status == "active" else "free"

        result = supabase.table("subscriptions") \
            .select("user_id") \
            .eq("stripe_subscription_id", subscription_id) \
            .single() \
            .execute()

        if result.data:
            user_id = result.data["user_id"]
            supabase.table("subscriptions").update({
                "status": status,
                "tier": tier,
                "stripe_price_id": price_id,
            }).eq("stripe_subscription_id", subscription_id).execute()

            supabase.table("profiles").update({"tier": tier}).eq("id", user_id).execute()

    return {"received": True}
