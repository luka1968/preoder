import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { Switch } from '@headlessui/react'
import { 
  CheckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface PreorderSettings {
  id: string
  enabled: boolean
  button_text: string
  badge_text: string
  badge_color: string
  show_estimated_date: boolean
  allow_partial_payment: boolean
  partial_payment_percentage: number
  auto_tag_orders: boolean
  order_tag: string
  // Frontend-only for now (not persisted yet): icon display preferences
  show_icons?: boolean
  icon_size?: 'small' | 'medium' | 'large'
}

export default function Settings() {
  const router = useRouter()
  const { shop } = router.query
  const [settings, setSettings] = useState<PreorderSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (shop) {
      fetchSettings()
    }
  }, [shop])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/preorder/config?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        throw new Error('Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/preorder/config?shop=${shop}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof PreorderSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <Layout title="Settings - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (!settings) {
    return (
      <Layout title="Settings - PreOrder Pro" shop={shop as string}>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No settings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Unable to load preorder settings for your shop.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Settings - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure your pre-order and back-in-stock notification settings
        </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              General Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <label className="text-base font-medium text-gray-900">
                    Enable Pre-orders
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow customers to place pre-orders for out-of-stock items
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onChange={(checked) => updateSetting('enabled', checked)}
                  className={`${
                    settings.enabled ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <label className="text-base font-medium text-gray-900">
                    Auto-tag Orders
                  </label>
                  <p className="text-sm text-gray-500">
                    Automatically tag pre-orders in Shopify admin
                  </p>
                </div>
                <Switch
                  checked={settings.auto_tag_orders}
                  onChange={(checked) => updateSetting('auto_tag_orders', checked)}
                  className={`${
                    settings.auto_tag_orders ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.auto_tag_orders ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>

              {settings.auto_tag_orders && (
                <div>
                  <label htmlFor="order_tag" className="block text-sm font-medium text-gray-700">
                    Order Tag
                  </label>
                  <input
                    type="text"
                    id="order_tag"
                    value={settings.order_tag}
                    onChange={(e) => updateSetting('order_tag', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="preorder"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Button & Badge Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Button & Badge Settings
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="button_text" className="block text-sm font-medium text-gray-700">
                  Button Text
                </label>
                <input
                  type="text"
                  id="button_text"
                  value={settings.button_text}
                  onChange={(e) => updateSetting('button_text', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Pre-Order Now"
                />
              </div>

              <div>
                <label htmlFor="badge_text" className="block text-sm font-medium text-gray-700">
                  Badge Text
                </label>
                <input
                  type="text"
                  id="badge_text"
                  value={settings.badge_text}
                  onChange={(e) => updateSetting('badge_text', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                    value={settings.badge_color}
                    onChange={(e) => updateSetting('badge_color', e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={settings.badge_color}
                    onChange={(e) => updateSetting('badge_color', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="#ff6b35"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Payment Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <label className="text-base font-medium text-gray-900">
                    Allow Partial Payments
                  </label>
                  <p className="text-sm text-gray-500">
                    Let customers pay a deposit and complete payment later
                  </p>
                </div>
                <Switch
                  checked={settings.allow_partial_payment}
                  onChange={(checked) => updateSetting('allow_partial_payment', checked)}
                  className={`${
                    settings.allow_partial_payment ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.allow_partial_payment ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>

              {settings.allow_partial_payment && (
                <div>
                  <label htmlFor="partial_payment_percentage" className="block text-sm font-medium text-gray-700">
                    Deposit Percentage
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="partial_payment_percentage"
                      min="1"
                      max="99"
                      value={settings.partial_payment_percentage}
                      onChange={(e) => updateSetting('partial_payment_percentage', parseInt(e.target.value))}
                      className="block w-full pr-12 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Display Settings
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <label className="text-base font-medium text-gray-900">
                  Show Estimated Delivery Date
                </label>
                <p className="text-sm text-gray-500">
                  Display estimated delivery dates on product pages
                </p>
              </div>
              <Switch
                checked={settings.show_estimated_date}
                onChange={(checked) => updateSetting('show_estimated_date', checked)}
                className={`${
                  settings.show_estimated_date ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.show_estimated_date ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </div>
          </div>
        </div>

        {/* Icon Settings (frontend-only for now) */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Icon Settings</h4>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <label className="text-base font-medium text-gray-900">
                  Enable Icons
                </label>
                <p className="text-sm text-gray-500">
                  Show icons in badges, buttons, and countdown on storefront
                </p>
              </div>
              <Switch
                checked={settings.show_icons ?? true}
                onChange={(checked) => updateSetting('show_icons', checked)}
                className={`${
                  (settings.show_icons ?? true) ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    (settings.show_icons ?? true) ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </div>

            <div>
              <label htmlFor="icon_size" className="block text-sm font-medium text-gray-700">
                Icon Size
              </label>
              <select
                id="icon_size"
                value={settings.icon_size ?? 'medium'}
                onChange={(e) => updateSetting('icon_size', e.target.value as 'small' | 'medium' | 'large')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">This setting currently applies on the frontend only and will be persisted later.</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </Layout>
  )
}
