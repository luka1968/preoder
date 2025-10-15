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
            <div className="space-x-4">
              <button
                onClick={navigateToProducts}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                🚀 开始使用预购功能
              </button>
              
              <button
                onClick={navigateToTest}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                🧪 测试预购功能
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              点击上方按钮开始配置您的预购功能
            </p>
          </div>

          {/* Installation Guide */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">🔧 快速安装指南</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">1. 添加脚本到主题</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm">
                    &lt;script src="https://shopmall.dpdns.org/shopify-integration.js"&gt;&lt;/script&gt;
                  </code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  将此脚本添加到主题的 theme.liquid 文件中
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">2. 测试预购功能</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 访问任意缺货商品页面</li>
                  <li>• 查看预购按钮和徽章</li>
                  <li>• 测试预购表单提交</li>
                  <li>• 验证邮件通知功能</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
