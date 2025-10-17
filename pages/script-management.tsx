import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

interface ScriptTag {
  id: number
  src: string
  event: string
  display_scope: string
  created_at: string
  updated_at: string
}

export default function ScriptManagement() {
  const router = useRouter()
  const { shop } = router.query
  const [scriptTags, setScriptTags] = useState<ScriptTag[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (shop) {
      fetchScriptTags()
    }
  }, [shop])

  const fetchScriptTags = async () => {
    try {
      const response = await fetch(`/api/shopify/script-tags?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setScriptTags(data.scriptTags)
      } else {
        throw new Error('Failed to fetch script tags')
      }
    } catch (error) {
      console.error('Error fetching script tags:', error)
      setMessage({ type: 'error', text: 'Failed to load script tags' })
    } finally {
      setLoading(false)
    }
  }

  const injectScript = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/shopify/script-tags?shop=${shop}`, {
        method: 'POST'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ PreOrder script injected successfully!' })
        await fetchScriptTags()
      } else {
        throw new Error('Failed to inject script')
      }
    } catch (error) {
      console.error('Error injecting script:', error)
      setMessage({ type: 'error', text: 'Failed to inject script' })
    } finally {
      setLoading(false)
    }
  }

  const removeScript = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/shopify/script-tags?shop=${shop}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ PreOrder script removed successfully!' })
        await fetchScriptTags()
      } else {
        throw new Error('Failed to remove script')
      }
    } catch (error) {
      console.error('Error removing script:', error)
      setMessage({ type: 'error', text: 'Failed to remove script' })
    } finally {
      setLoading(false)
    }
  }

  const preorderScripts = scriptTags.filter(script => 
    script.src.includes('universal-preorder.js') || 
    script.src.includes('preorder-pro-fix.vercel.app')
  )

  const otherScripts = scriptTags.filter(script => 
    !script.src.includes('universal-preorder.js') && 
    !script.src.includes('preorder-pro-fix.vercel.app')
  )

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 脚本管理 - Script Management
          </h1>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* PreOrder Scripts */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🛒 PreOrder Pro Scripts
              </h2>
              
              {preorderScripts.length > 0 ? (
                <div className="space-y-4">
                  {preorderScripts.map((script) => (
                    <div key={script.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">
                            ✅ Active PreOrder Script
                          </p>
                          <p className="text-xs text-green-600 mt-1 break-all">
                            {script.src}
                          </p>
                          <p className="text-xs text-green-500 mt-2">
                            Created: {new Date(script.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={removeScript}
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    🗑️ Remove PreOrder Script
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">
                    ⚠️ No PreOrder script found
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">
                    The PreOrder functionality may not be working on your store.
                  </p>
                  
                  <button
                    onClick={injectScript}
                    disabled={loading}
                    className="mt-3 w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    🚀 Inject PreOrder Script
                  </button>
                </div>
              )}
            </div>

            {/* Other Scripts */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📜 Other Scripts ({otherScripts.length})
              </h2>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {otherScripts.length > 0 ? (
                  otherScripts.map((script) => (
                    <div key={script.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 break-all">
                        {script.src}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {script.id} | Event: {script.event}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No other scripts found</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🎯 自动化说明
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
              <li><strong>自动注入</strong>：用户安装应用时，脚本会自动注入到商店</li>
              <li><strong>自动删除</strong>：用户卸载应用时，脚本会自动删除</li>
              <li><strong>无需手动操作</strong>：用户无需修改任何主题代码</li>
              <li><strong>通用兼容</strong>：脚本自动适配所有Shopify主题</li>
              <li><strong>智能检测</strong>：自动检测售罄状态并显示预购按钮</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href={`https://${shop}/products/test-01?variant=46938889552121`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🧪 Test PreOrder on Your Store
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
