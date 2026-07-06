---
name: stripe-integration
description: Expert knowledge of Stripe payment integration including checkout sessions, subscriptions, webhooks, customer portal, and pricing page implementation. Use when working with payments, subscriptions, billing, checkout flows, pricing pages, or Stripe webhooks.
allowed-tools: Read, Grep, Glob, Write, Edit
---

# Stripe Integration Patterns

## Required Environment Variables
```
STRIPE_SECRET_KEY=sk_live_...        # Server-side only, never expose
STRIPE_PUBLISHABLE_KEY=pk_live_...   # Safe for client-side
STRIPE_WEBHOOK_SECRET=whsec_...      # From Stripe Dashboard > Webhooks
STRIPE_PRICE_PRO_ID=price_...        # Price ID from Stripe Dashboard
STRIPE_PRICE_ENTERPRISE_ID=price_... # Price ID from Stripe Dashboard
```

## Checkout Session (Server)
```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: [{ price: process.env.STRIPE_PRICE_PRO_ID, quantity: 1 }],
  mode: "subscription",
  success_url: `${process.env.APP_URL}/dashboard?upgraded=true`,
  cancel_url: `${process.env.APP_URL}/pricing`,
  customer_email: user.email,          // Pre-fill email
  client_reference_id: user.id,        // Your internal user ID
  metadata: { userId: user.id, plan: "pro" },
  subscription_data: {
    trial_period_days: 14,             // Optional free trial
  },
});
```

## Webhook Handler (Critical — must verify signature)
```javascript
// IMPORTANT: Use raw body, not parsed JSON
app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed":
      // User paid — activate subscription
      break;
    case "customer.subscription.updated":
      // Plan changed
      break;
    case "customer.subscription.deleted":
      // Subscription cancelled — downgrade to free
      break;
    case "invoice.payment_failed":
      // Payment failed — notify user
      break;
  }

  res.json({ received: true });
});
```

## Customer Portal (Let users manage their own subscription)
```javascript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: `${process.env.APP_URL}/dashboard`,
});
res.json({ url: portalSession.url });
```

## Common Mistakes to Avoid
1. **Never** use `express.json()` on the webhook route — it breaks signature verification
2. **Always** store the Stripe customer ID in your database after first checkout
3. **Always** handle `customer.subscription.deleted` to downgrade users
4. **Never** trust client-side data for subscription status — always check your database
5. **Always** use idempotency keys for critical operations

## Testing
- Use `stripe listen --forward-to localhost:3000/api/webhook` for local webhook testing
- Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 9995` (decline)
