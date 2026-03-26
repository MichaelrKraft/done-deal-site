import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export const PLAN_PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
  team: process.env.STRIPE_PRICE_TEAM!,
}
