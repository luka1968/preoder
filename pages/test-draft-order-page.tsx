import { useState } from 'react'
import Layout from '../components/Layout'

export default function TestDraftOrderPage() {
  const [shop, setShop] = useState('')
  const [variantId, setVariantId] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [name, setName] = useState('Test User')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/test-draft-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          variantId,
          email,
          name
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(JSON.stringify(data, null, 2))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">测试 Draft Order 创建</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                店铺域名 (例如: your-store.myshopify.com)
              </label>
              <input
                type="text"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="your-store.myshopify.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                变体 ID (Variant ID)
              </label>
              <input
                type="text"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="12345678901234"
              />
              <p className="text-xs text-gray-500 mt-1">
                可以在 Shopify 后台产品页面的 URL 中找到
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={loading || !shop || !variantId || !email}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '测试中...' : '开始测试'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">✅ 测试成功！</h2>
            <div className="space-y-2 text-sm">
              <p><strong>预购记录 ID:</strong> {result.data.preorder_id}</p>
              <p><strong>Draft Order ID:</strong> {result.data.draft_order_id}</p>
              <p><strong>Draft Order Name:</strong> {result.data.draft_order_name}</p>
              <p><strong>状态:</strong> {result.data.draft_order_status}</p>
              {result.data.admin_url && (
                <p>
                  <strong>Shopify 后台链接:</strong>{' '}
                  <a 
                    href={result.data.admin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    查看订单
                  </a>
                </p>
              )}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600">查看完整响应</summary>
              <pre className="mt-2 p-4 bg-white rounded border text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">❌ 测试失败</h2>
            <pre className="text-sm text-red-700 overflow-auto whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">📝 使用说明</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>输入你的 Shopify 店铺域名（例如：your-store.myshopify.com）</li>
            <li>输入一个有效的产品变体 ID</li>
            <li>输入测试邮箱和姓名</li>
            <li>点击"开始测试"按钮</li>
            <li>如果成功，你应该能在 Shopify 后台的 Orders → Drafts 中看到新订单</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded border">
            <h4 className="font-semibold mb-2">如何获取 Variant ID：</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>登录 Shopify 后台</li>
              <li>进入 Products 页面</li>
              <li>选择一个产品</li>
              <li>在产品详情页面，查看 URL 中的数字（例如：/admin/products/1234567890）</li>
              <li>或者在变体列表中，点击某个变体，URL 中会显示 variant ID</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  )
}
