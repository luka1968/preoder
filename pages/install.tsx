import { useState } from 'react'

export default function Install() {
  const [shopDomain, setShopDomain] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInstall = () => {
    if (!shopDomain) {
      alert('请输入店铺域名')
      return
    }

    setLoading(true)
    
    // 清理域名格式
    let cleanDomain = shopDomain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
    
    // 如果没有 .myshopify.com 后缀，自动添加
    if (!cleanDomain.includes('.myshopify.com')) {
      cleanDomain = `${cleanDomain}.myshopify.com`
    }

    // 重定向到安装 API
    window.location.href = `/api/auth/shopify?shop=${cleanDomain}`
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
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛍️</div>
          <h1 style={{ 
            fontSize: '32px', 
            marginBottom: '8px',
            color: '#1a1a1a'
          }}>
            PreOrder Pro
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666'
          }}>
            强大的预购管理工具
          </p>
        </div>

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
            onKeyPress={(e) => e.key === 'Enter' && handleInstall()}
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
          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '8px'
          }}>
            输入您的 Shopify 店铺域名
          </p>
        </div>

        <button
          onClick={handleInstall}
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
            transition: 'all 0.2s',
            marginBottom: '24px'
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#5568d3')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#667eea')}
        >
          {loading ? '正在跳转...' : '安装到 Shopify'}
        </button>

        <div style={{
          background: '#f7fafc',
          borderRadius: '12px',
          padding: '20px',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.8'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1a1a1a'
          }}>
            📋 安装后您将获得：
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li>自动显示预购按钮</li>
            <li>收集客户预购信息</li>
            <li>Shopify 后台订单管理</li>
            <li>邮件通知功能</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
