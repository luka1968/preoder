import { useState } from 'react'

export default function CheckStatus() {
  const [shopDomain, setShopDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCheck = async () => {
    if (!shopDomain) {
      alert('请输入店铺域名')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/check-shop?shop=${encodeURIComponent(shopDomain)}`)
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        found: false,
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
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <h1 style={{ 
            fontSize: '32px', 
            marginBottom: '8px',
            color: '#1a1a1a'
          }}>
            检查店铺状态
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666'
          }}>
            查看店铺是否已安装并配置正确
          </p>
        </div>

        {!result && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                店铺域名
              </label>
              <input
                type="text"
                placeholder="mystore.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <button
              onClick={handleCheck}
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
              {loading ? '检查中...' : '检查状态'}
            </button>
          </>
        )}

        {result && (
          <div style={{
            background: result.found ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${result.found ? '#86efac' : '#fca5a5'}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ 
              fontSize: '64px', 
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              {result.found ? '✅' : '❌'}
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: result.found ? '#166534' : '#991b1b',
              textAlign: 'center'
            }}>
              {result.found ? '店铺已安装' : '店铺未找到'}
            </h3>

            {result.found && result.shop && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px',
                fontSize: '14px',
                lineHeight: '2'
              }}>
                <div><strong>店铺域名：</strong> {result.shop.domain}</div>
                <div><strong>安装时间：</strong> {new Date(result.shop.installed_at).toLocaleString('zh-CN')}</div>
                <div><strong>状态：</strong> {result.shop.is_active ? '✅ 激活' : '❌ 未激活'}</div>
                <div><strong>权限范围：</strong> {result.shop.scope}</div>
                <div><strong>Access Token：</strong> {result.shop.has_access_token ? '✅ 已保存' : '❌ 缺失'}</div>
                <div><strong>预购记录数：</strong> {result.preorders_count}</div>
              </div>
            )}

            <p style={{
              fontSize: '16px',
              color: result.found ? '#166534' : '#991b1b',
              marginBottom: '16px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {result.message || result.status}
            </p>

            {!result.found && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#666'
              }}>
                <strong>解决方案：</strong>
                <ol style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.8' }}>
                  <li>访问安装页面重新安装</li>
                  <li>或者访问：<br/><code style={{ background: '#f7fafc', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    /api/auth/install?shop={shopDomain}
                  </code></li>
                </ol>
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
                重新检查
              </button>
              
              {!result.found && (
                <button
                  onClick={() => window.location.href = `/api/auth/install?shop=${shopDomain}`}
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
                  立即安装
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
