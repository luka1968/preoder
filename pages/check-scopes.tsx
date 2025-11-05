import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function CheckScopes() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkScopes()
  }, [])

  const checkScopes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/check-scopes')
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>检查权限配置 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1>🔍 检查权限配置</h1>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>正在检查...</p>
          </div>
        )}

        {!loading && result && !result.error && (
          <>
            {/* 环境变量中的 Scope */}
            <div style={{
              background: result.envHasWriteDraftOrders ? '#d4edda' : '#fff3cd',
              border: `2px solid ${result.envHasWriteDraftOrders ? '#c3e6cb' : '#ffeaa7'}`,
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>
                {result.envHasWriteDraftOrders ? '✅' : '⚠️'} 环境变量 (Vercel)
              </h3>
              <p><strong>SHOPIFY_SCOPES:</strong></p>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '14px'
              }}>
                {result.envScope}
              </pre>
              <p style={{ marginBottom: 0 }}>
                <strong>包含 write_draft_orders:</strong> {result.envHasWriteDraftOrders ? '是 ✅' : '否 ❌'}
              </p>
            </div>

            {/* 数据库中的 Scope */}
            <div style={{
              background: result.dbHasWriteDraftOrders ? '#d4edda' : '#f8d7da',
              border: `2px solid ${result.dbHasWriteDraftOrders ? '#c3e6cb' : '#f5c6cb'}`,
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>
                {result.dbHasWriteDraftOrders ? '✅' : '❌'} 数据库 (shops 表)
              </h3>
              <p><strong>店铺:</strong> {result.shop}</p>
              <p><strong>当前 Scope:</strong></p>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '14px'
              }}>
                {result.dbScope || '(未设置)'}
              </pre>
              <p style={{ marginBottom: 0 }}>
                <strong>包含 write_draft_orders:</strong> {result.dbHasWriteDraftOrders ? '是 ✅' : '否 ❌'}
              </p>
            </div>

            {/* 诊断和建议 */}
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>📋 诊断结果</h3>
              
              {result.needsReauthorization ? (
                <>
                  <div style={{
                    background: '#fff3cd',
                    padding: '16px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ margin: 0 }}>
                      ⚠️ <strong>需要重新授权</strong>
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                      环境变量已配置 write_draft_orders，但数据库中的权限还未更新。
                    </p>
                  </div>
                  
                  <a 
                    href="/reauthorize"
                    style={{
                      display: 'inline-block',
                      background: '#5c6ac4',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    🚀 前往重新授权
                  </a>
                </>
              ) : result.envHasWriteDraftOrders && result.dbHasWriteDraftOrders ? (
                <div style={{
                  background: '#d4edda',
                  padding: '16px',
                  borderRadius: '6px'
                }}>
                  <p style={{ margin: 0 }}>
                    ✅ <strong>配置正确</strong>
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    环境变量和数据库都已正确配置 write_draft_orders 权限。
                  </p>
                </div>
              ) : !result.envHasWriteDraftOrders ? (
                <div style={{
                  background: '#f8d7da',
                  padding: '16px',
                  borderRadius: '6px'
                }}>
                  <p style={{ margin: 0 }}>
                    ❌ <strong>环境变量缺少权限</strong>
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    请在 Vercel Dashboard 中将 SHOPIFY_SCOPES 更新为包含 write_draft_orders
                  </p>
                </div>
              ) : null}
            </div>

            {/* 权限列表对比 */}
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '24px',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginTop: 0 }}>📊 权限对比</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>权限</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>环境变量</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>数据库</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scopeComparison?.map((item: any, index: number) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{item.scope}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {item.inEnv ? '✅' : '❌'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {item.inDb ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && result?.error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>❌ 错误</h3>
            <p>{result.error}</p>
          </div>
        )}

        <button
          onClick={checkScopes}
          disabled={loading}
          style={{
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '24px'
          }}
        >
          {loading ? '检查中...' : '🔄 重新检查'}
        </button>
      </div>
    </>
  )
}
