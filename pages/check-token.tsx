import { useState } from 'react'
import Head from 'next/head'

export default function CheckToken() {
  const [shop, setShop] = useState('arivi-shop.myshopify.com')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkToken = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/check-shop-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shop })
      })

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
        <title>检查 Access Token - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1 style={{ marginBottom: '24px' }}>🔑 Access Token 检查工具</h1>

        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0 }}>检查说明</h2>
          <p>这个工具会检查：</p>
          <ul>
            <li>✅ 店铺是否在数据库中</li>
            <li>✅ Access Token 是否存在</li>
            <li>✅ Access Token 是否有效</li>
            <li>✅ API 权限范围</li>
          </ul>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            店铺域名：
          </label>
          <input
            type="text"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            placeholder="your-shop.myshopify.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          onClick={checkToken}
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
            marginBottom: '24px'
          }}
        >
          {loading ? '检查中...' : '🔍 检查 Token'}
        </button>

        {result && !result.error && (
          <div style={{
            background: result.hasToken ? '#d4edda' : '#fff3cd',
            border: `1px solid ${result.hasToken ? '#c3e6cb' : '#ffeaa7'}`,
            color: result.hasToken ? '#155724' : '#856404',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginTop: 0 }}>
              {result.hasToken ? '✅ Token 存在' : '⚠️ Token 不存在'}
            </h3>
            
            <div style={{ marginTop: '16px' }}>
              <h4>店铺信息</h4>
              <ul>
                <li><strong>店铺域名:</strong> {result.shop?.shop_domain || '未找到'}</li>
                <li><strong>有 Access Token:</strong> {result.hasToken ? '✅ 是' : '❌ 否'}</li>
                <li><strong>Token 长度:</strong> {result.tokenLength || 0} 字符</li>
                <li><strong>权限范围:</strong> {result.shop?.scope || '未知'}</li>
                <li><strong>计划:</strong> {result.shop?.plan || '未知'}</li>
                <li><strong>状态:</strong> {result.shop?.active ? '✅ 激活' : '❌ 未激活'}</li>
                <li><strong>安装时间:</strong> {result.shop?.created_at ? new Date(result.shop.created_at).toLocaleString('zh-CN') : '未知'}</li>
              </ul>
            </div>

            {result.tokenValid !== undefined && (
              <div style={{ marginTop: '16px' }}>
                <h4>Token 验证</h4>
                <p>
                  <strong>Token 有效性:</strong> {result.tokenValid ? '✅ 有效' : '❌ 无效或已过期'}
                </p>
                {result.apiTest && (
                  <p><strong>API 测试:</strong> {result.apiTest}</p>
                )}
              </div>
            )}
          </div>
        )}

        {result?.error && (
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

        {result && !result.hasToken && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            color: '#856404',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '24px'
          }}>
            <h3 style={{ marginTop: 0 }}>🔧 解决方案</h3>
            <p><strong>需要重新安装应用以获取 Access Token</strong></p>
            <ol>
              <li>访问安装页面：<code>https://your-app.vercel.app/api/auth/shopify?shop={shop}</code></li>
              <li>或者在 Shopify 后台卸载后重新安装应用</li>
              <li>完成 OAuth 授权流程</li>
            </ol>
          </div>
        )}

        {result && result.hasToken && result.tokenValid === false && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '24px'
          }}>
            <h3 style={{ marginTop: 0 }}>⚠️ Token 已失效</h3>
            <p><strong>需要重新授权</strong></p>
            <p>可能的原因：</p>
            <ul>
              <li>应用被卸载后重新安装</li>
              <li>店铺更改了密码</li>
              <li>Token 被手动撤销</li>
            </ul>
            <p><strong>解决方法：</strong>重新安装应用</p>
          </div>
        )}

        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          color: '#0d47a1',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px'
        }}>
          <h3 style={{ marginTop: 0 }}>💡 关于 Access Token</h3>
          <ul>
            <li><strong>什么是 Access Token？</strong> 它是应用访问 Shopify API 的凭证</li>
            <li><strong>何时需要？</strong> 创建 Draft Order、读取产品等操作都需要</li>
            <li><strong>如何获取？</strong> 通过 OAuth 安装流程自动获取并保存</li>
            <li><strong>会过期吗？</strong> 通常不会，除非应用被卸载或权限被撤销</li>
          </ul>
        </div>
      </div>
    </>
  )
}
