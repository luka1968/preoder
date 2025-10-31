import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function InstallSuccess() {
  const router = useRouter()
  const { shop } = router.query
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // 重定向到 Shopify 后台
      if (shop) {
        window.location.href = `https://${shop}/admin/apps`
      }
    }
  }, [countdown, shop])

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
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
        <h1 style={{ 
          fontSize: '32px', 
          marginBottom: '16px',
          color: '#1a1a1a'
        }}>
          安装成功！
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#666',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          PreOrder Pro 已成功安装到您的店铺
          <br />
          <strong style={{ color: '#667eea' }}>{shop}</strong>
        </p>
        
        <div style={{
          background: '#f7fafc',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            marginBottom: '16px',
            color: '#1a1a1a'
          }}>
            ✨ 现在您可以：
          </h3>
          <ul style={{ 
            textAlign: 'left', 
            color: '#666',
            lineHeight: '2',
            paddingLeft: '20px'
          }}>
            <li>在产品页面显示预购按钮</li>
            <li>收集客户预购信息</li>
            <li>在 Shopify 后台查看预购订单</li>
            <li>管理所有预购请求</li>
          </ul>
        </div>

        <p style={{ 
          fontSize: '14px', 
          color: '#999',
          marginBottom: '16px'
        }}>
          {countdown} 秒后自动跳转到 Shopify 后台...
        </p>

        <button
          onClick={() => {
            if (shop) {
              window.location.href = `https://${shop}/admin/apps`
            }
          }}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
          onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
        >
          立即前往 Shopify 后台
        </button>
      </div>
    </div>
  )
}
