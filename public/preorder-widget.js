(function() {
  'use strict';

  // PreOrder Widget Configuration
  const PREORDER_CONFIG = {
    apiUrl: window.PREORDER_API_URL || 'https://your-app-domain.vercel.app/api',
    shop: window.Shopify?.shop || '',
    debug: false,
    retryAttempts: 3,
    retryDelay: 1000
  };

  // Multi-language support
  const TRANSLATIONS = {
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
  };

  // Detect user locale
  const USER_LOCALE = (function() {
    if (window.Shopify && window.Shopify.locale) {
      return window.Shopify.locale.split('-')[0];
    }
    if (navigator.language) {
      return navigator.language.split('-')[0];
    }
    return 'en';
  })();

  // Translation function
  const t = (key, fallback) => {
    const localeTranslations = TRANSLATIONS[USER_LOCALE];
    if (localeTranslations && localeTranslations[key]) {
      return localeTranslations[key];
    }
    
    // Fallback to English
    const englishTranslations = TRANSLATIONS['en'];
    if (englishTranslations && englishTranslations[key]) {
      return englishTranslations[key];
    }
    
    return fallback || key;
  };

  // Utility functions
  const log = (...args) => {
    if (PREORDER_CONFIG.debug) {
      console.log('[PreOrder Widget]', ...args);
    }
  };

  const createElement = (tag, className, innerHTML) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  };

  const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString);
    
    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: userTimezone,
      ...options
    };
    
    // Add time if specified in options
    if (options.includeTime) {
      defaultOptions.hour = '2-digit';
      defaultOptions.minute = '2-digit';
      defaultOptions.timeZoneName = 'short';
    }
    
    return date.toLocaleDateString(USER_LOCALE + '-' + (USER_LOCALE === 'zh' ? 'CN' : 'US'), defaultOptions);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    // Get currency from Shopify if available
    const shopCurrency = window.Shopify?.currency?.active || currency;
    
    return new Intl.NumberFormat(USER_LOCALE + '-' + (USER_LOCALE === 'zh' ? 'CN' : 'US'), {
      style: 'currency',
      currency: shopCurrency
    }).format(amount);
  };

  const isRTL = () => {
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.includes(USER_LOCALE);
  };

  const formatDateTime = (dateString) => {
    return formatDate(dateString, { includeTime: true });
  };

  const isDateInFuture = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
  };

  const isDateInPast = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Enhanced PreOrder Badge Component with multi-language and responsive design
  class PreOrderBadge {
    constructor(options = {}) {
      this.badgeText = options.badgeText || t('preorder.badge.text');
      this.badgeColor = options.badgeColor || '#ff6b35';
      this.position = options.position || 'top-right';
      this.size = options.size || 'medium';
      this.animation = options.animation || 'none';
      this.style = options.style || 'rounded';
      this.customCSS = options.customCSS || '';
      this.theme = this.detectTheme();
    }

    detectTheme() {
      // Detect Shopify theme for better compatibility
      const themeIndicators = {
        'dawn': ['.shopify-section', '.color-scheme'],
        'debut': ['.site-header', '.product-single'],
        'brooklyn': ['.site-nav', '.product__photos'],
        'impulse': ['.header-wrapper', '.product-image-main']
      };

      for (const [theme, selectors] of Object.entries(themeIndicators)) {
        if (selectors.every(selector => document.querySelector(selector))) {
          return theme;
        }
      }

      return 'default';
    }

    getThemeConfig() {
      const configs = {
        'dawn': {
          containerSelectors: ['.product__media', '.product-media'],
          fallbackContainer: '.product'
        },
        'debut': {
          containerSelectors: ['.product-single__photos', '.product-photos'],
          fallbackContainer: '.product-single'
        },
        'brooklyn': {
          containerSelectors: ['.product__photos', '.product-photos'],
          fallbackContainer: '.product'
        },
        'impulse': {
          containerSelectors: ['.product-image-main', '.product-images'],
          fallbackContainer: '.product-single'
        },
        'default': {
          containerSelectors: [
            '.product-single__photos',
            '.product__photos',
            '.product-photos',
            '.product-images',
            '.product-image-main',
            '.product__media',
            '.product-media',
            '.product-gallery'
          ],
          fallbackContainer: '.product, .product-single, .product-details'
        }
      };

      return configs[this.theme] || configs['default'];
    }

    getPositionStyles() {
      const offset = '8px';
      
      switch (this.position) {
        case 'top-left':
          return { 'top': offset, 'left': offset };
        case 'top-right':
          return { 'top': offset, 'right': offset };
        case 'bottom-left':
          return { 'bottom': offset, 'left': offset };
        case 'bottom-right':
          return { 'bottom': offset, 'right': offset };
        case 'center':
          return { 
            'top': '50%', 
            'left': '50%', 
            'transform': 'translate(-50%, -50%)' 
          };
        default:
          return { 'top': offset, 'right': offset };
      }
    }

    getSizeStyles() {
      switch (this.size) {
        case 'small':
          return {
            'padding': '4px 8px',
            'font-size': '10px',
            'min-width': '40px'
          };
        case 'large':
          return {
            'padding': '12px 16px',
            'font-size': '16px',
            'min-width': '80px'
          };
        case 'medium':
        default:
          return {
            'padding': '8px 12px',
            'font-size': '12px',
            'min-width': '60px'
          };
      }
    }

    getStyleStyles() {
      switch (this.style) {
        case 'square':
          return { 'border-radius': '0' };
        case 'pill':
          return { 'border-radius': '50px' };
        case 'rounded':
        default:
          return { 'border-radius': '4px' };
      }
    }

    addAnimationCSS() {
      const existingStyle = document.getElementById('preorder-badge-animations');
      if (existingStyle) return;

      const style = document.createElement('style');
      style.id = 'preorder-badge-animations';
      style.textContent = `
        @keyframes preorder-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes preorder-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        @keyframes preorder-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .preorder-badge {
            font-size: 10px !important;
            padding: 4px 6px !important;
            min-width: 30px !important;
          }
        }

        @media (max-width: 480px) {
          .preorder-badge {
            font-size: 9px !important;
            padding: 3px 5px !important;
            min-width: 25px !important;
          }
        }
      `;
      
      document.head.appendChild(style);
    }

    create() {
      const badge = createElement('div', 'preorder-badge enhanced-badge');
      badge.textContent = this.badgeText;
      
      // Base styles
      const baseStyles = {
        'position': 'absolute',
        'background-color': this.badgeColor,
        'color': 'white',
        'font-weight': 'bold',
        'z-index': '1000',
        'pointer-events': 'none',
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'text-align': 'center',
        'line-height': '1',
        'white-space': 'nowrap',
        'user-select': 'none',
        'box-sizing': 'border-box',
        ...this.getPositionStyles(),
        ...this.getSizeStyles(),
        ...this.getStyleStyles()
      };

      // Apply styles
      Object.entries(baseStyles).forEach(([property, value]) => {
        badge.style.setProperty(property, value, 'important');
      });

      // Apply custom CSS if provided
      if (this.customCSS) {
        const customStyles = this.parseCustomCSS(this.customCSS);
        Object.entries(customStyles).forEach(([property, value]) => {
          badge.style.setProperty(property, value, 'important');
        });
      }

      // Add animation
      if (this.animation !== 'none') {
        this.addAnimationCSS();
        badge.style.setProperty('animation', `preorder-${this.animation} 2s infinite`, 'important');
      }

      // Add data attributes for styling
      badge.setAttribute('data-position', this.position);
      badge.setAttribute('data-size', this.size);
      badge.setAttribute('data-style', this.style);
      badge.setAttribute('data-animation', this.animation);
      badge.setAttribute('data-theme', this.theme);
      
      return badge;
    }

    parseCustomCSS(cssString) {
      const styles = {};
      const declarations = cssString.split(';');
      
      declarations.forEach(declaration => {
        const [property, value] = declaration.split(':').map(s => s.trim());
        if (property && value) {
          styles[property] = value;
        }
      });
      
      return styles;
    }
  }  

    updateText(text) {
      if (this.element) {
        const textElement = this.element.querySelector('.preorder-badge-text');
        if (textElement) {
          textElement.textContent = text;
        }
      }
    }

    updateColor(color) {
      if (this.element) {
        this.element.style.background = color;
      }
    }
  }

  // Countdown Timer Component
  class CountdownTimer {
    constructor(targetDate, label = 'Pre-order starts in:') {
      this.targetDate = new Date(targetDate);
      this.label = label;
      this.element = null;
      this.interval = null;
    }

    create() {
      this.element = createElement('div', 'preorder-countdown');
      this.element.innerHTML = `
        <div class="countdown-label">${this.label}</div>
        <div class="countdown-timer">
          <span class="countdown-days">00</span>d
          <span class="countdown-hours">00</span>h
          <span class="countdown-minutes">00</span>m
          <span class="countdown-seconds">00</span>s
        </div>
      `;

      // Apply styles
      this.element.style.cssText = `
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        margin: 10px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      this.startTimer();
      return this.element;
    }

    startTimer() {
      this.updateTimer(); // Initial update
      this.interval = setInterval(() => {
        this.updateTimer();
      }, 1000);
    }

    updateTimer() {
      const now = new Date().getTime();
      const distance = this.targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(this.interval);
        this.element.innerHTML = '<div class="countdown-expired">Pre-order is now available!</div>';
        // Trigger widget refresh
        setTimeout(() => {
          if (window.PreOrderWidget && window.PreOrderWidget.instance) {
            window.PreOrderWidget.instance.refresh();
          }
        }, 2000);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (this.element) {
        const daysEl = this.element.querySelector('.countdown-days');
        const hoursEl = this.element.querySelector('.countdown-hours');
        const minutesEl = this.element.querySelector('.countdown-minutes');
        const secondsEl = this.element.querySelector('.countdown-seconds');

        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
      }
    }

    destroy() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  }

  // Back in Stock Notification Form
  class BackInStockForm {
    constructor(productId, variantId) {
      this.productId = productId;
      this.variantId = variantId;
      this.element = null;
    }

    create() {
      this.element = createElement('div', 'back-in-stock-form');
      this.element.innerHTML = `
        <div class="form-header">
          <h3>Get notified when back in stock</h3>
          <p>Enter your email to be notified when this item is available again.</p>
        </div>
        <form class="notification-form">
          <div class="form-group">
            <input type="email" name="email" placeholder="Enter your email" required>
            <input type="text" name="name" placeholder="Your name (optional)">
          </div>
          <button type="submit" class="notify-btn">Notify Me</button>
        </form>
        <div class="form-message" style="display: none;"></div>
      `;

      // Apply styles
      this.element.style.cssText = `
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 20px;
        margin: 15px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      this.attachEventListeners();
      return this.element;
    }

    attachEventListeners() {
      const form = this.element.querySelector('.notification-form');
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const name = formData.get('name');

      if (!email) return;

      const submitBtn = this.element.querySelector('.notify-btn');
      const messageDiv = this.element.querySelector('.form-message');
      
      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;

      try {
        const response = await fetch(`${PREORDER_CONFIG.apiUrl}/notify/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: PREORDER_CONFIG.shop,
            productId: this.productId,
            variantId: this.variantId,
            email: email,
            name: name
          })
        });

        const result = await response.json();

        if (response.ok) {
          messageDiv.innerHTML = '<div class="success-message">✓ You\'ll be notified when this item is back in stock!</div>';
          messageDiv.style.display = 'block';
          e.target.style.display = 'none';
        } else {
          throw new Error(result.error || 'Failed to subscribe');
        }
      } catch (error) {
        messageDiv.innerHTML = `<div class="error-message">⚠ ${error.message}</div>`;
        messageDiv.style.display = 'block';
        submitBtn.textContent = 'Notify Me';
        submitBtn.disabled = false;
      }
    }
  }

  // Main PreOrder Widget Class
  class PreOrderWidget {
    constructor() {
      this.config = null;
      this.productId = null;
      this.variantId = null;
      this.currentVariant = null;
      this.components = [];
      this.observers = [];
      this.initialized = false;
    }

    // Helper: app base URL for loading assets from this app (public/icons/*)
    getAppBaseUrl() {
      try {
        const apiUrl = new URL(PREORDER_CONFIG.apiUrl);
        // Remove trailing /api if present
        return apiUrl.origin;
      } catch (_) {
        return '';
      }
    }

    // Helper: feature flags for icons (later can be overridden by remote config)
    getIconPreferences() {
      const defaults = { show: true, size: 'medium' };
      const ui = this.config?.ui || {};
      return {
        show: ui.show_icons !== undefined ? !!ui.show_icons : defaults.show,
        size: ui.icon_size || defaults.size
      };
    }

    // Helper: map size token to px
    resolveIconPx(size) {
      switch (size) {
        case 'small': return 14;
        case 'large': return 20;
        case 'medium':
        default: return 16;
      }
    }

    // Helper: map badge type to icon filename
    getBadgeIconName(type) {
      switch (type) {
        case 'coming_soon': return 'badge-coming-soon.svg';
        case 'out_of_stock': return 'badge-out-of-stock.svg';
        case 'preorder':
        default: return 'badge-preorder.svg';
      }
    }

    // Helper: generic icon html
    getIconImgHtml(fileName, px) {
      const base = this.getAppBaseUrl();
      const url = `${base}/icons/${fileName}`;
      return `<img src="${url}" alt="" width="${px}" height="${px}" style="display:block;object-fit:contain;"/>`;
    }

    // Enhanced badge that can include icon + text
    addEnhancedBadge(text, color, type) {
      try {
        const badge = new PreOrderBadge({ badgeText: text, badgeColor: color });
        const badgeElement = badge.create();

        // Inject icon if enabled
        const prefs = this.getIconPreferences();
        if (prefs.show) {
          const iconPx = this.resolveIconPx(prefs.size);
          const base = this.getAppBaseUrl();
          const iconUrl = `${base}/icons/${this.getBadgeIconName(type)}`;
          // Build content: icon img + text span
          badgeElement.innerHTML = `
            <span class="preorder-badge-icon" style="display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;margin-right:6px;">
              <img src="${iconUrl}" alt="" width="${iconPx}" height="${iconPx}" style="display:block;object-fit:contain;filter:invert(0);"/>
            </span>
            <span class="preorder-badge-text">${text}</span>
          `;
        } else {
          // Ensure text node exists for updateText()
          badgeElement.classList.add('has-no-icon');
          badgeElement.textContent = text;
        }

        // Find product image container with multiple selectors
        const imageSelectors = [
          '.product-single__photos',
          '.product__photos', 
          '.product-images',
          '.product-image-main',
          '.product__image',
          '.featured-image'
        ];
        let imageContainer = null;
        for (const selector of imageSelectors) {
          imageContainer = document.querySelector(selector);
          if (imageContainer) break;
        }
        if (imageContainer) {
          imageContainer.style.position = 'relative';
          imageContainer.appendChild(badgeElement);
          this.components.push(badge);
        }
      } catch (e) {
        log('addEnhancedBadge error', e);
      }
    }

    async init() {
      if (this.initialized) return;

      try {
        // Get product info from page
        this.extractProductInfo();
        
        if (!this.productId) {
          log('No product ID found, widget not initialized');
          return;
        }

        // Fetch preorder configuration
        await this.fetchConfig();
        
        if (!this.config || !this.config.enabled) {
          log('PreOrder not enabled for this product');
          return;
        }

        // Initialize widget based on product state
        this.initializeWidget();
        
        // Set up variant change observers
        this.setupVariantObservers();
        
        this.initialized = true;
        log('PreOrder widget initialized successfully');
      } catch (error) {
        log('Error initializing widget:', error);
      }
    }

    extractProductInfo() {
      // Try multiple methods to get product ID
      if (window.meta && window.meta.product) {
        this.productId = window.meta.product.id.toString();
      } else if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta.product) {
        this.productId = window.ShopifyAnalytics.meta.product.id.toString();
      } else {
        // Fallback: try to extract from page elements
        const productForm = document.querySelector('form[action*="/cart/add"]');
        if (productForm) {
          const productIdInput = productForm.querySelector('input[name="id"]');
          if (productIdInput) {
            this.variantId = productIdInput.value;
            // Try to get product ID from variant
            this.getProductIdFromVariant();
          }
        }
      }

      // Get current variant ID
      this.getCurrentVariant();

      log('Product ID:', this.productId, 'Variant ID:', this.variantId);
    }

    async getProductIdFromVariant() {
      if (!this.variantId) return;

      try {
        const response = await fetch(`${PREORDER_CONFIG.apiUrl}/preorder/variant/${this.variantId}?shop=${PREORDER_CONFIG.shop}`);
        if (response.ok) {
          const data = await response.json();
          if (data.variant && data.variant.product_id) {
            this.productId = data.variant.product_id.toString();
          }
        }
      } catch (error) {
        log('Error getting product ID from variant:', error);
      }
    }

    getCurrentVariant() {
      // Try to get current variant from various sources
      const variantSelect = document.querySelector('select[name="id"]');
      const variantInput = document.querySelector('input[name="id"]');
      const variantRadio = document.querySelector('input[name="id"]:checked');

      if (variantSelect) {
        this.variantId = variantSelect.value;
      } else if (variantRadio) {
        this.variantId = variantRadio.value;
      } else if (variantInput) {
        this.variantId = variantInput.value;
      }
    }

    setupVariantObservers() {
      // Observe variant selector changes
      const variantSelectors = document.querySelectorAll('select[name="id"], input[name="id"]');
      
      variantSelectors.forEach(selector => {
        const handler = debounce(() => {
          this.getCurrentVariant();
          this.refresh();
        }, 300);

        selector.addEventListener('change', handler);
        this.observers.push(() => selector.removeEventListener('change', handler));
      });

      // Observe form changes for themes that use different selectors
      const productForm = document.querySelector('form[action*="/cart/add"]');
      if (productForm) {
        const observer = new MutationObserver(debounce(() => {
          this.getCurrentVariant();
          this.refresh();
        }, 300));

        observer.observe(productForm, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['value', 'selected', 'checked']
        });

        this.observers.push(() => observer.disconnect());
      }
    }

    async fetchConfig() {
      let url = `${PREORDER_CONFIG.apiUrl}/preorder/product/${this.productId}?shop=${PREORDER_CONFIG.shop}`;
      if (this.variantId) {
        url += `&variantId=${this.variantId}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        this.config = data.config;
        this.currentStatus = data.currentStatus;
        this.inventoryStatus = data.inventoryStatus;
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch preorder configuration');
      }
    }

    async refresh() {
      if (!this.initialized) return;

      try {
        // Clean up existing components
        this.destroy();
        
        // Fetch updated configuration
        await this.fetchConfig();
        
        if (this.config && this.config.enabled) {
          this.initializeWidget();
        }
      } catch (error) {
        log('Error refreshing widget:', error);
      }
    }

    initializeWidget() {
      // Determine current status
      const status = this.determineCurrentStatus();
      
      switch (status) {
        case 'coming_soon':
          this.handleComingSoon();
          break;
        case 'preorder':
          this.handlePreOrder();
          break;
        default:
          // Normal state - remove any existing preorder elements
          this.handleNormalState();
          break;
      }
    }

    determineCurrentStatus() {
      if (!this.config?.enabled) return 'normal';

      const now = new Date();
      const startDate = this.config.preorder_start_date ? new Date(this.config.preorder_start_date) : null;
      const endDate = this.config.preorder_end_date ? new Date(this.config.preorder_end_date) : null;

      // Check variant-specific configuration if available
      const variantConfig = this.variantId ? this.config.variants_config?.[this.variantId] : null;
      
      if (variantConfig && !variantConfig.enabled) {
        return 'normal';
      }

      // Use variant-specific dates if available
      const effectiveStartDate = variantConfig?.preorder_start_date ? 
        new Date(variantConfig.preorder_start_date) : startDate;
      const effectiveEndDate = variantConfig?.preorder_end_date ? 
        new Date(variantConfig.preorder_end_date) : endDate;

      // Check time-based status
      if (effectiveStartDate && now < effectiveStartDate) {
        return 'coming_soon';
      }

      if (effectiveEndDate && now > effectiveEndDate) {
        return 'normal';
      }

      // Check preorder type
      const preorderType = variantConfig?.preorder_type || this.config.preorder_type;
      
      if (preorderType === 'always') {
        return 'preorder';
      }

      if (preorderType === 'coming_soon') {
        return effectiveStartDate && now >= effectiveStartDate ? 'preorder' : 'coming_soon';
      }

      // Check inventory status
      if (preorderType === 'out_of_stock') {
        const isOutOfStock = this.checkIfOutOfStock();
        return isOutOfStock ? 'preorder' : 'normal';
      }

      return 'normal';
    }

    checkIfOutOfStock() {
      // Check various indicators that product/variant is out of stock
      const addToCartBtn = document.querySelector('button[name="add"], input[name="add"], .btn-product-add');
      
      // Check if button is disabled
      if (addToCartBtn && addToCartBtn.disabled) {
        return true;
      }

      // Check for sold out text in button
      if (addToCartBtn) {
        const btnText = (addToCartBtn.textContent || addToCartBtn.value || '').toLowerCase();
        if (btnText.includes('sold out') || 
            btnText.includes('unavailable') || 
            btnText.includes('out of stock') ||
            btnText.includes('缺货') ||
            btnText.includes('售罄')) {
          return true;
        }
      }

      // Check for sold out elements
      const soldOutElements = document.querySelectorAll('.sold-out, .unavailable, .out-of-stock');
      if (soldOutElements.length > 0) {
        return true;
      }

      // Check for sold out text in page content
      const soldOutTexts = document.querySelectorAll('*');
      for (let element of soldOutTexts) {
        const text = element.textContent?.toLowerCase() || '';
        if ((text.includes('sold out') || text.includes('缺货') || text.includes('售罄')) && 
            element.children.length === 0) { // Only check leaf nodes
          return true;
        }
      }

      // Check inventory from Shopify product data
      if (window.meta?.product?.variants) {
        const currentVariant = window.meta.product.variants.find(v => 
          v.id.toString() === this.variantId
        );
        
        if (currentVariant) {
          return currentVariant.inventory_quantity <= 0 && 
                 currentVariant.inventory_policy === 'deny';
        }
      }

      return false;
    }

    handleComingSoon(startDate) {
      log('Handling coming soon state');
      
      const effectiveStartDate = startDate || 
        (this.config.variants_config?.[this.variantId]?.preorder_start_date) ||
        this.config.preorder_start_date;
      
      // Add coming soon badge
      this.addBadge('Coming Soon', '#f59e0b');
      
      // Add countdown timer if start date is available
      if (effectiveStartDate) {
        const timer = new CountdownTimer(effectiveStartDate, 'Available in:');
        const timerElement = timer.create();
        
        const productForm = document.querySelector('.product-form, form[action*="/cart/add"]');
        if (productForm) {
          productForm.appendChild(timerElement);
        }
        
        this.components.push(timer);
      }
      
      // Update add to cart button
      this.updateAddToCartButton('Coming Soon', true);
    }

    handlePreOrder() {
      log('Handling pre-order state');
      
      // Get variant-specific or product-level configuration
      const variantConfig = this.variantId ? this.config.variants_config?.[this.variantId] : null;
      const badgeText = variantConfig?.custom_badge_text || this.config.custom_badge_text || t('preorder.badge.text');
      const badgeColor = variantConfig?.badge_color || this.config.badge_color || '#ff6b35';
      const buttonText = variantConfig?.custom_button_text || this.config.custom_button_text || t('preorder.button.text');
      
      // Add pre-order badge with enhanced features
      this.addEnhancedBadge(badgeText, badgeColor, 'preorder');
      
      // Check if partial payments are enabled
      const partialPaymentsEnabled = this.config.partial_payments_enabled;
      const depositPercentage = this.config.deposit_percentage || 50;
      
      if (partialPaymentsEnabled) {
        // Add partial payment options
        this.addPartialPaymentOptions(depositPercentage);
        
        // Update button to handle partial payment selection
        this.updatePreOrderButton(buttonText);
      } else {
        // Standard pre-order button
        this.updateAddToCartButton(buttonText, false);
      }
      
      // Add delivery information
      const deliveryDate = variantConfig?.estimated_delivery_date || this.config.estimated_delivery_date;
      const deliveryNote = variantConfig?.delivery_note || this.config.delivery_note;
      
      if (deliveryDate || deliveryNote) {
        this.addDeliveryInfo(deliveryDate, deliveryNote);
      }
    }

    handleComingSoon() {
      log('Handling coming soon state');
      
      const variantConfig = this.variantId ? this.config.variants_config?.[this.variantId] : null;
      const badgeText = variantConfig?.custom_badge_text || this.config.custom_badge_text || t('preorder.coming_soon.badge');
      const badgeColor = variantConfig?.badge_color || this.config.badge_color || '#6c757d';
      const buttonText = variantConfig?.custom_button_text || this.config.custom_button_text || t('preorder.coming_soon.button');
      
      // Add coming soon badge with pulse animation
      this.addEnhancedBadge(badgeText, badgeColor, 'coming_soon');
      
      // Disable the button
      this.updateAddToCartButton(buttonText, true);
      
      // Add countdown if start date is available
      const startDate = variantConfig?.preorder_start_date || this.config.preorder_start_date;
      if (startDate) {
        this.addCountdown(startDate);
      }
      
      // Add delivery information
      const deliveryDate = variantConfig?.estimated_delivery_date || this.config.estimated_delivery_date;
      const deliveryNote = variantConfig?.delivery_note || this.config.delivery_note;
      
      if (deliveryDate || deliveryNote) {
        this.addDeliveryInfo(deliveryDate, deliveryNote);
      }
    }


    handleNormalState() {
      log('Handling normal state - cleaning up preorder elements');
      // Remove any existing preorder elements
      this.destroy();
    }

    updateAddToCartButton(text, disabled = false) {
      // Extended selector list for better theme compatibility
      const buttonSelectors = [
        'button[name="add"]',
        'input[name="add"]',
        '.btn-product-add',
        '.product-form__cart-submit',
        '.btn--add-to-cart',
        '.add-to-cart-button',
        '.product-form__add-button',
        '.shopify-payment-button__button--unbranded',
        '.product__add-button',
        '.product-single__add-to-cart',
        '.product-form__item--submit',
        '[data-add-to-cart]',
        '.js-ajax-submit',
        '.btn-addtocart',
        '.add-to-cart',
        '.product-add',
        '.cart-btn'
      ];
      
      let addToCartBtn = null;
      
      // Try each selector until we find a button
      for (const selector of buttonSelectors) {
        addToCartBtn = document.querySelector(selector);
        if (addToCartBtn) {
          log(`Found add to cart button with selector: ${selector}`);
          break;
        }
      }
      
      // Fallback: search by button text content
      if (!addToCartBtn) {
        const allButtons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
        for (const btn of allButtons) {
          const btnText = (btn.textContent || btn.value || '').toLowerCase();
          if (btnText.includes('add to cart') || 
              btnText.includes('add to bag') || 
              btnText.includes('buy now') ||
              btnText.includes('purchase') ||
              btnText.includes('shop now')) {
            addToCartBtn = btn;
            log('Found add to cart button by text content');
            break;
          }
        }
      }
      
      if (addToCartBtn) {
        // Store original values for restoration
        if (!addToCartBtn.dataset.originalText) {
          addToCartBtn.dataset.originalText = addToCartBtn.tagName === 'INPUT' ? 
            addToCartBtn.value : addToCartBtn.textContent;
        }
        if (!addToCartBtn.dataset.originalDisabled) {
          addToCartBtn.dataset.originalDisabled = addToCartBtn.disabled.toString();
        }
        
        // Update button text
        if (addToCartBtn.tagName === 'INPUT') {
          addToCartBtn.value = text;
        } else {
          addToCartBtn.textContent = text;
        }
        addToCartBtn.disabled = disabled;
        
        // Add visual styling for preorder button
        if (!disabled) {
          addToCartBtn.classList.add('preorder-button');
          addToCartBtn.style.cssText += `
            background-color: #ff6b35 !important;
            border-color: #ff6b35 !important;
          `;
        } else {
          addToCartBtn.classList.add('preorder-disabled');
        }
        
        return true; // Success
      } else {
        log('Warning: Could not find add to cart button with any selector');
        
        // Create fallback button if no button found
        this.createFallbackButton(text, disabled);
        return false; // Fallback used
      }
    }

    createFallbackButton(text, disabled) {
      // Create a fallback button when theme integration fails
      const fallbackBtn = createElement('button', 'preorder-fallback-button');
      fallbackBtn.textContent = text;
      fallbackBtn.disabled = disabled;
      
      fallbackBtn.style.cssText = `
        width: 100%;
        padding: 15px 20px;
        font-size: 16px;
        font-weight: bold;
        border: none;
        border-radius: 6px;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        background-color: ${disabled ? '#ccc' : '#ff6b35'};
        color: white;
        margin: 15px 0;
        transition: all 0.2s ease;
      `;
      
      if (!disabled) {
        fallbackBtn.addEventListener('mouseover', () => {
          fallbackBtn.style.backgroundColor = '#e55a2b';
        });
        fallbackBtn.addEventListener('mouseout', () => {
          fallbackBtn.style.backgroundColor = '#ff6b35';
        });
      }
      
      // Try to insert near product form or price
      const insertTargets = [
        '.product-form',
        '.product__form',
        '.product-single__form',
        '.product-price',
        '.price',
        '.product__price',
        '.product-info',
        '.product__info',
        '.product-details'
      ];
      
      let inserted = false;
      for (const selector of insertTargets) {
        const target = document.querySelector(selector);
        if (target) {
          target.appendChild(fallbackBtn);
          inserted = true;
          log(`Inserted fallback button after: ${selector}`);
          break;
        }
      }
      
      if (!inserted) {
        // Last resort: append to body
        document.body.appendChild(fallbackBtn);
        log('Inserted fallback button to body as last resort');
      }
      
      this.components.push({ element: fallbackBtn });
    }

    addBadge(text, color) {
      const badge = new PreOrderBadge({ badgeText: text, badgeColor: color });
      const badgeElement = badge.create();
      
      // Find product image container with multiple selectors
      const imageSelectors = [
        '.product-single__photos',
        '.product__photos', 
        '.product-images',
        '.product-image-main',
        '.product__image',
        '.featured-image'
      ];
      
      let imageContainer = null;
      for (const selector of imageSelectors) {
        imageContainer = document.querySelector(selector);
        if (imageContainer) break;
      }
      
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(badgeElement);
        this.components.push(badge);
      }
    }

    addCountdown(targetDate) {
      const countdownContainer = createElement('div', 'preorder-countdown');
      
      // Enhanced countdown with timezone support and performance optimization
      const merchantTimezone = this.config.merchant_timezone || 'UTC';
      const customerTimezone = this.getCustomerTimezone();
      
      // Convert target date to customer timezone for display
      const targetInCustomerTZ = this.convertToCustomerTimezone(targetDate, merchantTimezone);
      
      let updateFrequency = 1000; // Start with 1 second
      let lastUpdate = 0;
      
      const updateCountdown = () => {
        const now = Date.now();
        
        // Throttle updates for performance
        if (now - lastUpdate < updateFrequency - 50) {
          return;
        }
        
        const timeRemaining = this.getTimeRemaining(targetInCustomerTZ, customerTimezone);
        
        if (timeRemaining.expired) {
          countdownContainer.innerHTML = `
            <div class="countdown-expired">
              ${t('preorder.available_now', 'Available Now!')}
            </div>
          `;
          
          // Trigger widget refresh after countdown expires
          setTimeout(() => {
            if (this.refreshWidget) {
              this.refreshWidget();
            }
          }, 2000);
          
          return;
        }
        
        // Adjust update frequency based on time remaining
        if (timeRemaining.total > 24 * 60 * 60 * 1000) {
          updateFrequency = 60000; // Update every minute if more than 24 hours
        } else if (timeRemaining.total > 60 * 60 * 1000) {
          updateFrequency = 10000; // Update every 10 seconds if more than 1 hour
        } else {
          updateFrequency = 1000; // Update every second if less than 1 hour
        }
        
        countdownContainer.innerHTML = `
          <div class="countdown-header">
            ${t('preorder.countdown.header', 'Available in:')}
            <div class="countdown-timezone">${this.formatTimezone(customerTimezone)}</div>
          </div>
          <div class="countdown-timer">
            ${timeRemaining.days > 0 ? `
              <span class="countdown-unit">
                <span class="countdown-number">${timeRemaining.days}</span>
                <span class="countdown-label">${t('preorder.countdown.days')}</span>
              </span>
              <span class="countdown-separator">:</span>
            ` : ''}
            <span class="countdown-unit">
              <span class="countdown-number">${timeRemaining.hours.toString().padStart(2, '0')}</span>
              <span class="countdown-label">${t('preorder.countdown.hours')}</span>
            </span>
            <span class="countdown-separator">:</span>
            <span class="countdown-unit">
              <span class="countdown-number">${timeRemaining.minutes.toString().padStart(2, '0')}</span>
              <span class="countdown-label">${t('preorder.countdown.minutes')}</span>
            </span>
            <span class="countdown-separator">:</span>
            <span class="countdown-unit">
              <span class="countdown-number">${timeRemaining.seconds.toString().padStart(2, '0')}</span>
              <span class="countdown-label">${t('preorder.countdown.seconds')}</span>
            </span>
          </div>
          <div class="countdown-target-date">
            ${t('preorder.starts_on', 'Starts on')}: ${this.formatDateWithTimezone(targetInCustomerTZ, customerTimezone)}
          </div>
        `;
        
        lastUpdate = now;
      };
      
      // Style the countdown with enhanced responsive design
      countdownContainer.style.cssText = `
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 20px;
        margin: 15px 0;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      
      // Add enhanced CSS for countdown styling
      this.addCountdownStyles();
  
      // Inject icon in label if enabled
      try {
        const prefs = this.getIconPreferences();
        if (prefs.show) {
          const labelEl = countdownContainer.querySelector('.countdown-label');
          if (labelEl) {
            const iconPx = this.resolveIconPx(prefs.size);
            labelEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${this.getIconImgHtml('timer.svg', iconPx)}<span>${this.translationLabel || this.label || labelEl.textContent}</span></span>`;
          }
        }
      } catch (_) {}

      // Initial update
      updateCountdown();
      
      // Create optimized interval
      const interval = setInterval(updateCountdown, updateFrequency);
      
      // Insert countdown
      const productForm = document.querySelector('.product-form, form[action*="/cart/add"]');
      if (productForm) {
        productForm.appendChild(countdownContainer);
      }
      
      this.components.push({ 
        element: countdownContainer, 
        cleanup: () => clearInterval(interval) 
      });
    }

    addCountdownStyles() {
      if (document.getElementById('preorder-countdown-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'preorder-countdown-styles';
      style.textContent = `
        .preorder-countdown .countdown-header {
          font-weight: bold;
          margin-bottom: 15px;
          color: #495057;
          font-size: 16px;
        }
        .preorder-countdown .countdown-timezone {
          font-size: 12px;
          color: #6c757d;
          font-weight: normal;
          margin-top: 4px;
        }
        .preorder-countdown .countdown-timer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        .preorder-countdown .countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 50px;
          background: white;
          border-radius: 6px;
          padding: 8px 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .preorder-countdown .countdown-number {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b35;
          line-height: 1;
        }
        .preorder-countdown .countdown-label {
          font-size: 10px;
          color: #6c757d;
          text-transform: uppercase;
          margin-top: 4px;
          font-weight: 600;
        }
        .preorder-countdown .countdown-separator {
          font-size: 20px;
          font-weight: bold;
          color: #6c757d;
          margin: 0 4px;
        }
        .preorder-countdown .countdown-target-date {
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #dee2e6;
          padding-top: 10px;
        }
        .preorder-countdown .countdown-expired {
          font-weight: bold;
          color: #28a745;
          font-size: 18px;
          padding: 20px;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
        }
        
        @media (max-width: 768px) {
          .preorder-countdown .countdown-timer {
            gap: 6px;
          }
          .preorder-countdown .countdown-unit {
            min-width: 45px;
            padding: 6px 3px;
          }
          .preorder-countdown .countdown-number {
            font-size: 20px;
          }
          .preorder-countdown .countdown-label {
            font-size: 9px;
          }
          .preorder-countdown .countdown-separator {
            font-size: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .preorder-countdown .countdown-timer {
            gap: 4px;
          }
          .preorder-countdown .countdown-unit {
            min-width: 40px;
            padding: 5px 2px;
          }
          .preorder-countdown .countdown-number {
            font-size: 16px;
          }
          .preorder-countdown .countdown-label {
            font-size: 8px;
          }
          .preorder-countdown .countdown-separator {
            font-size: 14px;
            margin: 0 2px;
          }
          .preorder-countdown .countdown-header {
            font-size: 14px;
          }
          .preorder-countdown .countdown-target-date {
            font-size: 11px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }

    getCustomerTimezone() {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch (error) {
        return 'UTC';
      }
    }

    convertToCustomerTimezone(date, fromTimezone) {
      // Simple timezone conversion for display purposes
      const dateObj = new Date(date);
      return dateObj; // Browser will handle timezone display automatically
    }

    getTimeRemaining(targetDate, timezone) {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const total = target - now;
      
      if (total <= 0) {
        return {
          total: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        };
      }
      
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);
      
      return {
        total,
        days,
        hours,
        minutes,
        seconds,
        expired: false
      };
    }

    formatTimezone(timezone) {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en', {
          timeZone: timezone,
          timeZoneName: 'short'
        });
        const parts = formatter.formatToParts(now);
        const timeZoneName = parts.find(part => part.type === 'timeZoneName');
        return timeZoneName ? timeZoneName.value : timezone;
      } catch (error) {
        return timezone;
      }
    }

    formatDateWithTimezone(date, timezone) {
      try {
        return new Date(date).toLocaleString(USER_LOCALE, {
          timeZone: timezone,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });
      } catch (error) {
        return new Date(date).toLocaleString();
      }
    }

    refreshWidget() {
      // Refresh the widget by re-initializing
      this.destroy();
      setTimeout(() => {
        this.init();
      }, 1000);
    }

    addPartialPaymentOptions(depositPercentage) {
      const paymentOptions = createElement('div', 'preorder-payment-options');
      
      const totalPrice = this.getProductPrice();
      const depositAmount = totalPrice ? (totalPrice * depositPercentage / 100).toFixed(2) : '0.00';
      const remainingAmount = totalPrice ? (totalPrice - depositAmount).toFixed(2) : '0.00';
      
      paymentOptions.innerHTML = `
        <div class="payment-options-header">${t('preorder.payment.options', 'Payment Options')}</div>
        <div class="payment-option-group">
          <label class="payment-option">
            <input type="radio" name="preorder_payment_type" value="full" checked>
            <span class="option-content">
              <span class="option-title">${t('preorder.payment.full')}</span>
              <span class="option-price">${this.formatCurrency(totalPrice || 0)}</span>
            </span>
          </label>
          <label class="payment-option">
            <input type="radio" name="preorder_payment_type" value="partial">
            <span class="option-content">
              <span class="option-title">${t('preorder.payment.deposit')} (${depositPercentage}%)</span>
              <span class="option-price">${this.formatCurrency(parseFloat(depositAmount))}</span>
              <span class="option-note">${t('preorder.payment.remaining')} ${this.formatCurrency(parseFloat(remainingAmount))} ${t('preorder.payment.due_later')}</span>
            </span>
          </label>
        </div>
      `;
      
      // Apply styles
      paymentOptions.style.cssText = `
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 15px;
        margin: 15px 0;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      // Add CSS for payment options
      const style = document.createElement('style');
      style.textContent = `
        .preorder-payment-options .payment-options-header {
          font-weight: bold;
          margin-bottom: 12px;
          color: #495057;
        }
        .preorder-payment-options .payment-option {
          display: flex;
          align-items: flex-start;
          padding: 12px;
          margin: 8px 0;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .preorder-payment-options .payment-option:hover {
          border-color: #ff6b35;
          background-color: #fff5f2;
        }
        .preorder-payment-options .payment-option input[type="radio"] {
          margin-right: 12px;
          margin-top: 2px;
        }
        .preorder-payment-options .payment-option input[type="radio"]:checked + .option-content {
          color: #ff6b35;
        }
        .preorder-payment-options .option-content {
          flex: 1;
        }
        .preorder-payment-options .option-title {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .preorder-payment-options .option-price {
          display: block;
          font-size: 16px;
          font-weight: bold;
          color: #28a745;
        }
        .preorder-payment-options .option-note {
          display: block;
          font-size: 12px;
          color: #6c757d;
          margin-top: 4px;
        }
      `;
      document.head.appendChild(style);
      
      const productForm = document.querySelector('.product-form, form[action*="/cart/add"]');
      if (productForm) {
        productForm.appendChild(paymentOptions);
      }
      
      this.components.push({ element: paymentOptions });
    }

    updatePreOrderButton(buttonText) {
      const addToCartBtn = document.querySelector('button[name="add"], input[name="add"], .btn-product-add');
      if (addToCartBtn) {
        // Store original onclick handler
        const originalOnClick = addToCartBtn.onclick;
        
        // Update button text and styling
        if (addToCartBtn.tagName === 'INPUT') {
          addToCartBtn.value = buttonText;
        } else {
          addToCartBtn.textContent = buttonText;
        }
        
        addToCartBtn.classList.add('preorder-button');
        addToCartBtn.style.cssText += `
          background-color: #ff6b35 !important;
          border-color: #ff6b35 !important;
        `;
        
        // Override click handler for partial payment logic
        addToCartBtn.onclick = (e) => {
          e.preventDefault();
          this.handlePreOrderClick(originalOnClick);
        };
      }
    }

    handlePreOrderClick(originalHandler) {
      const paymentTypeRadio = document.querySelector('input[name="preorder_payment_type"]:checked');
      const paymentType = paymentTypeRadio ? paymentTypeRadio.value : 'full';
      
      if (paymentType === 'partial') {
        // Handle partial payment flow
        this.initiatePartialPayment();
      } else {
        // Handle full payment (standard Shopify flow)
        if (originalHandler) {
          originalHandler();
        } else {
          // Fallback to standard form submission
          const form = document.querySelector('form[action*="/cart/add"]');
          if (form) {
            form.submit();
          }
        }
      }
    }

    async initiatePartialPayment() {
      try {
        const productData = this.getProductData();
        
        const response = await fetch(`${PREORDER_CONFIG.apiUrl}/partial-payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: PREORDER_CONFIG.shop,
            customer_email: this.getCustomerEmail(),
            product_id: this.productId,
            variant_id: this.variantId,
            product_title: productData.title,
            variant_title: productData.variantTitle,
            quantity: this.getQuantity(),
            unit_price: this.getProductPrice(),
            deposit_percentage: this.config.deposit_percentage || 50
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Redirect to deposit payment (Shopify draft order invoice)
          if (result.partial_payment_order && result.partial_payment_order.deposit_draft_order_id) {
            // Show success message and redirect info
            this.showPartialPaymentSuccess(result.partial_payment_order);
          }
        } else {
          throw new Error(result.error || 'Failed to create partial payment order');
        }
      } catch (error) {
        console.error('Partial payment error:', error);
        this.showPartialPaymentError(error.message);
      }
    }

    getProductData() {
      let title = '';
      let variantTitle = '';
      
      // Try to get product title from page
      const titleElement = document.querySelector('.product-single__title, .product__title, h1');
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
      
      // Try to get variant title from selected options
      const variantSelectors = document.querySelectorAll('select[name*="option"], input[name*="option"]:checked');
      const variantOptions = Array.from(variantSelectors).map(el => el.value).filter(v => v);
      if (variantOptions.length > 0) {
        variantTitle = variantOptions.join(' / ');
      }
      
      return { title, variantTitle };
    }

    getCustomerEmail() {
      // Try to get customer email from various sources
      if (window.customer && window.customer.email) {
        return window.customer.email;
      }
      
      // Fallback: prompt user for email
      return prompt('Please enter your email address for the pre-order:') || '';
    }

    getQuantity() {
      const quantityInput = document.querySelector('input[name="quantity"], select[name="quantity"]');
      return quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    }

    getProductPrice() {
      // Try multiple methods to get current product/variant price
      if (window.meta && window.meta.product && window.meta.product.price) {
        return parseFloat(window.meta.product.price) / 100; // Shopify prices are in cents
      }
      
      // Try to get from price elements on page
      const priceSelectors = [
        '.price, .product-price, .product__price',
        '.money, .price-item--regular',
        '[data-price]'
      ];
      
      for (const selector of priceSelectors) {
        const priceElement = document.querySelector(selector);
        if (priceElement) {
          const priceText = priceElement.textContent || priceElement.getAttribute('data-price');
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          if (!isNaN(price)) {
            return price;
          }
        }
      }
      
      return 0;
    }

    formatCurrency(amount) {
      return formatCurrency(amount);
    }

    showPartialPaymentSuccess(partialPaymentOrder) {
      const successMessage = createElement('div', 'partial-payment-success');
      successMessage.innerHTML = `
        <div class="success-header">✅ ${t('preorder.success.title')}</div>
        <div class="success-content">
          <p>${t('preorder.success.message')}</p>
          <div class="payment-summary">
            <div>${t('preorder.payment.deposit')}: ${this.formatCurrency(partialPaymentOrder.deposit_amount)}</div>
            <div>${t('preorder.payment.remaining')}: ${this.formatCurrency(partialPaymentOrder.remaining_amount)}</div>
            <div>${t('preorder.delivery.expected')}: ${formatDate(partialPaymentOrder.due_date)}</div>
          </div>
        </div>
      `;
      
      successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #28a745;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 400px;
        text-align: center;
      `;
      
      document.body.appendChild(successMessage);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 5000);
    }

    showPartialPaymentError(errorMessage) {
      const errorDiv = createElement('div', 'partial-payment-error');
      errorDiv.innerHTML = `
        <div class="error-header">❌ ${t('preorder.error.title')}</div>
        <div class="error-content">${errorMessage}</div>
      `;
      
      errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #dc3545;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 400px;
        text-align: center;
      `;
      
      document.body.appendChild(errorDiv);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 3000);
    }

    addDeliveryInfo(deliveryDate, deliveryNote) {
      const deliveryInfo = createElement('div', 'preorder-delivery-info');
      const prefs = this.getIconPreferences();
      const iconPx = this.resolveIconPx(prefs.size);
      const headerIcon = prefs.show ? this.getIconImgHtml('truck.svg', iconPx) : '';
  
      let content = `<div class="delivery-header" style="display:flex;align-items:center;gap:8px;">${headerIcon}<span>${t('preorder.delivery.information', 'Delivery Information')}</span></div>`;
  
      if (deliveryDate) {
        const calIcon = prefs.show ? `<span style="margin-right:6px;display:inline-flex;vertical-align:middle;">${this.getIconImgHtml('calendar.svg', iconPx)}</span>` : '';
        content += `<div class="delivery-date">${calIcon}${t('preorder.delivery.expected')}: ${formatDate(deliveryDate)}</div>`;
      }
  
      if (deliveryNote) {
        content += `<div class="delivery-note">${deliveryNote}</div>`;
      }
      
      deliveryInfo.innerHTML = content;
      
      // Apply styles
      deliveryInfo.style.cssText = `
        background: #e3f2fd;
        border: 1px solid #bbdefb;
        border-radius: 6px;
        padding: 15px;
        margin: 15px 0;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      const productForm = document.querySelector('.product-form, form[action*="/cart/add"]');
      if (productForm) {
        productForm.appendChild(deliveryInfo);
      }
      
      this.components.push({ element: deliveryInfo });
    }

    destroy() {
      // Clean up components
      this.components.forEach(component => {
        if (component.destroy) {
          component.destroy();
        }
        if (component.element && component.element.parentNode) {
          component.element.parentNode.removeChild(component.element);
        }
      });
      this.components = [];

      // Clean up observers
      this.observers.forEach(cleanup => cleanup());
      this.observers = [];

      // Reset add to cart button
      const addToCartBtn = document.querySelector('button[name="add"], input[name="add"], .btn-product-add');
      if (addToCartBtn) {
        addToCartBtn.classList.remove('preorder-button');
        addToCartBtn.style.backgroundColor = '';
        addToCartBtn.style.borderColor = '';
        addToCartBtn.disabled = false;
        
        // Reset button text to original
        if (addToCartBtn.tagName === 'INPUT') {
          addToCartBtn.value = 'Add to cart';
        } else {
          addToCartBtn.textContent = 'Add to cart';
        }
      }

      // Show hidden elements
      const hiddenElements = document.querySelectorAll('[style*="display: none"]');
      hiddenElements.forEach(el => {
        if (el.name === 'add' || el.classList.contains('btn-product-add')) {
          el.style.display = '';
        }
      });
    }
  }

  // Initialize widget when DOM is ready
  function initWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const widget = new PreOrderWidget();
        widget.init();
        window.PreOrderWidget = { instance: widget };
      });
    } else {
      const widget = new PreOrderWidget();
      widget.init();
      window.PreOrderWidget = { instance: widget };
    }
  }

  // Auto-initialize
  initWidget();

  // Expose widget globally for manual control
  window.PreOrderWidget = window.PreOrderWidget || {};
  window.PreOrderWidget.PreOrderWidget = PreOrderWidget;
  window.PreOrderWidget.create = () => new PreOrderWidget();

})();
