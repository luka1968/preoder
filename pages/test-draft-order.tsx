import { useState } from 'react'
import Head from 'next/head'

export default function TestDraftOrder() {
  const [shop, setShop] = useState('arivi-shop.myshopify.com')
  const [productId, setProductId] = useState('')
  const [variantId, setVariantId] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [name, setName] = useState('测试用户')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPreorder = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('📤 发送预购请求...')
      
      const response = await fetch('/api/preorder/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          productId,
          variantId,
          email,
          name
        })
      })

      const data = await response.json()
      
      console.log('📥 收到响应:', data)
      
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error: any) {
      console.error('❌ 请求失败:', error)
      setResult({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Draft Order 测试工具</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1 style={{ marginBottom: '24px' }}>🧪 Draft Order 创建测试</h1>

        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0 }}>测试说明</h2>
          <p>这个工具会测试完整的预购流程：</p>
          <ol>
            <li>提交预购信息到 API</li>
            <li>保存到数据库</li>
            <li>创建 Shopify Draft Order</li>
            <li>更新数据库中的 Draft Order ID</li>
          </ol>
        </div>

        <div style={{ background: 'white', border: '1px solid #ddd', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0 }}>填写测试信息</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              店铺域名：
            </label>
            <input
              type="text"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Product ID：
            </label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="例如：9733009596732"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <small style={{ color: '#666' }}>从产品页面 URL 或 Shopify 后台获取</small>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Variant ID：
            </label>
            <input
              type="text"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              placeholder="例如：49733009596732"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <small style={{ color: '#666' }}>从产品变体获取，如果只有一个变体，通常是 Product ID + 前缀</small>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              邮箱：
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              姓名：
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={testPreorder}
            disabled={loading || !productId || !variantId}
            style={{
              background: (!productId || !variantId) ? '#ccc' : '#ff6b35',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: (!productId || !variantId) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            {loading ? '测试中...' : '🚀 测试预购 API'}
          </button>
        </div>

        {result && (
          <div style={{
            background: result.ok ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.ok ? '#c3e6cb' : '#f5c6cb'}`,
            color: result.ok ? '#155724' : '#721c24',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginTop: 0 }}>
              {result.ok ? '✅ API 调用成功' : '❌ API 调用失败'}
            </h3>
            <p><strong>HTTP 状态:</strong> {result.status}</p>
          </div>
        )}

        {result?.data && (
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginTop: 0 }}>📊 响应详情</h3>
            
            {result.data.success && (
              <>
                <div style={{ marginBottom: '16px', padding: '16px', background: '#f0f8ff', borderRadius: '6px' }}>
                  <h4 style={{ marginTop: 0 }}>预购信息</h4>
                  <ul style={{ marginBottom: 0 }}>
                    <li><strong>预购 ID:</strong> {result.data.preorder?.id}</li>
                    <li><strong>邮箱:</strong> {result.data.preorder?.email}</li>
                    <li><strong>状态:</strong> {result.data.preorder?.status}</li>
                  </ul>
                </div>

                <div style={{ 
                  marginBottom: '16px', 
                  padding: '16px', 
                  background: result.data.preorder?.draftOrderCreated ? '#d4edda' : '#fff3cd',
                  borderRadius: '6px' 
                }}>
                  <h4 style={{ marginTop: 0 }}>Draft Order 状态</h4>
                  <ul style={{ marginBottom: 0 }}>
                    <li>
                      <strong>创建成功:</strong> {result.data.preorder?.draftOrderCreated ? '✅ 是' : '❌ 否'}
                    </li>
                    {result.data.preorder?.draftOrderId && (
                      <>
                        <li><strong>Draft Order ID:</strong> {result.data.preorder.draftOrderId}</li>
                        <li><strong>Draft Order Name:</strong> {result.data.preorder.draftOrderName}</li>
                      </>
                    )}
                    {result.data.preorder?.draftOrderError && (
                      <li style={{ color: '#d32f2f' }}>
                        <strong>错误:</strong> {result.data.preorder.draftOrderError}
                      </li>
                    )}
                  </ul>
                </div>

                {result.data.debug && (
                  <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <h4 style={{ marginTop: 0 }}>调试信息</h4>
                    <ul style={{ marginBottom: 0 }}>
                      <li><strong>有 Access Token:</strong> {result.data.debug.hasAccessToken ? '✅ 是' : '❌ 否'}</li>
                      <li><strong>有 Variant ID:</strong> {result.data.debug.hasVariantId ? '✅ 是' : '❌ 否'}</li>
                      <li><strong>店铺:</strong> {result.data.debug.shop}</li>
                      <li><strong>已保存到数据库:</strong> {result.data.debug.savedToDatabase ? '✅ 是' : '❌ 否'}</li>
                    </ul>
                  </div>
                )}
              </>
            )}

            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                查看完整 JSON 响应
              </summary>
              <pre style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
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
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {result.error}
            </pre>
          </div>
        )}

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px'
        }}>
          <h3 style={{ marginTop: 0 }}>💡 如何获取 Product ID 和 Variant ID</h3>
          
          <h4>方法 1：从产品页面 URL</h4>
          <p>访问你的产品页面，URL 类似：</p>
          <code style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', display: 'block', marginBottom: '8px' }}>
            https://arivi-shop.myshopify.com/products/your-product?variant=49733009596732
          </code>
          <p>其中 <code>variant=</code> 后面的数字就是 Variant ID</p>

          <h4>方法 2：从 Shopify 后台</h4>
          <ol>
            <li>进入 Shopify 后台 → Products</li>
            <li>点击产品</li>
            <li>查看 URL，例如：<code>/admin/products/9733009596732</code></li>
            <li>最后的数字就是 Product ID</li>
            <li>向下滚动到 Variants 部分，点击变体查看 Variant ID</li>
          </ol>

          <h4>方法 3：使用浏览器开发者工具</h4>
          <ol>
            <li>在产品页面按 F12 打开开发者工具</li>
            <li>在 Console 中输入：<code>window.meta?.product</code></li>
            <li>查看返回的产品信息</li>
          </ol>
        </div>
      </div>
    </>
  )
}
