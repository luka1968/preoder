import { useEffect, useState } from 'react'
import { useAppBridge } from '@shopify/app-bridge-react'
import { getSessionToken } from '@shopify/app-bridge-utils'

export function useSessionToken() {
  const app = useAppBridge()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!app) return

    const fetchToken = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const sessionToken = await getSessionToken(app)
        setToken(sessionToken)
      } catch (err) {
        console.error('Failed to get session token:', err)
        setError(err instanceof Error ? err.message : 'Failed to get session token')
      } finally {
        setLoading(false)
      }
    }

    fetchToken()

    // 定期刷新token（每30分钟�?    const interval = setInterval(fetchToken, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [app])

  return { token, loading, error }
}

export function useAuthenticatedFetch() {
  const { token } = useSessionToken()

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No session token available')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  }

  return { authenticatedFetch, token }
}
