import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getHeaders = () => {
  const t = localStorage.getItem('token')
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : {}
}

export const useStripe = () => {
  const openBillingPortal = async () => {
    const { data } = await axios.post(`${API_URL}/billing/portal`, {}, { headers: getHeaders() })
    window.location.href = data.url
  }

  return { openBillingPortal }
}
