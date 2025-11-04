import { useState, useEffect } from 'react'

interface PreorderAnalysis {
  id: number
  created_at: string
  shop_domain: string
  product_id: string
  variant_id: string
  customer_email: string
  status: string
  has_draft_order: boolean
  draft_order_id: string | null
  draft_order_name: string | null
  shop_status: string
  has_access_token: boolean
  issues: string[]
  can_create_draft_order: boolean
}

interface DiagnosisResult {
  stats: {
    total: number
    with_draft_order: number
    without_draft_order: number
    can_fix: number
  }
  preorders: PreorderAnalysis[]
  recommendations: string[]
}

export default function FixPreordersPage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState<number | null>(null)
  const [fixResults, setFixResults] = useState<Record<number, any>>({})

  useEffect(() => {
    runDiagnosis()
  }, [])

  const runDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/diagnose-preorders')
      const data = await response.json()
      setDiagnosis(data)
    } catch (error) {
      console.error('诊断失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fixPreorder = async (preorderId: number) => {
    setFixing(preorderId)
    try {
      const response = await fetch('/api/fix-preorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preorderId })
      })

      const data = await response.json()
      
      setFixResults(prev => ({
        ...prev,
        [preorderId]: data
      }))

      if (response.ok) {
        // 重新运行诊断
        await runDiagnosis()
      }
    } catch (error: any) {
      setFixResults(prev => ({
        ...prev,
        [preorderId]: { error: error.message }
      }))
    } finally {
      setFixing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">修复预购订单</h1>
          <button
            onClick={runDiagnosis}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '诊断中...' : '重新诊断'}
          </button>
        </div>

        {diagnosis && (
          <>
            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="text-sm text-gray-600">总预购数</div>
                <div className="text-2xl font-bold">{diagnosis.stats.total}</div>
              </div>
              <div className="bg-green-50 shadow rounded-lg p-4">
                <div className="text-sm text-green-600">已有 Draft Order</div>
                <div className="text-2xl font-bold text-green-700">{diagnosis.stats.with_draft_order}</div>
              </div>
              <div className="bg-red-50 shadow rounded-lg p-4">
                <div className="text-sm text-red-600">缺少 Draft Order</div>
                <div className="text-2xl font-bold text-red-700">{diagnosis.stats.without_draft_order}</div>
              </div>
              <div className="bg-yellow-50 shadow rounded-lg p-4">
                <div className="text-sm text-yellow-600">可修复</div>
                <div className="text-2xl font-bold text-yellow-700">{diagnosis.stats.can_fix}</div>
              </div>
            </div>

            {/* 建议 */}
            {diagnosis.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">💡 建议</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  {diagnosis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 预购列表 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户邮箱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">店铺</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draft Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">问题</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {diagnosis.preorders.map((preorder) => (
                    <tr key={preorder.id} className={preorder.has_draft_order ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{preorder.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(preorder.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{preorder.customer_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>{preorder.shop_domain}</div>
                        <div className="text-xs text-gray-500">
                          {preorder.shop_status === 'found' ? (
                            <span className="text-green-600">✓ 已授权</span>
                          ) : (
                            <span className="text-red-600">✗ 未授权</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {preorder.has_draft_order ? (
                          <div>
                            <div className="text-green-600 font-medium">{preorder.draft_order_name}</div>
                            <div className="text-xs text-gray-500">ID: {preorder.draft_order_id}</div>
                          </div>
                        ) : (
                          <span className="text-red-600">未创建</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {preorder.issues.length > 0 ? (
                          <ul className="text-xs text-red-600 space-y-1">
                            {preorder.issues.map((issue, idx) => (
                              <li key={idx}>• {issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-green-600">无问题</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {preorder.can_create_draft_order && (
                          <button
                            onClick={() => fixPreorder(preorder.id)}
                            disabled={fixing === preorder.id}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            {fixing === preorder.id ? '修复中...' : '创建 Draft Order'}
                          </button>
                        )}
                        
                        {fixResults[preorder.id] && (
                          <div className="mt-2">
                            {fixResults[preorder.id].success ? (
                              <div className="text-xs text-green-600">
                                ✓ 修复成功
                                {fixResults[preorder.id].data?.admin_url && (
                                  <a
                                    href={fixResults[preorder.id].data.admin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 hover:underline"
                                  >
                                    查看订单
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-red-600">
                                ✗ {fixResults[preorder.id].error || '修复失败'}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {loading && !diagnosis && (
          <div className="text-center py-12">
            <div className="text-gray-600">正在诊断预购订单...</div>
          </div>
        )}
      </div>
    </div>
  )
}
