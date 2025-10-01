import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Save, Globe, Plus, Trash2, Copy } from 'lucide-react'

interface Translation {
  id?: string
  locale: string
  translation_key: string
  translation_value: string
}

interface TranslationGroup {
  [key: string]: string
}

const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
]

const DEFAULT_TRANSLATION_KEYS = [
  'preorder.button.text',
  'preorder.badge.text',
  'preorder.coming_soon.button',
  'preorder.coming_soon.badge',
  'preorder.out_of_stock.button',
  'preorder.out_of_stock.badge',
  'preorder.delivery.expected',
  'preorder.delivery.ships_on',
  'preorder.payment.full',
  'preorder.payment.deposit',
  'preorder.payment.remaining',
  'preorder.payment.due_later',
  'preorder.success.title',
  'preorder.success.message',
  'preorder.error.title',
  'preorder.error.email_required',
  'preorder.countdown.days',
  'preorder.countdown.hours',
  'preorder.countdown.minutes',
  'preorder.countdown.seconds'
]

const TRANSLATION_CATEGORIES = {
  'Buttons & Actions': [
    'preorder.button.text',
    'preorder.coming_soon.button',
    'preorder.out_of_stock.button'
  ],
  'Badges & Labels': [
    'preorder.badge.text',
    'preorder.coming_soon.badge',
    'preorder.out_of_stock.badge'
  ],
  'Delivery Information': [
    'preorder.delivery.expected',
    'preorder.delivery.ships_on'
  ],
  'Payment Options': [
    'preorder.payment.full',
    'preorder.payment.deposit',
    'preorder.payment.remaining',
    'preorder.payment.due_later'
  ],
  'Messages': [
    'preorder.success.title',
    'preorder.success.message',
    'preorder.error.title',
    'preorder.error.email_required'
  ],
  'Countdown': [
    'preorder.countdown.days',
    'preorder.countdown.hours',
    'preorder.countdown.minutes',
    'preorder.countdown.seconds'
  ]
}

