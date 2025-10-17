import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

export default function AppEmbedSetup() {
  const router = useRouter()
  const { shop } = router.query
  const [embedStatus, setEmbedStatus] = useState<'checking' | 'enabled' | 'disabled'>('checking')
  const [currentTheme, setCurrentTheme] = useState<string>('')

  useEffect(() => {
    if (shop) {
      checkEmbedStatus()
    }
  }, [shop])

  const checkEmbedStatus = async () => {
    try {
      // 这里可以调用API检查App Embed状态
      // 暂时模拟检查逻辑
      setTimeout(() => {
        setEmbedStatus('disabled') // 假设未启用
        setCurrentTheme('Dawn') // 假设当前主题
      }, 1000)
    } catch (error) {
      console.error('Error checking embed status:', error)
    }
  }

  const getThemeEditorUrl = () => {
    if (!shop) return '#'
    return `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || 'your-app-id'}/preorder-embed`
  }

  const openThemeEditor = () => {
    const url = getThemeEditorUrl()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (embedStatus === 'checking') {
    return (
      <Layout shop={shop as string}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">检查 App Embed 状态...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout shop={shop as string}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧱 App Embed Block 设置
          </h1>

          {embedStatus === 'enabled' ? (
            // 已启用状态
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-green-800">
                    ✅ App Embed 已启用！
                  </h2>
                  <p className="text-green-600">
                    PreOrder Pro 正在你的商店中正常运行
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <a
                  href={`https://${shop}/products/test-01?variant=46938889552121`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🧪 测试预购功能
                </a>
              </div>
            </div>
          ) : (
            // 未启用状态
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-yellow-800">
                      ⚠️ 需要启用 App Embed
                    </h2>
                    <p className="text-yellow-600">
                      PreOrder Pro 需要在主题中启用才能正常工作
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🎯 一键启用指南
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">点击下面的按钮</p>
                      <p className="text-blue-600 text-sm">自动跳转到主题编辑器的 App Embeds 设置</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">找到 "PreOrder Pro" 并点击启用</p>
                      <p className="text-blue-600 text-sm">只需要点击一次开关即可</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">保存并测试</p>
                      <p className="text-blue-600 text-sm">预购功能将立即在你的商店中生效</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={openThemeEditor}
                    className="w-full bg-orange-600 text-white px-6 py-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg"
                  >
                    🚀 一键跳转到主题编辑器启用 App Embed
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 技术说明
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                  <li><strong>安全性</strong>：App Embed Block 是 Shopify 官方推荐的安全注入方式</li>
                  <li><strong>兼容性</strong>：自动适配所有 Shopify 2.0 主题</li>
                  <li><strong>无侵入</strong>：不修改主题文件，卸载应用时自动清理</li>
                  <li><strong>自动更新</strong>：应用更新后功能自动生效，无需重新启用</li>
                  <li><strong>性能优化</strong>：脚本异步加载，不影响页面加载速度</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  ✨ 启用后你将获得
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-700">自动检测售罄商品</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-700">智能替换售罄按钮</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-700">预购徽章自动显示</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-700">响应式设计适配</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-700">中英文界面支持</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-700">完整的预购流程</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
