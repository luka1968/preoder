import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // 检查是否有shop参数（Shopify应用安装时会有）
    const { shop, hmac, timestamp, code, session } = router.query

    if (session && shop) {
      // 如果有会话令牌，立即重定向到应用主界面
      router.push(`/products?shop=${shop}&session=${session}`)
      return
    }

    if (shop && !session) {
      // 如果有shop参数但没有会话，重定向到认证流程
      router.push(`/api/auth/shopify?shop=${shop}`)
      return
    }

    // 检查是否已经认证
    checkAuthStatus()
  }, [router.query])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        // 已认证，重定向到主应用界面
        router.push('/products')
      } else {
        // 未认证，显示安装界面
        setLoading(false)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setError('Failed to check authentication status')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PreOrder Pro...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            PreOrder Pro
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Comprehensive Shopify app for pre-orders and back-in-stock notifications
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Install PreOrder Pro</h2>
            <p className="text-gray-600 mb-8">
              To use PreOrder Pro, please install it from your Shopify Admin panel.
            </p>
            
            <div className="space-y-4">
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Installation Steps:</h3>
                <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-600">
                  <li>Go to your Shopify Admin</li>
                  <li>Navigate to Apps section</li>
                  <li>Search for "PreOrder Pro" or use the installation link</li>
                  <li>Click "Install" to add the app to your store</li>
                </ol>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This page is displayed because you're accessing the app directly. 
                  Shopify apps are designed to run within the Shopify Admin interface.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Pre-Orders</h3>
              <p className="text-gray-600 text-sm">
                Allow customers to order products before they're in stock
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-600 text-sm">
                Automated back-in-stock email notifications
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Track pre-order performance and customer engagement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
