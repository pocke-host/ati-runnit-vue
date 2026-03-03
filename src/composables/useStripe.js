import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getHeaders = () => {
  const t = localStorage.getItem('token')
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : {}
}

const PRICE_IDS = {
  premium_monthly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY,
  premium_annual:  import.meta.env.VITE_STRIPE_PRICE_PREMIUM_ANNUAL,
  duo_monthly:     import.meta.env.VITE_STRIPE_PRICE_DUO_MONTHLY,
  duo_annual:      import.meta.env.VITE_STRIPE_PRICE_DUO_ANNUAL,
}

export const useStripe = () => {
  const redirectToCheckout = async (tier, period = 'monthly') => {
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    const priceId = PRICE_IDS[`${tier}_${period}`]
    const { data } = await axios.post(
      `${API_URL}/billing/checkout-session`,
      { priceId, tier },
      { headers: getHeaders() }
    )
    await stripe.redirectToCheckout({ sessionId: data.sessionId })
  }

  const openBillingPortal = async () => {
    const { data } = await axios.post(`${API_URL}/billing/portal`, {}, { headers: getHeaders() })
    window.location.href = data.url
  }

  return { redirectToCheckout, openBillingPortal }
}
