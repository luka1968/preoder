import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Variant {
  id: string
  title: string
  price: string
  inventory_quantity: number
  inventory_policy: string
  preorder: {
    enabled: boolean
    auto_enabled: boolean
    manual_override: boolean
    estimated_shipping_date?: string
  } | null
}

interface Product {
  id: string
  title: string
  handle: string
  variants: Variant[]
  has_preorder: boolean
  images: { src: string }[]
}

export default function ProductsPage() {
  const router = useRouter()
  const [shop, setShop] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])

  useEffect(() => {
    // 从 URL 获取 shop 参数
    const shopParam = new URLSearchParams(window.location.search).get('shop')
    if (shopParam) {
      setShop(shopParam)
      loadProducts(shopParam)
    }
  }, [])

  async function loadProducts(shopDomain: string) {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products?shop=${shopDomain}`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function togglePreorder(variantId: string, currentStatus: boolean) {
    try {
      const response = await fetch('/api/products/enable-preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop,
          variantId,
          enabled: !currentStatus
        })
      })

      if (response.ok) {
        // 重新加载产品列表
        loadProducts(shop)
      }
    } catch (error) {
      console.error('Failed to toggle preorder:', error)
    }
  }

  async function batchEnable(enabled: boolean) {
    if (selectedVariants.length === 0) {
      alert('请先选择商品')
      return
    }

    try {
      const response = await fetch('/api/products/batch-preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop,
          variantIds: selectedVariants,
          enabled
        })
      })

      if (response.ok) {
        setSelectedVariants([])
        loadProducts(shop)
      }
    } catch (error) {
      console.error('Batch operation failed:', error)
    }
  }

  function toggleSelection(variantId: string) {
    setSelectedVariants(prev =>
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    )
    onClick = {() => togglePreorder(
      variant.id,
      variant.preorder?.enabled || false
    )
  }
  className = {`toggle-btn ${variant.preorder?.enabled ? 'active' : ''}`
}
                    >
  { variant.preorder?.enabled ? 'Disable' : 'Enable' }
                    </button >
                  </div >
                </div >
              ))}
            </div >
          </div >
        ))}
      </div >

  <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        header {
          margin-bottom: 32px;
        }

        h1 {
          color: #1a202c;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #718096;
        }

        .batch-toolbar {
          background: #4299e1;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .batch-actions {
          display: flex;
          gap: 12px;
        }

        .batch-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary {
          background: white;
          color: #4299e1;
        }

        .btn-danger {
          background: #f56565;
          color: white;
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 1px solid white;
        }

        .products-grid {
          display: grid;
          gap: 24px;
        }

        .product-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .product-header {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .product-header img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-header h3 {
          color: #2d3748;
          font-size: 18px;
          margin-bottom: 8px;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-success {
          background: #c6f6d5;
          color: #22543d;
        }

        .variants-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .variant-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 6px;
        }

        .variant-info {
          flex: 1;
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .variant-title {
          font-weight: 500;
          color: #2d3748;
        }

        .variant-price {
          color: #4a5568;
        }

        .stock {
          font-size: 14px;
          color: #48bb78;
        }

        .stock.out-of-stock {
          color: #f56565;
        }

        .variant-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .preorder-status {
          display: flex;
          gap: 6px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          background: #e2e8f0;
          color: #4a5568;
        }

        .status-badge.active {
          background: #c6f6d5;
          color: #22543d;
        }

        .auto-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          background: #bee3f8;
          color: #2c5282;
        }

        .manual-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          background: #fbd38d;
          color: #7c2d12;
        }

        .toggle-btn {
          padding: 6px 16px;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          background: white;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn:hover {
          background: #f7fafc;
        }

        .toggle-btn.active {
          background: #48bb78;
          color: white;
          border-color: #48bb78;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: #4299e1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div >
  )
}
