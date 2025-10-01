import { getShopifyProduct } from './shopify'

// Shopify Translations API integration
export interface ShopifyTranslation {
  key: string
  value: string
  locale: string
  translatable_type: string
  translatable_id: number
}

export interface TranslationResource {
  resource_id: string
  translatable_type: 'Product' | 'ProductVariant' | 'Collection' | 'Metafield'
  translations: ShopifyTranslation[]
}

// Default translations for preorder functionality
export const DEFAULT_TRANSLATIONS = {
  'en': {
    'preorder.button.text': 'Pre-Order Now',
    'preorder.badge.text': 'Pre-Order',
    'preorder.coming_soon.button': 'Coming Soon',
    'preorder.coming_soon.badge': 'Coming Soon',
    'preorder.out_of_stock.button': 'Notify When Available',
    'preorder.out_of_stock.badge': 'Out of Stock',
    'preorder.delivery.expected': 'Expected delivery',
    'preorder.delivery.ships_on': 'Ships on',
    'preorder.payment.full': 'Full Payment',
    'preorder.payment.deposit': 'Deposit',
    'preorder.payment.remaining': 'Remaining',
    'preorder.payment.due_later': 'due later',
    'preorder.success.title': 'Pre-order Created!',
    'preorder.success.message': 'You will receive an email with payment instructions.',
    'preorder.error.title': 'Error',
    'preorder.error.email_required': 'Please enter your email address for the pre-order',
    'preorder.countdown.days': 'days',
    'preorder.countdown.hours': 'hours',
    'preorder.countdown.minutes': 'minutes',
    'preorder.countdown.seconds': 'seconds'
  },
  'zh': {
    'preorder.button.text': '立即预订',
    'preorder.badge.text': '预售',
    'preorder.coming_soon.button': '即将上市',
    'preorder.coming_soon.badge': '即将上市',
    'preorder.out_of_stock.button': '到货通知',
    'preorder.out_of_stock.badge': '缺货',
    'preorder.delivery.expected': '预计交付',
    'preorder.delivery.ships_on': '发货日期',
    'preorder.payment.full': '全额付款',
    'preorder.payment.deposit': '定金',
    'preorder.payment.remaining': '余款',
    'preorder.payment.due_later': '稍后支付',
    'preorder.success.title': '预订成功！',
    'preorder.success.message': '您将收到包含付款说明的邮件。',
    'preorder.error.title': '错误',
    'preorder.error.email_required': '请输入您的邮箱地址以完成预订',
    'preorder.countdown.days': '天',
    'preorder.countdown.hours': '小时',
    'preorder.countdown.minutes': '分钟',
    'preorder.countdown.seconds': '秒'
  },
  'es': {
    'preorder.button.text': 'Pre-ordenar Ahora',
    'preorder.badge.text': 'Pre-orden',
    'preorder.coming_soon.button': 'Próximamente',
    'preorder.coming_soon.badge': 'Próximamente',
    'preorder.out_of_stock.button': 'Notificar Disponibilidad',
    'preorder.out_of_stock.badge': 'Agotado',
    'preorder.delivery.expected': 'Entrega esperada',
    'preorder.delivery.ships_on': 'Envío el',
    'preorder.payment.full': 'Pago Completo',
    'preorder.payment.deposit': 'Depósito',
    'preorder.payment.remaining': 'Restante',
    'preorder.payment.due_later': 'a pagar después',
    'preorder.success.title': '¡Pre-orden Creada!',
    'preorder.success.message': 'Recibirás un email con las instrucciones de pago.',
    'preorder.error.title': 'Error',
    'preorder.error.email_required': 'Por favor ingresa tu email para la pre-orden',
    'preorder.countdown.days': 'días',
    'preorder.countdown.hours': 'horas',
    'preorder.countdown.minutes': 'minutos',
    'preorder.countdown.seconds': 'segundos'
  },
  'fr': {
    'preorder.button.text': 'Pré-commander',
    'preorder.badge.text': 'Pré-commande',
    'preorder.coming_soon.button': 'Bientôt Disponible',
    'preorder.coming_soon.badge': 'Bientôt',
    'preorder.out_of_stock.button': 'Me Notifier',
    'preorder.out_of_stock.badge': 'Épuisé',
    'preorder.delivery.expected': 'Livraison prévue',
    'preorder.delivery.ships_on': 'Expédié le',
    'preorder.payment.full': 'Paiement Complet',
    'preorder.payment.deposit': 'Acompte',
    'preorder.payment.remaining': 'Restant',
    'preorder.payment.due_later': 'à payer plus tard',
    'preorder.success.title': 'Pré-commande Créée!',
    'preorder.success.message': 'Vous recevrez un email avec les instructions de paiement.',
    'preorder.error.title': 'Erreur',
    'preorder.error.email_required': 'Veuillez saisir votre email pour la pré-commande',
    'preorder.countdown.days': 'jours',
    'preorder.countdown.hours': 'heures',
    'preorder.countdown.minutes': 'minutes',
    'preorder.countdown.seconds': 'secondes'
  },
  'de': {
    'preorder.button.text': 'Jetzt Vorbestellen',
    'preorder.badge.text': 'Vorbestellung',
    'preorder.coming_soon.button': 'Demnächst',
    'preorder.coming_soon.badge': 'Demnächst',
    'preorder.out_of_stock.button': 'Benachrichtigen',
    'preorder.out_of_stock.badge': 'Ausverkauft',
    'preorder.delivery.expected': 'Erwartete Lieferung',
    'preorder.delivery.ships_on': 'Versand am',
    'preorder.payment.full': 'Vollzahlung',
    'preorder.payment.deposit': 'Anzahlung',
    'preorder.payment.remaining': 'Restbetrag',
    'preorder.payment.due_later': 'später fällig',
    'preorder.success.title': 'Vorbestellung Erstellt!',
    'preorder.success.message': 'Sie erhalten eine E-Mail mit Zahlungsanweisungen.',
    'preorder.error.title': 'Fehler',
    'preorder.error.email_required': 'Bitte geben Sie Ihre E-Mail für die Vorbestellung ein',
    'preorder.countdown.days': 'Tage',
    'preorder.countdown.hours': 'Stunden',
    'preorder.countdown.minutes': 'Minuten',
    'preorder.countdown.seconds': 'Sekunden'
  }
}

