import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function DebugPreorder() {
  const router = useRouter()
  const { shop } = router.query
  const [debugInfo, setDebugInfo] = useState<string>('')

  const testUrls = [
    'https://arivi-shop.myshopify.com/products/test-01?variant=46938889552121',
    'https://arivi-shop.myshopify.com/products/test-01'
  ]

  const debugScript = `
    // 在页面中添加调试脚本
    const script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'}/debug-preorder.js';
    script.onload = function() {
      console.log('✅ 调试脚本加载成功');
    };
    document.head.appendChild(script);
  `

  return (
    <>
      <Head>
        <title>PreOrder Pro - 调试工具</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🔍 PreOrder Pro 调试工具
            </h1>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ 预购按钮不显示问题诊断
              </h2>
              <p className="text-yellow-700">
                如果你的商店中预购按钮没有显示，请按照以下步骤进行诊断：
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 快速测试 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🧪 快速测试
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      1. 在浏览器中打开你的产品页面
                    </label>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      2. 在浏览器控制台中运行调试脚本
                    </label>
                    <textarea
                      className="w-full h-24 p-3 border border-blue-300 rounded bg-blue-100 text-blue-800 font-mono text-sm"
                      value={debugScript}
                      readOnly
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      点击上方文本框选中代码，然后复制到浏览器控制台运行
                    </p>
                  </div>
                </div>
              </div>

              {/* 常见问题 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">
                  🚨 常见问题和解决方案
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-red-700">问题1: App Embed Block 未启用</h4>
                    <p className="text-red-600">
                      <strong>解决:</strong> 进入 Shopify Admin → Online Store → Themes → Customize → App Embeds → 启用 PreOrder Pro
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700">问题2: 脚本缓存问题</h4>
                    <p className="text-red-600">
                      <strong>解决:</strong> 清除浏览器缓存，或使用无痕模式测试
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700">问题3: 应用需要重新安装</h4>
                    <p className="text-red-600">
                      <strong>解决:</strong> 卸载应用后重新安装，确保最新版本生效
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700">问题4: 主题不兼容</h4>
                    <p className="text-red-600">
                      <strong>解决:</strong> 使用调试工具检查主题结构，可能需要手动适配
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ 推荐解决步骤
              </h3>
              
              <ol className="list-decimal list-inside space-y-2 text-green-700">
                <li><strong>重新安装应用</strong> - 这通常能解决大部分问题</li>
                <li><strong>启用 App Embed Block</strong> - 确保在主题中启用了预购功能</li>
                <li><strong>清除缓存</strong> - 刷新浏览器缓存</li>
                <li><strong>使用调试工具</strong> - 运行上面的调试脚本查看详细信息</li>
                <li><strong>检查产品状态</strong> - 确保产品确实是售罄状态</li>
              </ol>
            </div>

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📞 需要帮助？
              </h3>
              
              <p className="text-gray-600 mb-4">
                如果以上步骤都无法解决问题，请提供以下信息：
              </p>
              
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>商店域名: {shop || 'arivi-shop.myshopify.com'}</li>
                <li>产品链接: 具体的产品页面URL</li>
                <li>浏览器控制台的错误信息</li>
                <li>调试工具的输出结果</li>
                <li>是否重新安装过应用</li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回应用
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