export default function TranslationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState('en')
  const [availableLocales, setAvailableLocales] = useState<string[]>(['en'])
  const [translations, setTranslations] = useState<{ [locale: string]: TranslationGroup }>({})
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    fetchTranslations()
  }, [])

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/api/translations')
      const data = await response.json()

      if (response.ok) {
        setAvailableLocales(data.locales || ['en'])
        
        // Group translations by locale
        const groupedTranslations: { [locale: string]: TranslationGroup } = {}
        
        data.customTranslations.forEach((translation: Translation) => {
          if (!groupedTranslations[translation.locale]) {
            groupedTranslations[translation.locale] = {}
          }
          groupedTranslations[translation.locale][translation.translation_key] = translation.translation_value
        })

        // Ensure all locales have default keys
        SUPPORTED_LOCALES.forEach(locale => {
          if (!groupedTranslations[locale.code]) {
            groupedTranslations[locale.code] = {}
          }
          
          DEFAULT_TRANSLATION_KEYS.forEach(key => {
            if (!groupedTranslations[locale.code][key]) {
              groupedTranslations[locale.code][key] = ''
            }
          })
        })

        setTranslations(groupedTranslations)
      } else {
        throw new Error(data.error || 'Failed to fetch translations')
      }
    } catch (error) {
      console.error('Error fetching translations:', error)
      setAlert({ type: 'error', message: 'Failed to load translations' })
    } finally {
      setLoading(false)
    }
  }

  const saveTranslations = async (locale: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale,
          translations: translations[locale] || {}
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAlert({ type: 'success', message: `Translations saved for ${locale}` })
      } else {
        throw new Error(data.error || 'Failed to save translations')
      }
    } catch (error) {
      console.error('Error saving translations:', error)
      setAlert({ type: 'error', message: 'Failed to save translations' })
    } finally {
      setSaving(false)
    }
  }

  const updateTranslation = (locale: string, key: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [key]: value
      }
    }))
  }

  const addCustomTranslation = () => {
    if (!newKey || !newValue) return

    updateTranslation(selectedLocale, newKey, newValue)
    setNewKey('')
    setNewValue('')
  }

  const removeTranslation = (locale: string, key: string) => {
    setTranslations(prev => {
      const updated = { ...prev }
      if (updated[locale]) {
        delete updated[locale][key]
      }
      return updated
    })
  }

  const copyFromLocale = (fromLocale: string, toLocale: string) => {
    const fromTranslations = translations[fromLocale] || {}
    setTranslations(prev => ({
      ...prev,
      [toLocale]: {
        ...prev[toLocale],
        ...fromTranslations
      }
    }))
    setAlert({ type: 'success', message: `Copied translations from ${fromLocale} to ${toLocale}` })
  }

  const getTranslationProgress = (locale: string) => {
    const localeTranslations = translations[locale] || {}
    const totalKeys = DEFAULT_TRANSLATION_KEYS.length
    const translatedKeys = DEFAULT_TRANSLATION_KEYS.filter(key => 
      localeTranslations[key] && localeTranslations[key].trim() !== ''
    ).length
    
    return Math.round((translatedKeys / totalKeys) * 100)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Multi-Language Translations</h1>
            <p className="text-gray-600 mt-2">
              Manage translations for preorder functionality across different languages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <Badge variant="outline">
              {availableLocales.length} languages supported
            </Badge>
          </div>
        </div>

        {alert && (
          <Alert className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={alert.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={selectedLocale} onValueChange={setSelectedLocale}>
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            {SUPPORTED_LOCALES.map(locale => (
              <TabsTrigger key={locale.code} value={locale.code} className="flex items-center gap-1">
                <span>{locale.flag}</span>
                <span className="hidden sm:inline">{locale.code.toUpperCase()}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getTranslationProgress(locale.code)}%
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {SUPPORTED_LOCALES.map(locale => (
            <TabsContent key={locale.code} value={locale.code} className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{locale.flag}</span>
                      {locale.name} Translations
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Progress: {getTranslationProgress(locale.code)}% complete
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select onValueChange={(fromLocale) => copyFromLocale(fromLocale, locale.code)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Copy from..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LOCALES.filter(l => l.code !== locale.code).map(l => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.flag} {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => saveTranslations(locale.code)}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(TRANSLATION_CATEGORIES).map(([category, keys]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">{category}</h3>
                      <div className="grid gap-4">
                        {keys.map(key => (
                          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                            <Label className="font-medium text-sm">{key}</Label>
                            <Input
                              value={translations[locale.code]?.[key] || ''}
                              onChange={(e) => updateTranslation(locale.code, key, e.target.value)}
                              placeholder={`Enter ${locale.name} translation...`}
                              className="md:col-span-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Custom translations */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2">Custom Translations</h3>
                    
                    {/* Add new translation */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label>Translation Key</Label>
                        <Input
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          placeholder="e.g., custom.message"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Translation Value</Label>
                        <Input
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="Enter translation..."
                        />
                      </div>
                      <Button onClick={addCustomTranslation} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>

                    {/* Existing custom translations */}
                    {Object.entries(translations[locale.code] || {})
                      .filter(([key]) => !DEFAULT_TRANSLATION_KEYS.includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                          <Label className="font-medium text-sm">{key}</Label>
                          <Input
                            value={value}
                            onChange={(e) => updateTranslation(locale.code, key, e.target.value)}
                            className="md:col-span-2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTranslation(locale.code, key)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Integration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Integration with Shopify Translate & Adapt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This app integrates with Shopify's official "Translate & Adapt" app for seamless multi-language support.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Install the "Translate & Adapt" app from the Shopify App Store</li>
                <li>Configure your store's supported languages</li>
                <li>Translations will automatically sync with your theme</li>
                <li>Use the widget configuration to override specific translations</li>
              </ol>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Note:</h4>
              <p className="text-sm">
                Custom translations saved here will take precedence over Shopify's automatic translations 
                for preorder-specific content.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
