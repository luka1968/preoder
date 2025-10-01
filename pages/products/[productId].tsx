import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { Switch } from '@headlessui/react'
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CogIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface ProductConfig {
  id?: string
  shop_id: string
  product_id: string
  enabled: boolean
  preorder_type: 'out_of_stock' | 'always' | 'coming_soon'
  preorder_start_date?: string
  preorder_end_date?: string
  estimated_delivery_date?: string
  delivery_note?: string
  custom_button_text?: string
  custom_badge_text?: string
  badge_color?: string
  allow_partial_payment: boolean
  partial_payment_percentage: number
  auto_tag_orders: boolean
  order_tag: string
  variants_config: Record<string, any>
}

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  variants: Array<{
    id: string
    title: string
    inventory_quantity: number
    inventory_policy: string
    price: string
  }>
  images: Array<{
    src: string
    alt?: string
  }>
}

export default function ProductConfig() {
  const router = useRouter()
  const { productId, shop } = router.query
  const [config, setConfig] = useState<ProductConfig | null>(null)
  const [product, setProduct] = useState<ShopifyProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (productId && shop) {
      fetchProductConfig()
    }
  }, [productId, shop])

  const fetchProductConfig = async () => {
    try {
      const response = await fetch(`/api/preorder/product/${productId}?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        setProduct(data.shopifyProduct)
      } else {
        throw new Error('Failed to fetch product configuration')
      }
    } catch (error) {
      console.error('Error fetching product config:', error)
      setMessage({ type: 'error', text: 'Failed to load product configuration' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/preorder/product/${productId}?shop=${shop}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        const updatedConfig = await response.json()
        setConfig(updatedConfig)
        setMessage({ type: 'success', text: 'Product configuration saved successfully!' })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage({ type: 'error', text: 'Failed to save configuration' })
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: keyof ProductConfig, value: any) => {
    if (!config) return
    setConfig({ ...config, [key]: value })
  }

  const updateVariantConfig = (variantId: string, variantConfig: any) => {
    if (!config) return
    setConfig({
      ...config,
      variants_config: {
        ...config.variants_config,
        [variantId]: variantConfig
      }
    })
  }

  if (loading) {
    return (
      <Layout title="Product Configuration - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (!config || !product) {
    return (
      <Layout title="Product Configuration - PreOrder Pro" shop={shop as string}>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Product not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Unable to load product configuration.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`${product.title} - PreOrder Pro`} shop={shop as string}>
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          {product.images?.[0] && (
            <img 
              src={product.images[0].src} 
              alt={product.images[0].alt || product.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
            <p className="text-sm text-gray-600">Configure pre-order settings for this product</p>
          </div>
        </div>
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', name: 'General Settings', icon: CogIcon },
            { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
            { id: 'variants', name: 'Variants', icon: TagIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Enable Pre-order */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <label className="text-base font-medium text-gray-900">
                      Enable Pre-orders for this Product
                    </label>
                    <p className="text-sm text-gray-500">
                      Allow customers to pre-order this product when conditions are met
                    </p>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onChange={(checked) => updateConfig('enabled', checked)}
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
              </div>
            </div>

            {config.enabled && (
              <>
                {/* Pre-order Type */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Pre-order Trigger
                    </h3>
                    <div className="space-y-4">
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
                              onChange={() => updateConfig('preorder_type', option.value)}
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
                </div>

                {/* Button & Badge Customization */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Button & Badge Customization
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="custom_button_text" className="block text-sm font-medium text-gray-700">
                          Button Text
                        </label>
                        <input
                          type="text"
                          id="custom_button_text"
                          value={config.custom_button_text || ''}
                          onChange={(e) => updateConfig('custom_button_text', e.target.value)}
                          className="mt-1 form-input"
                          placeholder="Pre-Order Now"
                        />
                      </div>

                      <div>
                        <label htmlFor="custom_badge_text" className="block text-sm font-medium text-gray-700">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          id="custom_badge_text"
                          value={config.custom_badge_text || ''}
                          onChange={(e) => updateConfig('custom_badge_text', e.target.value)}
                          className="mt-1 form-input"
                          placeholder="Pre-Order"
                        />
                      </div>

                      <div>
                        <label htmlFor="badge_color" className="block text-sm font-medium text-gray-700">
                          Badge Color
                        </label>
                        <div className="mt-1 flex items-center space-x-3">
                          <input
                            type="color"
                            id="badge_color"
                            value={config.badge_color || '#ff6b35'}
                            onChange={(e) => updateConfig('badge_color', e.target.value)}
                            className="h-10 w-20 border border-gray-300 rounded-md"
                          />
                          <input
                            type="text"
                            value={config.badge_color || '#ff6b35'}
                            onChange={(e) => updateConfig('badge_color', e.target.value)}
                            className="form-input"
                            placeholder="#ff6b35"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Delivery Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="estimated_delivery_date" className="block text-sm font-medium text-gray-700">
                          Estimated Delivery Date
                        </label>
                        <input
                          type="date"
                          id="estimated_delivery_date"
                          value={config.estimated_delivery_date || ''}
                          onChange={(e) => updateConfig('estimated_delivery_date', e.target.value)}
                          className="mt-1 form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="delivery_note" className="block text-sm font-medium text-gray-700">
                          Delivery Note
                        </label>
                        <textarea
                          id="delivery_note"
                          rows={3}
                          value={config.delivery_note || ''}
                          onChange={(e) => updateConfig('delivery_note', e.target.value)}
                          className="mt-1 form-textarea"
                          placeholder="Additional delivery information for customers..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && config.enabled && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Pre-order Schedule
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="preorder_start_date" className="block text-sm font-medium text-gray-700">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="preorder_start_date"
                    value={config.preorder_start_date || ''}
                    onChange={(e) => updateConfig('preorder_start_date', e.target.value)}
                    className="mt-1 form-input"
                  />
                  <p className="mt-1 text-sm text-gray-500">When pre-orders should begin</p>
                </div>

                <div>
                  <label htmlFor="preorder_end_date" className="block text-sm font-medium text-gray-700">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="preorder_end_date"
                    value={config.preorder_end_date || ''}
                    onChange={(e) => updateConfig('preorder_end_date', e.target.value)}
                    className="mt-1 form-input"
                  />
                  <p className="mt-1 text-sm text-gray-500">When pre-orders should end</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === 'variants' && config.enabled && product.variants && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Variant-Specific Settings
              </h3>
              <div className="space-y-6">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{variant.title}</h4>
                        <p className="text-sm text-gray-500">
                          Price: ${variant.price} | Inventory: {variant.inventory_quantity}
                        </p>
                      </div>
                      <Switch
                        checked={config.variants_config[variant.id]?.enabled ?? true}
                        onChange={(checked) => updateVariantConfig(variant.id, {
                          ...config.variants_config[variant.id],
                          enabled: checked
                        })}
                        className={`${
                          (config.variants_config[variant.id]?.enabled ?? true) ? 'bg-primary-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            (config.variants_config[variant.id]?.enabled ?? true) ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                    </div>
                    
                    {(config.variants_config[variant.id]?.enabled ?? true) && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Custom Button Text
                          </label>
                          <input
                            type="text"
                            value={config.variants_config[variant.id]?.custom_button_text || ''}
                            onChange={(e) => updateVariantConfig(variant.id, {
                              ...config.variants_config[variant.id],
                              custom_button_text: e.target.value
                            })}
                            className="mt-1 form-input"
                            placeholder="Use product default"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Delivery Date
                          </label>
                          <input
                            type="date"
                            value={config.variants_config[variant.id]?.estimated_delivery_date || ''}
                            onChange={(e) => updateVariantConfig(variant.id, {
                              ...config.variants_config[variant.id],
                              estimated_delivery_date: e.target.value
                            })}
                            className="mt-1 form-input"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </Layout>
  )
}
