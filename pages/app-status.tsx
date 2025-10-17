import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface AppStatus {
  shop: string
  appInstalled: boolean
  installMethod: string
  appStatus: any
  scriptStatus: any
  webhookStatus: any
  recommendations: Array<{
    type: 'success' | 'warning' | 'error'
    message: string
    action: string
  }>
}

export default function AppStatus() {
  const router = useRouter()
  const { shop } = router.query
  const [status, setStatus] = useState<AppStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (shop) {
      checkAppStatus()
    }
  }, [shop])

  const checkAppStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/check-app-status?shop=${shop}`)
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to check app status')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-800 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-800 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-800 bg-red-50 border-red-200'
      default: return 'text-gray-800 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  return (
    <>
      <Head>
        <title>PreOrder Pro - 应用状态检查</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🔍 PreOrder Pro 应用状态检查
            </h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                📋 关于手动安装的说明
              </h2>
              <p className="text-blue-700 text-sm">
                你使用了 Partner Dashboard 的手动安装链接。这种方式只安装了应用本身，
                但 <strong>App Embed Blocks 需要单独部署</strong>。下面的检查结果会告诉你具体缺少什么。
              </p>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">检查应用状态中...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">❌ 检查失败</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {status && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 基本信息</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">商店域名：</span>
                      <span className="text-gray-600">{status.shop}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">安装方式：</span>
                      <span className="text-gray-600">手动安装链接</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">应用状态：</span>
                      <span className={status.appStatus.installed ? 'text-green-600' : 'text-red-600'}>
                        {status.appStatus.installed ? '✅ 已安装' : '❌ 未安装'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">API 访问：</span>
                      <span className={status.appStatus.hasAccess ? 'text-green-600' : 'text-red-600'}>
                        {status.appStatus.hasAccess ? '✅ 正常' : '❌ 无权限'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Script Tags 状态 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📜 Script Tags 状态</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">总脚本数：</span>
                      <span className="text-gray-600">{status.scriptStatus.total}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">预购脚本：</span>
                      <span className={status.scriptStatus.preorderScripts > 0 ? 'text-green-600' : 'text-red-600'}>
                        {status.scriptStatus.preorderScripts}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">状态：</span>
                      <span className={status.scriptStatus.preorderScripts > 0 ? 'text-green-600' : 'text-red-600'}>
                        {status.scriptStatus.preorderScripts > 0 ? '✅ 已配置' : '❌ 未配置'}
                      </span>
                    </div>
                  </div>
                  
                  {status.scriptStatus.scripts && status.scriptStatus.scripts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">已安装的预购脚本：</h4>
                      <div className="space-y-2">
                        {status.scriptStatus.scripts.map((script: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border text-xs">
                            <div><strong>ID:</strong> {script.id}</div>
                            <div><strong>URL:</strong> {script.src}</div>
                            <div><strong>事件:</strong> {script.event}</div>
                            <div><strong>创建时间:</strong> {new Date(script.created_at).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Webhooks 状态 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔗 Webhooks 状态</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">总 Webhooks：</span>
                      <span className="text-gray-600">{status.webhookStatus.total}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">应用 Webhooks：</span>
                      <span className="text-gray-600">{status.webhookStatus.appWebhooks}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">状态：</span>
                      <span className={status.webhookStatus.appWebhooks > 0 ? 'text-green-600' : 'text-yellow-600'}>
                        {status.webhookStatus.appWebhooks > 0 ? '✅ 已配置' : '⚠️ 部分配置'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 建议和推荐 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">💡 建议和推荐</h3>
                  {status.recommendations.map((rec, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getStatusColor(rec.type)}`}>
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">{getStatusIcon(rec.type)}</span>
                        <div>
                          <h4 className="font-semibold">{rec.message}</h4>
                          <p className="text-sm mt-1">{rec.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 解决方案 */}
                {status.scriptStatus.preorderScripts === 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-4">🔧 解决方案</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-orange-800">方案1: 使用 Script Tags（推荐，立即可用）</h4>
                        <p className="text-orange-700 text-sm mb-2">直接注入预购脚本，无需复杂配置</p>
                        <button
                          onClick={() => router.push(`/install-script?shop=${shop}`)}
                          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                        >
                          🚀 立即安装脚本
                        </button>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-orange-800">方案2: 部署 App Embed Block</h4>
                        <p className="text-orange-700 text-sm mb-2">使用 Shopify CLI 部署 App Extensions</p>
                        <div className="bg-orange-100 p-3 rounded text-xs font-mono">
                          <div>cd d:\360\git2\preoder</div>
                          <div>shopify auth login</div>
                          <div>shopify app deploy</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 text-center space-x-4">
              <button
                onClick={checkAppStatus}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 重新检查
              </button>
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
