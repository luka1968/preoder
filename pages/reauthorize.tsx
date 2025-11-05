import { useState } from 'react'
import Head from 'next/head'

export default function Reauthorize() {
  const [loading, setLoading] = useState(false)
  const shop = 'arivi-shop.myshopify.com'

  const handleReauthorize = () => {
    setLoading(true)
    // 直接跳转到 OAuth 授权页面
    window.location.href = `/api/auth/shopify?shop=${shop}`
  }

  return (
    <>
      <Head>
        <title>重新授权应用 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1>🔐 重新授权应用</h1>

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginTop: 0 }}>⚠️ 需要更新权限</h3>
          <p>应用需要额外的权限才能创建 Draft Orders：</p>
          <ul>
            <li><strong>write_draft_orders</strong> - 创建预购订单</li>
          </ul>
          <p style={{ marginBottom: 0 }}>
            点击下方按钮将跳转到 Shopify 授权页面，批准后即可使用完整功能。
          </p>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginTop: 0 }}>当前店铺</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            {shop}
          </p>
        </div>

        <button
          onClick={handleReauthorize}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#5c6ac4',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {loading ? '跳转中...' : '🚀 重新授权应用'}
        </button>

        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px',
          fontSize: '14px'
        }}>
          <h4 style={{ marginTop: 0 }}>📝 授权流程</h4>
          <ol style={{ marginBottom: 0, paddingLeft: '20px' }}>
            <li>点击"重新授权应用"按钮</li>
            <li>在 Shopify 页面查看并批准新权限</li>
            <li>自动返回应用并更新权限</li>
            <li>测试 Draft Order 创建功能</li>
          </ol>
        </div>
      </div>
    </>
  )
}
