import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function QuickFix() {
  const router = useRouter()
  const { shop } = router.query
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const injectSimpleScript = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/inject-simple-preorder?shop=${shop}`, {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ 简单预购脚本注入成功！脚本ID: ${result.scriptId}` 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ 注入失败: ${result.message}` 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ 请求失败: ${error}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const removeScripts = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/inject-simple-preorder?shop=${shop}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${result.message}` 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ 删除失败: ${result.message}` 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ 请求失败: ${error}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const testUrls = [
    `https://${shop}/products/test-01?variant=46938889552121`,
    `https://${shop}/products/test-01`
  ]

  return (
    <>
      <Head>
        <title>PreOrder Pro - 快速修复</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🚀 PreOrder Pro 快速修复
            </h1>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                🚨 预购按钮不显示问题
              </h2>
              <p className="text-red-700">
                如果你的商店中预购按钮没有显示，使用下面的一键修复功能。
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* 一键修复 */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-4">
                  🔧 一键修复
                </h3>
                
                <div className="space-y-4">
                  <p className="text-orange-700 text-sm">
                    这会直接注入一个简单但有效的预购脚本到你的商店，绕过 App Embed Block 的复杂性。
                  </p>

                  <button
                    onClick={injectSimpleScript}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    {loading ? '注入中...' : '🚀 一键注入简单预购脚本'}
                  </button>

                  <button
                    onClick={removeScripts}
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    {loading ? '删除中...' : '🗑️ 删除所有预购脚本'}
                  </button>
                </div>
              </div>

              {/* 测试链接 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🧪 测试预购功能
                </h3>
                
                <div className="space-y-4">
                  <p className="text-blue-700 text-sm">
                    注入脚本后，访问以下链接测试预购按钮是否正常显示：
                  </p>

                  <div className="space-y-2">
                    {testUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors"
                      >
                        测试链接 {index + 1}
                      </a>
                    ))}
                  </div>

                  <div className="bg-blue-100 p-3 rounded text-xs text-blue-800">
                    <strong>预期效果：</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• "Sold out" 按钮被隐藏</li>
                      <li>• 显示橙色"立即预订"按钮</li>
                      <li>• 点击按钮显示成功消息</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ 简单脚本的优势
              </h3>
              
              <ul className="list-disc list-inside space-y-2 text-green-700 text-sm">
                <li><strong>直接有效</strong> - 绕过复杂的 App Embed Block 配置</li>
                <li><strong>即时生效</strong> - 注入后立即在商店中生效</li>
                <li><strong>兼容性好</strong> - 适配所有 Shopify 主题</li>
                <li><strong>易于调试</strong> - 在浏览器控制台可以看到详细日志</li>
                <li><strong>自动检测</strong> - 智能识别售罄状态并显示预购按钮</li>
              </ul>
            </div>

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔍 手动测试方法
              </h3>
              
              <p className="text-gray-600 mb-4">
                如果一键修复不工作，可以手动在浏览器中测试：
              </p>

              <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
{`// 在产品页面的浏览器控制台运行：
const script = document.createElement('script');
script.src = 'https://preorder-pro-fix.vercel.app/simple-preorder-inject.js';
document.head.appendChild(script);`}
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push(`/?shop=${shop}`)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回主页
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
