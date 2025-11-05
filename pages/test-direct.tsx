import { useState } from 'react'

export default function TestDirect() {
  const [variantId, setVariantId] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [name, setName] = useState('测试用户')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const test = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-draft-order-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, email, name })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🧪 直接测试 Draft Order 创建</h1>
      
      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0 }}>💡 说明</h3>
        <p>这个测试会：</p>
        <ul>
          <li>使用数据库中已有的 Access Token</li>
          <li>直接调用 Shopify API 创建 Draft Order</li>
          <li>显示详细的调试信息</li>
        </ul>
        <p><strong>不需要重新安装应用！</strong></p>
      </div>

      <div style={{ background: 'white', border: '1px solid #ddd', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Variant ID *
          </label>
          <input
            type="text"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            placeholder="例如：49733009596732"
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>姓名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <button
          onClick={test}
          disabled={loading || !variantId}
          style={{
            background: !variantId ? '#ccc' : '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: !variantId ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {loading ? '测试中...' : '🚀 测试创建 Draft Order'}
        </button>
      </div>

      {result && (
        <div style={{
          background: result.data?.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.data?.success ? '#c3e6cb' : '#f5c6cb'}`,
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3>{result.data?.success ? '✅ 成功' : '❌ 失败'}</h3>
          
          {result.data?.draftOrder && (
            <div>
              <p><strong>Draft Order ID:</strong> {result.data.draftOrder.id}</p>
              <p><strong>Draft Order Name:</strong> {result.data.draftOrder.name}</p>
              <p>
                <a href={result.data.draftOrder.admin_url} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                  在 Shopify 后台查看 →
                </a>
              </p>
            </div>
          )}

          {result.data?.error && (
            <div>
              <p><strong>错误:</strong> {result.data.error}</p>
              {result.data.details && (
                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                  {JSON.stringify(result.data.details, null, 2)}
                </pre>
              )}
            </div>
          )}

          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>查看完整响应</summary>
            <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '12px', marginTop: '8px' }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
