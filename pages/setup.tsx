import { useState } from 'react'

export default function Setup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showSQL, setShowSQL] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/setup/create-shops-table', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
      
      if (!data.success && data.sql) {
        setShowSQL(true)
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔧</div>
          <h1 style={{ 
            fontSize: '32px', 
            marginBottom: '8px',
            color: '#1a1a1a'
          }}>
            数据库设置
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666'
          }}>
            创建必要的数据库表
          </p>
        </div>

        {!result && (
          <>
            <div style={{
              background: '#f7fafc',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#666'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                marginBottom: '12px',
                color: '#1a1a1a'
              }}>
                📋 将要创建的表：
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li><strong>shops</strong> - 存储店铺信息和访问令牌</li>
                <li>包含必要的索引以提高查询性能</li>
              </ul>
            </div>

            <button
              onClick={handleSetup}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#cbd5e0' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#5568d3')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#667eea')}
            >
              {loading ? '正在创建...' : '创建数据库表'}
            </button>
          </>
        )}

        {result && (
          <div style={{
            background: result.success ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${result.success ? '#86efac' : '#fca5a5'}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              fontSize: '48px', 
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              {result.success ? '✅' : '⚠️'}
            </div>
            
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: result.success ? '#166534' : '#991b1b',
              textAlign: 'center'
            }}>
              {result.success ? '创建成功！' : '需要手动操作'}
            </h3>

            <p style={{
              fontSize: '14px',
              color: result.success ? '#166534' : '#991b1b',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {result.message}
            </p>

            {result.success && result.next_steps && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#1a1a1a'
                }}>
                  📝 下一步：
                </h4>
                <ol style={{ 
                  paddingLeft: '20px', 
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '2',
                  color: '#666'
                }}>
                  {result.next_steps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {showSQL && result.sql && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#1a1a1a'
                }}>
                  请在 Supabase SQL Editor 中运行：
                </h4>
                <pre style={{
                  background: '#1a1a1a',
                  color: '#f0f0f0',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {result.sql}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.sql)
                    alert('SQL 已复制到剪贴板！')
                  }}
                  style={{
                    marginTop: '12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  📋 复制 SQL
                </button>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setResult(null)}
                style={{
                  flex: 1,
                  background: '#e2e8f0',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                返回
              </button>
              
              {result.success && (
                <button
                  onClick={() => window.location.href = '/install'}
                  style={{
                    flex: 1,
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  前往安装页面 →
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#fffbeb',
          border: '2px solid #fcd34d',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          <strong>💡 提示：</strong> 如果自动创建失败，你需要手动在 Supabase SQL Editor 中运行 <code>supabase-shops-table.sql</code> 文件的内容。
        </div>
      </div>
    </div>
  )
}
