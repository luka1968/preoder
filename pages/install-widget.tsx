import { useState } from 'react'
import Layout from '../components/Layout'

export default function InstallWidget() {
  const [shopDomain, setShopDomain] = useState('')
  const [copied, setCopied] = useState(false)

  const generateInstallCode = () => {
    if (!shopDomain) return ''
    
    const cleanDomain = shopDomain.replace('.myshopify.com', '').replace('https://', '').replace('http://', '')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'
    
    return `<!-- PreOrder Pro - 通用预购插件 -->
<script src="${appUrl}/api/widget/inject?shop=${cleanDomain}.myshopify.com"></script>`
  }

  const copyToClipboard = () => {
    const code = generateInstallCode()
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🚀 PreOrder Pro - 通用安装
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              ✅ 无需修改主题代码！
            </h2>
            <p className="text-green-700">
              我们的通用widget会自动适配所有Shopify主题，无需手动修改任何代码。
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入你的Shopify商店域名
              </label>
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="例如: your-shop.myshopify.com 或 your-shop"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {shopDomain && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  复制以下代码到你的主题
                </label>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{generateInstallCode()}
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className={`absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                      copied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {copied ? '已复制!' : '复制'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📋 安装步骤
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700">
                <li>在上面输入你的商店域名</li>
                <li>复制生成的代码</li>
                <li>进入Shopify Admin → Online Store → Themes → Actions → Edit code</li>
                <li>找到 <code className="bg-blue-100 px-1 rounded">theme.liquid</code> 文件</li>
                <li>在 <code className="bg-blue-100 px-1 rounded">&lt;/head&gt;</code> 标签前粘贴代码</li>
                <li>保存文件</li>
                <li>访问任何售罄的产品页面查看效果</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                🎯 功能特点
              </h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li><strong>自动检测售罄状态</strong> - 支持所有主题的售罄按钮</li>
                <li><strong>智能按钮替换</strong> - 将"Sold out"按钮替换为预购按钮</li>
                <li><strong>预购徽章</strong> - 自动在产品图片上添加预购标识</li>
                <li><strong>响应式设计</strong> - 完美适配桌面和移动设备</li>
                <li><strong>多语言支持</strong> - 支持中英文界面</li>
                <li><strong>无主题依赖</strong> - 适配所有Shopify主题</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🧪 测试你的安装
              </h3>
              <p className="text-gray-600 mb-3">
                安装完成后，访问以下链接测试预购功能：
              </p>
              {shopDomain && (
                <div className="bg-white border rounded p-3">
                  <code className="text-sm text-blue-600">
                    https://{shopDomain.replace('.myshopify.com', '')}.myshopify.com/products/test-01?variant=46938889552121
                  </code>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                需要帮助？查看我们的 
                <a href="/support" className="text-orange-600 hover:text-orange-700 font-medium">
                  技术支持
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
