import { useState } from 'react'
import Head from 'next/head'

export default function TestPreorder() {
  const [testResult, setTestResult] = useState('')

  const testPreorderScript = () => {
    setTestResult('正在测试预购脚本...')
    
    // 模拟产品页面环境
    window.meta = {
      product: {
        id: '12345678901234567890'
      }
    }
    
    window.Shopify = {
      shop: 'arivi-shop.myshopify.com'
    }

    // 加载预购脚本
    const script = document.createElement('script')
    script.src = '/shopify-integration.js'
    script.onload = () => {
      setTestResult('✅ 预购脚本加载成功！检查页面是否显示预购按钮。')
    }
    script.onerror = () => {
      setTestResult('❌ 预购脚本加载失败！')
    }
    document.head.appendChild(script)
  }

  const testPreorderAPI = async () => {
    setTestResult('正在测试预购API...')
    
    try {
      // 首先测试API健康状态
      const healthResponse = await fetch('/api/test-preorder')
      const healthResult = await healthResponse.json()
      
      if (!healthResponse.ok) {
        throw new Error('API健康检查失败')
      }

      setTestResult(`API健康检查通过 ✅\n${JSON.stringify(healthResult, null, 2)}\n\n正在测试预购创建...`)

      // 测试预购创建
      const response = await fetch('/api/preorder/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: 'arivi-shop.myshopify.com',
          productId: '12345678901234567890',
          variantId: '98765432109876543210',
          email: 'test@example.com',
          name: '测试用户'
        })
      })

      let result
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        const text = await response.text()
        throw new Error(`API返回非JSON响应: ${text.substring(0, 200)}...`)
      }
      
      if (response.ok) {
        setTestResult(`✅ 预购API测试成功！\n\n响应状态: ${response.status}\n\n结果:\n${JSON.stringify(result, null, 2)}`)
      } else {
        setTestResult(`⚠️ 预购API返回错误:\n状态码: ${response.status}\n错误信息: ${result.error || '未知错误'}\n\n完整响应:\n${JSON.stringify(result, null, 2)}`)
      }
    } catch (error) {
      setTestResult(`❌ 预购API测试失败:\n错误类型: ${error.name}\n错误信息: ${error.message}\n\n请检查:\n1. 服务器是否正在运行\n2. API路径是否正确\n3. 网络连接是否正常`)
    }
  }

  return (
    <>
      <Head>
        <title>预购功能测试 - PreOrder Pro</title>
      </Head>
      
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h1>🧪 预购功能测试页面</h1>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2>测试说明</h2>
          <p>这个页面用于测试PreOrder Pro的预购功能是否正常工作。</p>
          <ul>
            <li><strong>脚本测试</strong>：测试前端预购脚本是否能正确加载和初始化</li>
            <li><strong>API测试</strong>：测试预购API端点是否能正确处理请求</li>
          </ul>
        </div>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ background: 'white', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>🎯 前端脚本测试</h3>
            <p>测试预购脚本是否能正确加载并显示预购按钮。</p>
            <button 
              onClick={testPreorderScript}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              测试预购脚本
            </button>
          </div>

          <div style={{ background: 'white', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>🔌 API端点测试</h3>
            <p>测试预购API是否能正确处理预购请求。</p>
            <button 
              onClick={testPreorderAPI}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              测试预购API
            </button>
          </div>
        </div>

        {testResult && (
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: '#f8f9fa', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
          }}>
            <h3>测试结果</h3>
            <div>{testResult}</div>
          </div>
        )}

        <div style={{ marginTop: '40px', background: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <h3>📋 Shopify集成步骤</h3>
          <ol>
            <li>
              <strong>添加脚本到主题</strong>
              <p>在Shopify主题的 <code>theme.liquid</code> 文件中，在 <code>&lt;/head&gt;</code> 标签前添加：</p>
              <code style={{ background: '#f1f1f1', padding: '10px', display: 'block', marginTop: '10px' }}>
                &lt;script src="https://shopmall.dpdns.org/shopify-integration.js"&gt;&lt;/script&gt;
              </code>
            </li>
            <li>
              <strong>测试预购功能</strong>
              <p>访问任意缺货商品页面，应该能看到预购按钮和徽章。</p>
            </li>
            <li>
              <strong>自定义样式</strong>
              <p>根据需要修改预购按钮和徽章的样式。</p>
            </li>
          </ol>
        </div>

        {/* 模拟产品页面元素用于测试 */}
        <div style={{ marginTop: '40px', border: '2px dashed #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>🛍️ 模拟产品页面（用于测试）</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div 
                className="product-image-main" 
                style={{ 
                  position: 'relative', 
                  background: '#f0f0f0', 
                  height: '200px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}
              >
                <span>产品图片区域</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h4>测试商品</h4>
              <p>价格: ¥99.00</p>
              <button 
                name="add" 
                disabled 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#ccc', 
                  border: 'none', 
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}
              >
                售罄
              </button>
              <select name="id" style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                <option value="98765432109876543210">默认变体</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
