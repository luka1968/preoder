import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { Switch } from '@headlessui/react'
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  TagIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: string
  title: string
  handle: string
  vendor: string
  status: string
  variants: Array<{
    id: string
    title: string
    inventory_quantity: number
  }>
  images: Array<{
    src: string
    alt?: string
  }>
  preorder_config?: {
    enabled: boolean
  }
}

interface BulkConfig {
  enabled: boolean
  preorder_type: 'out_of_stock' | 'always' | 'coming_soon'
  custom_button_text: string
  custom_badge_text: string
  badge_color: string
  auto_tag_orders: boolean
  order_tag: string
  estimated_delivery_date: string
  delivery_note: string
}

export default function BulkConfigPage() {
  const router = useRouter()
  const { shop } = router.query
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [config, setConfig] = useState<BulkConfig>({
    enabled: true,
    preorder_type: 'out_of_stock',
    custom_button_text: 'Pre-Order Now',
    custom_badge_text: 'Pre-Order',
    badge_color: '#ff6b35',
    auto_tag_orders: true,
    order_tag: 'preorder',
    estimated_delivery_date: '',
    delivery_note: ''
  })

  useEffect(() => {
    if (shop) {
      fetchProducts()
    }
  }, [shop])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?shop=${shop}&limit=100`)
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

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleApplyConfig = async () => {
    if (selectedProducts.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one product' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/products?shop=${shop}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_ids: Array.from(selectedProducts),
          config
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ type: 'success', text: result.message })
        
        // Refresh products to show updated configurations
        await fetchProducts()
        setSelectedProducts(new Set())
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to apply configuration')
      }
    } catch (error) {
      console.error('Error applying bulk configuration:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to apply configuration' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Bulk Configuration - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Bulk Configuration - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Configuration</h1>
        <p className="text-gray-600">Apply pre-order settings to multiple products at once</p>
      </div>

      {message && (
        <div className={`mb-6 rounded-md p-4 ${
          message.type === 'success' ? 'bg-success-50 text-success-800' : 'bg-error-50 text-error-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckIcon className="h-5 w-5 text-success-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-error-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Select Products ({selectedProducts.size} selected)
                </h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="px-6 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].src}
                          alt={product.images[0].alt || product.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <TagIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.vendor} • {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {product.preorder_config?.enabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pre-order enabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Configuration Settings</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Enable Pre-orders */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-base font-medium text-gray-900">
                  Enable Pre-orders
                </label>
                <p className="text-sm text-gray-500">
                  Enable pre-order functionality for selected products
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onChange={(checked) => setConfig({ ...config, enabled: checked })}
                className={`${
                  config.enabled ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    config.enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </div>

            {config.enabled && (
              <>
                {/* Pre-order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pre-order Trigger
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'out_of_stock', label: 'When Out of Stock', description: 'Show pre-order when inventory is zero' },
                      { value: 'always', label: 'Always Available', description: 'Always show pre-order option' },
                      { value: 'coming_soon', label: 'Coming Soon', description: 'Show pre-order for upcoming products' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={option.value}
                            name="preorder_type"
                            type="radio"
                            checked={config.preorder_type === option.value}
                            onChange={() => setConfig({ ...config, preorder_type: option.value as any })}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={option.value} className="font-medium text-gray-700">
                            {option.label}
                          </label>
                          <p className="text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Text */}
                <div>
                  <label htmlFor="button_text" className="block text-sm font-medium text-gray-700">
                    Button Text
                  </label>
                  <input
                    type="text"
                    id="button_text"
                    value={config.custom_button_text}
                    onChange={(e) => setConfig({ ...config, custom_button_text: e.target.value })}
                    className="mt-1 form-input"
                    placeholder="Pre-Order Now"
                  />
                </div>

                {/* Badge Text */}
                <div>
                  <label htmlFor="badge_text" className="block text-sm font-medium text-gray-700">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    id="badge_text"
                    value={config.custom_badge_text}
                    onChange={(e) => setConfig({ ...config, custom_badge_text: e.target.value })}
                    className="mt-1 form-input"
                    placeholder="Pre-Order"
                  />
                </div>

                {/* Badge Color */}
                <div>
                  <label htmlFor="badge_color" className="block text-sm font-medium text-gray-700">
                    Badge Color
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <input
                      type="color"
                      id="badge_color"
                      value={config.badge_color}
                      onChange={(e) => setConfig({ ...config, badge_color: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={config.badge_color}
                      onChange={(e) => setConfig({ ...config, badge_color: e.target.value })}
                      className="form-input"
                      placeholder="#ff6b35"
                    />
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    id="delivery_date"
                    value={config.estimated_delivery_date}
                    onChange={(e) => setConfig({ ...config, estimated_delivery_date: e.target.value })}
                    className="mt-1 form-input"
                  />
                </div>

                {/* Order Tagging */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Auto-tag Orders
                    </label>
                    <p className="text-sm text-gray-500">
                      Automatically tag pre-orders in Shopify
                    </p>
                  </div>
                  <Switch
                    checked={config.auto_tag_orders}
                    onChange={(checked) => setConfig({ ...config, auto_tag_orders: checked })}
                    className={`${
                      config.auto_tag_orders ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        config.auto_tag_orders ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </Switch>
                </div>

                {config.auto_tag_orders && (
                  <div>
                    <label htmlFor="order_tag" className="block text-sm font-medium text-gray-700">
                      Order Tag
                    </label>
                    <input
                      type="text"
                      id="order_tag"
                      value={config.order_tag}
                      onChange={(e) => setConfig({ ...config, order_tag: e.target.value })}
                      className="mt-1 form-input"
                      placeholder="preorder"
                    />
                  </div>
                )}
              </>
            )}

            {/* Apply Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleApplyConfig}
                disabled={saving || selectedProducts.size === 0}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <CogIcon className="h-4 w-4" />
                <span>
                  {saving 
                    ? 'Applying Configuration...' 
                    : `Apply to ${selectedProducts.size} Product${selectedProducts.size !== 1 ? 's' : ''}`
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
