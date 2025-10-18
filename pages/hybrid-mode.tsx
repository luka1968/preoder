import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface HybridStatus {
  shop: string
  status: 'active' | 'partial' | 'inactive'
  appEmbedActive: boolean
  scriptTagActive: boolean
  recommendations: string[]
  timestamp: string
}

interface DeployResult {
  success: boolean
  method: 'app_embed' | 'script_tag' | 'hybrid'
  message: string
  details: any
}

export default function HybridMode() {
  const router = useRouter()
  const { shop } = router.query
  const [status, setStatus] = useState<HybridStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  useEffect(() => {
    if (shop) {
      checkStatus()
    }
  }, [shop])

  const checkStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hybrid-deploy?shop=${shop}&action=status`)
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to check status' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const deployHybridMode = async () => {
    try {
      setDeploying(true)
      setMessage(null)
      
      const response = await fetch(`/api/hybrid-deploy?shop=${shop}`, {
        method: 'POST'
      })

      const result: DeployResult = await response.json()

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `🎉 ${result.message}` 
        })
        // 重新检查状态
        setTimeout(checkStatus, 2000)
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ 部署失败: ${result.message}` 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ 请求失败: ${error}` 
      })
    } finally {
      setDeploying(false)
    }
  }

  const cleanupScripts = async () => {
    try {
      setDeploying(true)
      setMessage(null)

      const response = await fetch(`/api/hybrid-deploy?shop=${shop}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${result.message}` 
        })
        setTimeout(checkStatus, 2000)
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ 清理失败: ${result.message}` 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ 请求失败: ${error}` 
      })
    } finally {
      setDeploying(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-800 bg-green-50 border-green-200'
      case 'partial': return 'text-yellow-800 bg-yellow-50 border-yellow-200'
      case 'inactive': return 'text-red-800 bg-red-50 border-red-200'
      default: return 'text-gray-800 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🎉'
      case 'partial': return '⚠️'
      case 'inactive': return '❌'
      default: return 'ℹ️'
    }
  }

  return (
    <>
      <Head>
        <title>PreOrder Pro - 混合模式管理</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🧩 PreOrder Pro 混合模式
            </h1>

            <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-orange-800 mb-3">
                🎯 混合模式 - 最大覆盖率方案
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-orange-700 mb-2">🚀 双重保障</h3>
                  <ul className="text-orange-600 space-y-1">
                    <li>• App Embed Block (现代化方案)</li>
                    <li>• Script Tags (兜底保障)</li>
                    <li>• 智能检测切换</li>
                    <li>• 防重复加载</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-2">✅ 优势特性</h3>
                  <ul className="text-blue-600 space-y-1">
                    <li>• 99.9% 覆盖率保障</li>
                    <li>• 自动故障转移</li>
                    <li>• 兼容所有主题</li>
                    <li>• 专业级稳定性</li>
                  </ul>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : message.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                {message.text}
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">检查混合模式状态中...</p>
              </div>
            )}

            {status && (
              <div className="space-y-6">
                {/* 状态概览 */}
                <div className={`border rounded-lg p-6 ${getStatusColor(status.status)}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{getStatusIcon(status.status)}</span>
                    <div>
                      <h3 className="text-xl font-bold">
                        混合模式状态: {status.status === 'active' ? '完全激活' : status.status === 'partial' ? '部分激活' : '未激活'}
                      </h3>
                      <p className="text-sm opacity-75">
                        商店: {status.shop} | 检查时间: {new Date(status.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 详细状态 */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* App Embed Block 状态 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      🎨 App Embed Block
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">状态:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status.appEmbedActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status.appEmbedActive ? '✅ 已激活' : '❌ 未激活'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {status.appEmbedActive 
                          ? '现代化方案运行中，提供最佳用户体验'
                          : '需要通过 Shopify CLI 部署: shopify app deploy'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Script Tag 状态 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      📜 Script Tags
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">状态:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status.scriptTagActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status.scriptTagActive ? '✅ 已激活' : '❌ 未激活'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {status.scriptTagActive 
                          ? '兜底方案运行中，确保 100% 覆盖率'
                          : '备用方案未激活，点击部署按钮激活'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* 建议和推荐 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 系统建议</h3>
                  <div className="space-y-2">
                    {status.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-blue-700 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={deployHybridMode}
                    disabled={deploying}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    {deploying ? '部署中...' : '🚀 部署混合模式'}
                  </button>

                  <button
                    onClick={checkStatus}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    {loading ? '检查中...' : '🔄 刷新状态'}
                  </button>

                  <button
                    onClick={cleanupScripts}
                    disabled={deploying}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    {deploying ? '清理中...' : '🗑️ 清理脚本'}
                  </button>
                </div>

                {/* 测试链接 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">🧪 测试预购功能</h3>
                  <div className="space-y-4">
                    <p className="text-green-700 text-sm">
                      部署完成后，访问以下链接测试混合模式是否正常工作：
                    </p>
                    <div className="space-y-2">
                      <a
                        href={`https://${shop}/products/test-01?variant=46938889552121`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition-colors"
                      >
                        🔗 测试产品页面
                      </a>
                    </div>
                    <div className="bg-green-100 p-3 rounded text-xs text-green-800">
                      <strong>预期效果：</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• "Sold out" 按钮被隐藏</li>
                        <li>• 显示橙色"立即预订"按钮</li>
                        <li>• 点击按钮显示混合模式成功消息</li>
                        <li>• 浏览器控制台显示混合模式日志</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center space-x-4">
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
