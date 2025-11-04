import { useState } from 'react'
import Head from 'next/head'

export default function TestPreorderDebug() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/preorder/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: 'arivi-shop.myshopify.com',
          productId: '9733009596732',  // 替换为你的测试产品 ID
          variantId: '49733009596732', // 替换为你的测试变体 ID
          email: 'test@example.com',
          name: '测试用户'
        })
      })

      const data = await response.json()
      setTestResult({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error: any) {
      setTestResult({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>预购调试工具 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1 style={{ marginBottom: '24px' }}>🔧 预购调试工具</h1>

        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0 }}>测试说明</h2>
          <p>这个工具会测试预购 API 的完整流程：</p>
          <ol>
            <li>保存预购记录到数据库</li>
            <li>创建 Shopify Draft Order</li>
            <li>更新数据库中的 Draft Order ID</li>
          </ol>
          <p><strong>注意：</strong>请先在代码中替换为你的实际产品 ID 和变体 ID</p>
        </div>

        <button
          onClick={runTest}
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
          {loading ? '测试中...' : '🚀 运行测试'}
        </button>

        {testResult && (
          <div style={{
            background: testResult.ok ? '#d4edda' : '#f8d7da',
            border: `1px solid ${testResult.ok ? '#c3e6cb' : '#f5c6cb'}`,
            color: testResult.ok ? '#155724' : '#721c24',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginTop: 0 }}>
              {testResult.ok ? '✅ 测试成功' : '❌ 测试失败'}
            </h3>
            <p><strong>HTTP 状态:</strong> {testResult.status}</p>
          </div>
        )}

        {testResult?.data && (
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginTop: 0 }}>📊 响应数据</h3>
            
            {testResult.data.success && (
              <div style={{ marginBottom: '16px' }}>
                <h4>预购信息</h4>
                <ul>
                  <li><strong>预购 ID:</strong> {testResult.data.preorder?.id}</li>
                  <li><strong>邮箱:</strong> {testResult.data.preorder?.email}</li>
                  <li><strong>状态:</strong> {testResult.data.preorder?.status}</li>
                  <li><strong>Draft Order ID:</strong> {testResult.data.preorder?.draftOrderId || '❌ 未创建'}</li>
                  <li><strong>Draft Order Name:</strong> {testResult.data.preorder?.draftOrderName || '❌ 未创建'}</li>
                  <li><strong>Draft Order 创建成功:</strong> {testResult.data.preorder?.draftOrderCreated ? '✅ 是' : '❌ 否'}</li>
                  {testResult.data.preorder?.draftOrderError && (
                    <li style={{ color: '#d32f2f' }}>
                      <strong>Draft Order 错误:</strong> {testResult.data.preorder.draftOrderError}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {testResult.data.debug && (
              <div style={{ marginBottom: '16px' }}>
                <h4>调试信息</h4>
                <ul>
                  <li><strong>有 Access Token:</strong> {testResult.data.debug.hasAccessToken ? '✅ 是' : '❌ 否'}</li>
                  <li><strong>有 Variant ID:</strong> {testResult.data.debug.hasVariantId ? '✅ 是' : '❌ 否'}</li>
                  <li><strong>店铺:</strong> {testResult.data.debug.shop}</li>
                  <li><strong>已保存到数据库:</strong> {testResult.data.debug.savedToDatabase ? '✅ 是' : '❌ 否'}</li>
                </ul>
              </div>
            )}

            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>查看完整 JSON 响应</summary>
              <pre style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {testResult?.error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>❌ 错误</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {testResult.error}
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
          <h3 style={{ marginTop: 0 }}>💡 常见问题</h3>
          <ul>
            <li><strong>Draft Order 未创建：</strong>检查是否有 access_token 和 variant_id</li>
            <li><strong>Access Token 缺失：</strong>确保店铺已正确安装应用</li>
            <li><strong>Variant ID 缺失：</strong>前台脚本可能没有正确获取变体 ID</li>
            <li><strong>Shopify API 错误：</strong>检查 API 权限和版本</li>
          </ul>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>📝 下一步</h3>
          <ol>
            <li>查看浏览器控制台的详细日志</li>
            <li>检查 Vercel 或服务器日志</li>
            <li>确认 Shopify 店铺的 API 权限</li>
            <li>测试前台预购按钮</li>
          </ol>
        </div>
      </div>
    </>
  )
}
