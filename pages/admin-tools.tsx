import { useState } from 'react'
import Head from 'next/head'

export default function AdminTools() {
  const [activeTab, setActiveTab] = useState<'diagnose' | 'fix' | 'test'>('diagnose')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  
  const shop = 'arivi-shop.myshopify.com'
  const [variantId, setVariantId] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [name, setName] = useState('Test User')

  // 诊断功能
  const runDiagnosis = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/check-scopes')
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  // 快速修复
  const quickFix = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/quick-fix-scope', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        alert('✅ 修复成功！')
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  // 重新授权
  const reauthorize = () => {
    window.location.href = `/api/auth/shopify?shop=${shop}`
  }

  // 测试 Draft Order
  const testDraftOrder = async () => {
    if (!variantId) {
      alert('请输入 Variant ID')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/test-draft-order-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, email, name })
      })
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>管理工具 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1>🛠️ 管理工具</h1>
        <p style={{ color: '#666' }}>诊断、修复和测试预购功能</p>

        {/* 标签页 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #ddd' }}>
          {[
            { key: 'diagnose', label: '🔍 诊断' },
            { key: 'fix', label: '🔧 修复' },
            { key: 'test', label: '🧪 测试' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab.key ? '#5c6ac4' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '8px 8px 0 0'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 诊断标签页 */}
        {activeTab === 'diagnose' && (
          <div>
            <h2>诊断权限配置</h2>
            <button
              onClick={runDiagnosis}
              disabled={loading}
              style={{
                background: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '24px'
              }}
            >
              {loading ? '检查中...' : '🔍 开始诊断'}
            </button>

            {result && (
              <div style={{ background: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                <h3>诊断结果</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4>环境变量 (Vercel)</h4>
                  <pre style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                    {result.envScope || '未配置'}
                  </pre>
                  <p><strong>包含 write_draft_orders:</strong> {result.envHasWriteDraftOrders ? '✅ 是' : '❌ 否'}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h4>数据库 (Supabase)</h4>
                  <pre style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                    {result.dbScope || '未配置'}
                  </pre>
                  <p><strong>包含 write_draft_orders:</strong> {result.dbHasWriteDraftOrders ? '✅ 是' : '❌ 否'}</p>
                </div>

                <div style={{
                  background: result.status?.includes('正确') ? '#d4edda' : '#fff3cd',
                  padding: '12px',
                  borderRadius: '4px'
                }}>
                  <strong>状态：</strong> {result.status}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 修复标签页 */}
        {activeTab === 'fix' && (
          <div>
            <h2>修复权限问题</h2>
            
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                <h3>⚡ 快速修复</h3>
                <p>直接更新数据库中的权限，立即生效（临时方案）</p>
                <button
                  onClick={quickFix}
                  disabled={loading}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? '修复中...' : '快速修复'}
                </button>
              </div>

              <div style={{ background: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                <h3>🔐 重新授权</h3>
                <p>获取新的 access token，完全正确的方式（推荐）</p>
                <button
                  onClick={reauthorize}
                  style={{
                    background: '#5c6ac4',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  重新授权
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 测试标签页 */}
        {activeTab === 'test' && (
          <div>
            <h2>测试 Draft Order 创建</h2>
            
            <div style={{ background: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Variant ID *
                </label>
                <input
                  type="text"
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  placeholder="例如: 49733009596732"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                onClick={testDraftOrder}
                disabled={loading || !variantId}
                style={{
                  background: loading || !variantId ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '6px',
                  cursor: loading || !variantId ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                {loading ? '测试中...' : '🧪 测试创建 Draft Order'}
              </button>
            </div>

            {result && result.success && (
              <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, color: '#155724' }}>✅ 成功！</h3>
                <p><strong>Draft Order ID:</strong> {result.draftOrder?.id}</p>
                <p><strong>Draft Order Name:</strong> {result.draftOrder?.name}</p>
                {result.draftOrder?.admin_url && (
                  <a 
                    href={result.draftOrder.admin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      background: '#007bff',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      marginTop: '12px'
                    }}
                  >
                    在 Shopify 中查看
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '24px'
          }}>
            <h3 style={{ marginTop: 0, color: '#721c24' }}>❌ 错误</h3>
            <p>{error}</p>
          </div>
        )}

        {/* 成功提示 */}
        {result && result.success && activeTab === 'fix' && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '24px'
          }}>
            <h3 style={{ marginTop: 0, color: '#155724' }}>✅ 修复成功！</h3>
            <p>{result.message}</p>
            {result.after && (
              <p><strong>write_draft_orders 权限:</strong> {result.after.hasWriteDraftOrders ? '已启用 ✅' : '未启用 ❌'}</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