// Get Shopify translations for a resource
export async function getShopifyTranslations(
  shop: string,
  accessToken: string,
  resourceType: string,
  resourceId: string,
  locale?: string
): Promise<ShopifyTranslation[]> {
  try {
    let url = `https://${shop}/admin/api/2023-10/translations.json?resource_type=${resourceType}&resource_id=${resourceId}`
    
    if (locale) {
      url += `&locale=${locale}`
    }

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.statusText}`)
    }

    const data = await response.json()
    return data.translations || []
  } catch (error) {
    console.error('Error fetching Shopify translations:', error)
    return []
  }
}

// Create or update Shopify translation
export async function updateShopifyTranslation(
  shop: string,
  accessToken: string,
  translation: Partial<ShopifyTranslation>
): Promise<ShopifyTranslation | null> {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/translations.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        translation
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to update translation: ${response.statusText}`)
    }

    const data = await response.json()
    return data.translation
  } catch (error) {
    console.error('Error updating Shopify translation:', error)
    return null
  }
}

// Get available locales for a shop
export async function getShopLocales(
  shop: string,
  accessToken: string
): Promise<string[]> {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/locales.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch locales: ${response.statusText}`)
    }

    const data = await response.json()
    return data.locales?.map((locale: any) => locale.locale) || ['en']
  } catch (error) {
    console.error('Error fetching shop locales:', error)
    return ['en']
  }
}

// Translation helper class
export class TranslationManager {
  private translations: { [locale: string]: { [key: string]: string } } = DEFAULT_TRANSLATIONS
  private currentLocale: string = 'en'
  private shopifyTranslations: { [key: string]: string } = {}

  constructor(locale: string = 'en') {
    this.currentLocale = locale
  }

  // Load Shopify translations for preorder metafields
  async loadShopifyTranslations(
    shop: string,
    accessToken: string,
    productId: string
  ): Promise<void> {
    try {
      // Get product metafield translations
      const metafieldTranslations = await getShopifyTranslations(
        shop,
        accessToken,
        'Metafield',
        productId,
        this.currentLocale
      )

      // Map Shopify translations to our keys
      metafieldTranslations.forEach(translation => {
        if (translation.key.includes('preorder')) {
          this.shopifyTranslations[translation.key] = translation.value
        }
      })
    } catch (error) {
      console.error('Error loading Shopify translations:', error)
    }
  }

  // Get translated text
  t(key: string, fallback?: string): string {
    // First check Shopify translations
    if (this.shopifyTranslations[key]) {
      return this.shopifyTranslations[key]
    }

    // Then check our default translations
    const localeTranslations = this.translations[this.currentLocale]
    if (localeTranslations && localeTranslations[key]) {
      return localeTranslations[key]
    }

    // Fallback to English
    const englishTranslations = this.translations['en']
    if (englishTranslations && englishTranslations[key]) {
      return englishTranslations[key]
    }

    // Return fallback or key
    return fallback || key
  }

  // Set current locale
  setLocale(locale: string): void {
    this.currentLocale = locale
  }

  // Get current locale
  getLocale(): string {
    return this.currentLocale
  }

  // Add custom translations
  addTranslations(locale: string, translations: { [key: string]: string }): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {}
    }
    Object.assign(this.translations[locale], translations)
  }

  // Format date according to locale
  formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }

    return dateObj.toLocaleDateString(this.currentLocale, defaultOptions)
  }

  // Format currency according to locale
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Get RTL direction for locale
  isRTL(): boolean {
    const rtlLocales = ['ar', 'he', 'fa', 'ur']
    return rtlLocales.includes(this.currentLocale.split('-')[0])
  }
}

// Detect user's preferred language
export function detectUserLocale(): string {
  // Check Shopify locale first
  if (window.Shopify && window.Shopify.locale) {
    return window.Shopify.locale
  }

  // Check browser language
  if (navigator.language) {
    return navigator.language.split('-')[0]
  }

  // Fallback to English
  return 'en'
}

// Export singleton instance
export const translationManager = new TranslationManager(detectUserLocale())
