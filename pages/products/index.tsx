import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthenticatedFetch } from '../../hooks/useSessionToken'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  CogIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: string
  title: string
  handle: string
  vendor: string
  product_type: string
  status: string
  variants: Array<{
    id: string
    title: string
    inventory_quantity: number
    price: string
  }>
  images: Array<{
    src: string
    alt?: string
  }>
  preorder_config?: {
    enabled: boolean
    preorder_type: string
    estimated_delivery_date?: string
  }
}

export default function ProductsPage() {
  const router = useRouter()
  const { shop } = router.query
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'preorder' | 'normal'>('all')

  useEffect(() => {
    if (shop) {
      fetchProducts()
    }
  }, [shop])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    switch (filter) {
      case 'preorder':
        return product.preorder_config?.enabled
      case 'normal':
        return !product.preorder_config?.enabled
      default:
        return true
    }
  })

  const getProductStatus = (product: Product) => {
    if (!product.preorder_config?.enabled) return 'normal'
    
    const outOfStock = product.variants.every(v => v.inventory_quantity <= 0)
    const type = product.preorder_config.preorder_type

    if (type === 'always') return 'preorder'
    if (type === 'out_of_stock' && outOfStock) return 'preorder'
    if (type === 'coming_soon') return 'coming_soon'
    
    return 'normal'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preorder':
        return <span className="badge badge-warning">Pre-Order</span>
      case 'coming_soon':
        return <span className="badge badge-info">Coming Soon</span>
      default:
        return <span className="badge badge-success">Normal</span>
    }
  }

  if (loading) {
    return (
      <Layout title="Products - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Products - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage pre-order settings for your products</p>
          </div>
          <Link 
            href={`/products/bulk-config?shop=${shop}`}
            className="btn-secondary flex items-center space-x-2"
          >
            <CogIcon className="h-4 w-4" />
            <span>Bulk Configure</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All Products' },
              { value: 'preorder', label: 'Pre-Order Enabled' },
              { value: 'normal', label: 'Normal Products' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Try adjusting your search terms.' : 'No products match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map((product) => {
            const status = getProductStatus(product)
            const totalInventory = product.variants.reduce((sum, v) => sum + v.inventory_quantity, 0)
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].src}
                          alt={product.images[0].alt || product.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <TagIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.vendor} • {product.product_type}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-600">
                              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm text-gray-600">
                              Inventory: {totalInventory}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(status)}
                        </div>
                      </div>

                      {/* Pre-order Info */}
                      {product.preorder_config?.enabled && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-md">
                          <div className="flex items-center space-x-2 text-sm">
                            <ClockIcon className="h-4 w-4 text-orange-500" />
                            <span className="text-orange-700 font-medium">
                              Pre-order enabled ({product.preorder_config.preorder_type.replace('_', ' ')})
                            </span>
                          </div>
                          {product.preorder_config.estimated_delivery_date && (
                            <p className="text-sm text-orange-600 mt-1">
                              Estimated delivery: {new Date(product.preorder_config.estimated_delivery_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/products/${product.id}?shop=${shop}`}
                            className="btn-secondary text-sm"
                          >
                            Configure
                          </Link>
                          <a
                            href={`https://${shop}/admin/products/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            View in Shopify
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination would go here if needed */}
    </Layout>
  )
}
