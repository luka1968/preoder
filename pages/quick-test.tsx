import { useState, useEffect } from 'react'

interface Product {
  id: string
  title: string
  variants: Array<{
    id: string
    title: string
    price: string
    inventory_quantity: number
  }>
}

export default function QuickTestPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [email, setEmail] = useState('test@example.com')
  const [name, setName] = useState('Test User')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)

  const shop = 'arivi-shop.myshopify.com'

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch(`/api/get-products?shop=${shop}`)
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products)
        if (data.products.length > 0) {
          setSelectedProduct(data.products[0].id)
          if (data.products[0].variants.length > 0) {
            setSelectedVariant(data.products[0].variants[0].id)
          }
        }
      }
    } catch (error) {
      console.error('加载产品失败:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const currentProduct = products.find(p => p.id === selectedProduct)

  const testCreatePreorder = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/preorder/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          productId: selectedProduct,
          variantId: selectedVariant,
          email,
          name
        })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">快速测试预购 API</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">选择产品和变体</h2>
          
          {loadingProducts ? (
            <p className="text-gray-600">加载产品中...</p>
          ) : products.length === 0 ? (
            <p className="text-red-600">没有找到产品</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择产品
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value)
                    const product = products.find(p => p.id === e.target.value)
                    if (product && product.variants.length > 0) {
                      setSelectedVariant(product.variants[0].id)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </div>

              {currentProduct && currentProduct.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择变体
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {currentProduct.variants.map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {variant.title} - ${variant.price} (库存: {variant.inventory_quantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                onClick={testCreatePreorder}
                disabled={loading || !selectedProduct || !selectedVariant}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '测试中...' : '测试创建预购'}
              </button>
            </div>
          )}
        </div>

        {result && (
          <div className={`shadow rounded-lg p-6 mb-6 ${
            result.data?.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className="text-xl font-bold mb-4">
              {result.data?.success ? '✅ 测试成功！' : '❌ 测试失败'}
            </h2>
            {result.data?.preorder?.draftOrderId && (
              <div className="mb-4">
                <p className="text-green-700 font-medium">Draft Order 已创建！</p>
                <p className="text-sm text-gray-600">ID: {result.data.preorder.draftOrderId}</p>
                <p className="text-sm text-gray-600">Name: {result.data.preorder.draftOrderName}</p>
                <a
                  href={`https://${shop}/admin/draft_orders/${result.data.preorder.draftOrderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  在 Shopify 后台查看 →
                </a>
              </div>
            )}
            <details>
              <summary className="cursor-pointer text-sm text-gray-600">查看完整响应</summary>
              <pre className="mt-2 bg-white p-4 rounded overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">📝 说明</h3>
          <p className="text-sm text-blue-800">
            这个工具会自动加载你店铺的产品列表，选择一个产品和变体后，点击测试按钮即可测试预购功能。
            如果成功，你应该能在 Shopify 后台的 Orders → Drafts 中看到新订单。
          </p>
        </div>
      </div>
    </div>
  )
}
