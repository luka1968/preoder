import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function SimpleHybrid() {
  const router = useRouter()
  const { shop } = router.query
  const [message, setMessage] = useState<string>('')

  const testHybridScript = () => {
    const testUrl = `https://${shop}/products/test-01?variant=46938889552121`
    window.open(testUrl, '_blank')

    setMessage(`
🧪 测试步骤：
1. 在新打开的产品页面按 F12
2. 在 Console 中运行以下代码：

const script = document.createElement('script');
script.src = 'https://preorder.orbrother.com/hybrid-preorder.js';
document.head.appendChild(script);

3. 应该看到预购按钮出现
    `)
  }

  return (
    <>
      <Head>
        <title>PreOrder Pro - 简化混合模式</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🧩 PreOrder Pro 简化混合模式
            </h1>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-3">
                ⚠️ 配置提醒
              </h2>
              <p className="text-yellow-700">
                检测到环境变量未完全配置。为了避免服务器错误，这里提供简化版本的混合模式测试。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 手动测试 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🧪 手动测试混合模式
                </h3>

                <div className="space-y-4">
                  <p className="text-blue-700 text-sm">
                    点击下面的按钮测试混合模式脚本是否正常工作：
                  </p>

                  <button
                    onClick={testHybridScript}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    🚀 测试混合模式脚本
                  </button>

                  {message && (
                    <div className="bg-blue-100 p-4 rounded text-sm text-blue-800 whitespace-pre-line">
                      {message}
                    </div>
                  )}
                </div>
              </div>

              {/* 配置说明 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  ⚙️ 完整配置步骤
                </h3>

                <div className="space-y-3 text-sm text-green-700">
                  <div>
                    <strong>1. 创建 .env.local 文件</strong>
                    <p>在项目根目录创建环境变量文件</p>
                  </div>

                  <div>
                    <strong>2. 配置必要变量</strong>
                    <p>添加 Shopify API 密钥和 Supabase 配置</p>
                  </div>

                  <div>
                    <strong>3. 重新部署</strong>
                    <p>git push 后等待 Vercel 重新部署</p>
                  </div>

                  <div>
                    <strong>4. 访问完整版</strong>
                    <p>配置完成后可访问完整的混合模式管理页面</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">
                🔧 临时解决方案
              </h3>

              <p className="text-orange-700 mb-4">
                在完整配置环境变量之前，你可以使用以下方法快速测试预购功能：
              </p>

              <div className="bg-orange-100 p-4 rounded font-mono text-sm text-orange-800">
                {`// 在产品页面控制台运行：
const script = document.createElement('script');
script.src = 'https://preorder.orbrother.com/hybrid-preorder.js';
script.onload = () => console.log('混合模式脚本加载成功');
document.head.appendChild(script);`}
              </div>
            </div>

            <div className="mt-6 text-center space-x-4">
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
