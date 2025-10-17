import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function InstallScript() {
  const router = useRouter()
  const { shop } = router.query
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [scriptStatus, setScriptStatus] = useState<'checking' | 'installed' | 'not_installed'>('checking')

  useEffect(() => {
    if (shop) {
      checkScriptStatus()
    }
  }, [shop])

  const checkScriptStatus = async () => {
    try {
      const response = await fetch(`/api/shopify/script-tags?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        const hasPreorderScript = data.scriptTags.some((script: any) => 
          script.src.includes('preorder') || script.src.includes('simple-preorder')
        )
        setScriptStatus(hasPreorderScript ? 'installed' : 'not_installed')
      }
    } catch (error) {
      console.error('Error checking script status:', error)
      setScriptStatus('not_installed')
    }
  }

  const installScript = async () => {
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
          text: `✅ 预购脚本安装成功！现在可以在商店中看到预购按钮了。` 
        })
        setScriptStatus('installed')
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ 安装失败: ${result.message}` 
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

  const uninstallScript = async () => {
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
          text: `✅ 预购脚本已卸载` 
        })
        setScriptStatus('not_installed')
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ 卸载失败: ${result.message}` 
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

  return (
    <>
      <Head>
        <title>PreOrder Pro - 脚本安装</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🚀 PreOrder Pro 脚本安装
            </h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                💡 为什么使用脚本安装？
              </h2>
              <p className="text-blue-700">
                由于 App Embed Block 需要复杂的配置，我们提供了更简单直接的脚本安装方案。
                这种方式更稳定，兼容性更好，安装后立即生效。
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
              {/* 安装状态 */}
              <div className={`border rounded-lg p-6 ${
                scriptStatus === 'installed' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  scriptStatus === 'installed' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  📊 安装状态
                </h3>
                
                <div className="space-y-4">
                  {scriptStatus === 'checking' && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-blue-700">检查中...</span>
                    </div>
                  )}
                  
                  {scriptStatus === 'installed' && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">✅</span>
                        <span className="text-green-800 font-semibold">预购脚本已安装</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        预购功能正在你的商店中正常运行。访问售罄产品页面可以看到预购按钮。
                      </p>
                      <button
                        onClick={uninstallScript}
                        disabled={loading}
                        className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? '卸载中...' : '卸载预购脚本'}
                      </button>
                    </div>
                  )}
                  
                  {scriptStatus === 'not_installed' && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">⚠️</span>
                        <span className="text-yellow-800 font-semibold">预购脚本未安装</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        需要安装预购脚本才能在商店中显示预购按钮。
                      </p>
                      <button
                        onClick={installScript}
                        disabled={loading}
                        className="mt-4 w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? '安装中...' : '🚀 立即安装预购脚本'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 测试链接 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🧪 测试预购功能
                </h3>
                
                <div className="space-y-4">
                  <p className="text-blue-700 text-sm">
                    安装脚本后，访问以下售罄产品页面测试预购按钮：
                  </p>

                  <div className="space-y-2">
                    <a
                      href={`https://${shop}/products/test-01?variant=46938889552121`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors"
                    >
                      🔗 测试产品页面
                    </a>
                    
                    <a
                      href={`https://${shop}/admin/themes/current/editor?context=apps`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-600 text-white px-4 py-2 rounded text-center hover:bg-gray-700 transition-colors"
                    >
                      🎨 主题编辑器 (App Embeds)
                    </a>
                  </div>

                  <div className="bg-blue-100 p-3 rounded text-xs text-blue-800">
                    <strong>预期效果：</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• "Sold out" 按钮被隐藏</li>
                      <li>• 显示橙色"立即预订"按钮</li>
                      <li>• 点击按钮显示预购成功消息</li>
                      <li>• 浏览器控制台显示加载日志</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔧 技术说明
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">脚本安装方式</h4>
                  <ul className="space-y-1">
                    <li>• 使用 Shopify Script Tags API</li>
                    <li>• 自动注入到所有商店页面</li>
                    <li>• 无需修改主题代码</li>
                    <li>• 兼容所有 Shopify 主题</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">功能特性</h4>
                  <ul className="space-y-1">
                    <li>• 智能检测售罄状态</li>
                    <li>• 自动替换售罄按钮</li>
                    <li>• 响应式设计</li>
                    <li>• 详细的调试日志</li>
                  </ul>
                </div>
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
