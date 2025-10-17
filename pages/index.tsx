import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()
  const [shopParam, setShopParam] = useState('')

  useEffect(() => {
    // 获取URL参数
    const { shop, host } = router.query
    
    if (shop && typeof shop === 'string') {
      setShopParam(shop)
    }
  }, [router.query])

  const navigateToProducts = () => {
    if (shopParam) {
      router.push(`/products?shop=${shopParam}`)
    } else {
      router.push('/products')
    }
  }

  const navigateToTest = () => {
    router.push('/test-preorder')
  }

  const navigateToAppEmbed = () => {
    if (shopParam) {
      router.push(`/app-embed-setup?shop=${shopParam}`)
    } else {
      router.push('/app-embed-setup')
    }
  }

  return (
    <>
      <Head>
        <title>PreOrder Pro - Shopify预购插件</title>
        <meta name="description" content="专业的Shopify预购解决方案" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              PreOrder Pro
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              专业的Shopify预购和缺货通知解决方案
            </p>
            {shopParam && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
                ✅ 已连接到商店: <strong>{shopParam}</strong>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-4">智能预购</h3>
              <p className="text-gray-600">
                自动检测缺货商品，显示预购按钮和徽章，提升客户体验
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-4">到货通知</h3>
              <p className="text-gray-600">
                收集客户邮箱，商品到货时自动发送通知邮件
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-4">数据分析</h3>
              <p className="text-gray-600">
                跟踪预购数据，分析客户需求，优化库存管理
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="space-x-4 mb-4">
              <button
                onClick={navigateToAppEmbed}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg transition duration-300 text-lg"
              >
                🧱 一键启用 App Embed Block
              </button>
            </div>
            
            <div className="space-x-4">
              <button
                onClick={navigateToProducts}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                🚀 管理预购产品
              </button>
              
              <button
                onClick={navigateToTest}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                🧪 测试预购功能
              </button>
            </div>
            
            <p className="text-gray-500 text-sm">
              推荐：先启用 App Embed Block，然后测试预购功能
            </p>
          </div>

          {/* App Embed Guide */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">🧱 App Embed Block - 零代码集成</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-600">✨ 全新方案优势</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✅ <strong>无需修改主题代码</strong></li>
                  <li>✅ <strong>自动适配所有主题</strong></li>
                  <li>✅ <strong>用户只需一键启用</strong></li>
                  <li>✅ <strong>Shopify 官方推荐方式</strong></li>
                  <li>✅ <strong>安全且易于维护</strong></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">🚀 使用步骤</h3>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li><strong>1.</strong> 点击上方"一键启用 App Embed Block"</li>
                  <li><strong>2.</strong> 系统自动跳转到主题编辑器</li>
                  <li><strong>3.</strong> 找到 "PreOrder Pro" 并启用</li>
                  <li><strong>4.</strong> 保存设置，预购功能立即生效</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-6">
              <p className="text-center text-gray-700">
                <strong>🎯 这是目前最佳的 Shopify 应用集成方案</strong><br />
                无需技术知识，用户体验最佳，完全符合 Shopify 官方标准
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
