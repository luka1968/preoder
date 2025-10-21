// PreOrder Pro - Professional Edition
// Enterprise-grade Shopify preorder solution

(function() {
  'use strict';
  
  // Professional Configuration
  const PROFESSIONAL_CONFIG = {
    version: '2.0.0',
    mode: 'professional',
    debug: false,
    apiUrl: 'https://shopmall.dpdns.org/api',
    shop: window.Shopify?.shop || 'unknown',
    performance: {
      maxInitAttempts: 10,
      initInterval: 1000,
      detectionTimeout: 5000
    },
    ui: {
      animationDuration: 300,
      hoverDelay: 100,
      modalTimeout: 12000
    }
  };
  
  // Professional Logger
  class ProfessionalLogger {
    constructor(debug = false) {
      this.debug = debug;
      this.logs = [];
    }
    
    log(level, message, data = null) {
      const timestamp = new Date().toISOString();
      const logEntry = { timestamp, level, message, data };
      this.logs.push(logEntry);
      
      if (this.debug || level === 'error') {
        const prefix = `[PreOrder Pro ${level.toUpperCase()}]`;
        if (data) {
          console[level](prefix, message, data);
        } else {
          console[level](prefix, message);
        }
      }
    }
    
    info(message, data) { this.log('info', message, data); }
    warn(message, data) { this.log('warn', message, data); }
    error(message, data) { this.log('error', message, data); }
    debug(message, data) { this.log('debug', message, data); }
    
    getLogs() { return this.logs; }
    exportLogs() { return JSON.stringify(this.logs, null, 2); }
  }
  
  // Professional Detection Engine
  class SoldOutDetectionEngine {
    constructor(logger) {
      this.logger = logger;
      this.detectionMethods = [
        this.detectDisabledButtons.bind(this),
        this.detectButtonText.bind(this),
        this.detectClassNames.bind(this),
        this.detectShopifyData.bind(this),
        this.detectPageContent.bind(this),
        this.detectFormState.bind(this)
      ];
    }
    
    async detect() {
      this.logger.info('Starting professional sold-out detection');
      
      const results = [];
      
      for (let i = 0; i < this.detectionMethods.length; i++) {
        const method = this.detectionMethods[i];
        try {
          const result = await method();
          if (result) {
            results.push({ ...result, methodIndex: i });
          }
        } catch (error) {
          this.logger.error(`Detection method ${i} failed`, error);
        }
      }
      
      if (results.length === 0) {
        this.logger.warn('No sold-out status detected');
        return null;
      }
      
      // Select best result based on confidence score
      const bestResult = results.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      this.logger.info('Best detection result', bestResult);
      return bestResult;
    }
    
    detectDisabledButtons() {
      const buttons = document.querySelectorAll('button:disabled, input:disabled');
      
      for (const button of buttons) {
        const text = (button.textContent || button.value || '').toLowerCase().trim();
        const soldOutKeywords = [
          'sold out', 'unavailable', 'out of stock', 'sold', 'out',
          '缺货', '售罄', '无库存', 'épuisé', 'ausverkauft', 'agotado'
        ];
        
        if (soldOutKeywords.some(keyword => text.includes(keyword))) {
          return {
            method: 'disabled_button',
            element: button,
            confidence: 0.95,
            text: text,
            reason: 'Disabled button with sold-out text'
          };
        }
      }
      return null;
    }
    
    detectButtonText() {
      const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
      
      for (const button of buttons) {
        const text = (button.textContent || button.value || '').toLowerCase().trim();
        if (text.includes('sold out') || text.includes('unavailable')) {
          return {
            method: 'button_text',
            element: button,
            confidence: 0.85,
            text: text,
            reason: 'Button text indicates sold out'
          };
        }
      }
      return null;
    }
    
    detectClassNames() {
      const selectors = [
        '.sold-out', '.unavailable', '.out-of-stock',
        '[class*="sold"]', '[class*="unavailable"]', '[class*="disabled"]'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          const button = elements[0].closest('form, .product-form')?.querySelector('button, input[type="submit"]');
          if (button) {
            return {
              method: 'class_detection',
              element: button,
              confidence: 0.75,
              text: selector,
              reason: 'CSS class indicates sold out'
            };
          }
        }
      }
      return null;
    }
    
    detectShopifyData() {
      // Check Shopify product data
      if (window.meta?.product?.variants) {
        const variants = window.meta.product.variants;
        const allSoldOut = variants.every(v => !v.available);
        
        if (allSoldOut) {
          const button = document.querySelector('.product-form button, form[action*="/cart/add"] button');
          if (button) {
            return {
              method: 'shopify_data',
              element: button,
              confidence: 0.98,
              text: 'shopify_product_data',
              reason: 'All product variants unavailable'
            };
          }
        }
      }
      
      // Check Shopify theme variables
      if (window.theme?.product?.available === false) {
        const button = document.querySelector('.product-form button');
        if (button) {
          return {
            method: 'theme_data',
            element: button,
            confidence: 0.90,
            text: 'theme_product_data',
            reason: 'Theme indicates product unavailable'
          };
        }
      }
      
      return null;
    }
    
    detectPageContent() {
      const bodyText = document.body.textContent.toLowerCase();
      const soldOutIndicators = ['sold out', 'out of stock', 'unavailable'];
      
      if (soldOutIndicators.some(indicator => bodyText.includes(indicator))) {
        const button = document.querySelector('form[action*="/cart/add"] button, .product-form button');
        if (button) {
          return {
            method: 'page_content',
            element: button,
            confidence: 0.60,
            text: 'page_content_analysis',
            reason: 'Page content suggests sold out'
          };
        }
      }
      return null;
    }
    
    detectFormState() {
      const forms = document.querySelectorAll('form[action*="/cart/add"], .product-form');
      
      for (const form of forms) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton && submitButton.disabled) {
          return {
            method: 'form_state',
            element: submitButton,
            confidence: 0.80,
            text: 'disabled_submit',
            reason: 'Form submit button is disabled'
          };
        }
      }
      return null;
    }
  }
  
  // Professional UI Manager
  class ProfessionalUIManager {
    constructor(logger, config) {
      this.logger = logger;
      this.config = config;
      this.stylesInjected = false;
    }
    
    injectStyles() {
      if (this.stylesInjected) return;
      
      const styles = `
        /* PreOrder Pro - Professional Styles */
        .preorder-professional {
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
          color: white !important;
          border: none !important;
          padding: 18px 36px !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          width: 100% !important;
          font-size: 16px !important;
          margin: 15px 0 !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4) !important;
          text-transform: none !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          position: relative !important;
          overflow: hidden !important;
          min-height: 60px !important;
          letter-spacing: 0.5px !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
          animation: preorderProfessionalSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .preorder-professional:hover {
          background: linear-gradient(135deg, #e55a2b 0%, #d7831a 100%) !important;
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 0 15px 40px rgba(255, 107, 53, 0.6) !important;
        }
        
        .preorder-professional:active {
          transform: translateY(-2px) scale(1.01) !important;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5) !important;
        }
        
        .preorder-professional::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .preorder-professional:hover::before {
          left: 100%;
        }
        
        .preorder-professional-icon {
          margin-right: 12px !important;
          font-size: 22px !important;
          animation: preorderIconFloat 3s ease-in-out infinite !important;
        }
        
        .preorder-professional-text {
          font-weight: 700 !important;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
        
        .preorder-professional-badge {
          position: absolute !important;
          top: 12px !important;
          right: 12px !important;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
          color: white !important;
          padding: 10px 18px !important;
          border-radius: 25px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          z-index: 1000 !important;
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
          animation: preorderBadgePulse 4s infinite !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }
        
        .sold-out-professional-hidden {
          opacity: 0 !important;
          transform: scale(0.9) translateY(10px) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          pointer-events: none !important;
        }
        
        @keyframes preorderProfessionalSlideIn {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes preorderIconFloat {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-3px); 
          }
        }
        
        @keyframes preorderBadgePulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.9; 
          }
        }
        
        /* Professional Modal Styles */
        .preorder-professional-modal {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.8) !important;
          z-index: 99999 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          backdrop-filter: blur(10px) !important;
          animation: modalProfessionalFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .preorder-professional-modal-content {
          background: white !important;
          padding: 60px !important;
          border-radius: 24px !important;
          max-width: 650px !important;
          width: 90% !important;
          text-align: center !important;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5) !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          animation: modalProfessionalSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
        }
        
        @keyframes modalProfessionalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalProfessionalSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(60px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .preorder-professional {
            font-size: 15px !important;
            padding: 16px 32px !important;
            min-height: 56px !important;
          }
          
          .preorder-professional-badge {
            font-size: 12px !important;
            padding: 8px 14px !important;
          }
          
          .preorder-professional-modal-content {
            padding: 40px !important;
            border-radius: 20px !important;
          }
        }
        
        /* Dark Theme Support */
        @media (prefers-color-scheme: dark) {
          .preorder-professional {
            box-shadow: 0 10px 30px rgba(255, 107, 53, 0.6) !important;
          }
          
          .preorder-professional-modal-content {
            background: #1a1a1a !important;
            color: white !important;
          }
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'preorder-professional-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
      
      this.stylesInjected = true;
      this.logger.info('Professional styles injected');
    }
    
    createPreorderButton(config = {}) {
      const button = document.createElement('button');
      button.className = 'preorder-professional';
      
      const buttonText = config.buttonText || 
                        this.config.buttonText || 
                        '立即预订 Pre-Order Now';
      
      button.innerHTML = `
        <span class="preorder-professional-icon">🛒</span>
        <span class="preorder-professional-text">${buttonText}</span>
      `;
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showSuccessModal();
      });
      
      this.logger.info('Professional preorder button created');
      return button;
    }
    
    showSuccessModal() {
      // Remove existing modal
      const existingModal = document.getElementById('preorder-professional-modal');
      if (existingModal) existingModal.remove();
      
      const modal = document.createElement('div');
      modal.id = 'preorder-professional-modal';
      modal.className = 'preorder-professional-modal';
      
      const content = document.createElement('div');
      content.className = 'preorder-professional-modal-content';
      
      content.innerHTML = `
        <div style="font-size: 100px; margin-bottom: 40px; animation: successProfessionalBounce 1.5s ease-out;">🎉</div>
        <h2 style="color: #333; margin-bottom: 25px; font-size: 36px; margin-top: 0; font-weight: 800;">预购成功！</h2>
        
        <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 25px; border-radius: 16px; margin-bottom: 35px;">
          <p style="margin: 0; font-size: 20px; font-weight: 700;">✅ PreOrder Pro 专业版运行完美！</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 16px; margin-bottom: 35px; text-align: left;">
          <h3 style="margin-top: 0; color: #333; font-size: 20px; margin-bottom: 20px;">📊 专业系统信息</h3>
          <div style="display: grid; gap: 12px; font-size: 15px; color: #666;">
            <div><strong>🏪 商店:</strong> <code style="background: #e9ecef; padding: 4px 10px; border-radius: 6px;">${PROFESSIONAL_CONFIG.shop}</code></div>
            <div><strong>🔧 版本:</strong> <span style="color: #ff6b35; font-weight: 700;">Professional v${PROFESSIONAL_CONFIG.version}</span></div>
            <div><strong>🎯 模式:</strong> <span style="color: #28a745; font-weight: 700;">App Embed Block</span></div>
            <div><strong>🕒 时间:</strong> ${new Date().toLocaleString()}</div>
            <div><strong>📈 状态:</strong> <span style="color: #28a745; font-weight: 700;">企业级运行</span></div>
          </div>
        </div>
        
        <div style="display: flex; gap: 18px; justify-content: center; flex-wrap: wrap;">
          <button onclick="this.closest('#preorder-professional-modal').remove()" 
                  style="background: #ff6b35; color: white; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 16px; transition: all 0.3s; box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);">
            关闭
          </button>
          <button onclick="window.open('https://shopmall.dpdns.org', '_blank')" 
                  style="background: #6c757d; color: white; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 16px; transition: all 0.3s;">
            管理应用
          </button>
          <button onclick="location.reload()" 
                  style="background: #28a745; color: white; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 16px; transition: all 0.3s;">
            刷新页面
          </button>
        </div>
      `;
      
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      // Add success animation styles
      const animationStyles = `
        @keyframes successProfessionalBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-20px) scale(1.1); }
          60% { transform: translateY(-10px) scale(1.05); }
        }
      `;
      
      if (!document.getElementById('preorder-professional-animations')) {
        const animationSheet = document.createElement('style');
        animationSheet.id = 'preorder-professional-animations';
        animationSheet.textContent = animationStyles;
        document.head.appendChild(animationSheet);
      }
      
      // Auto-close after timeout
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, this.config.ui.modalTimeout);
      
      this.logger.info('Professional success modal displayed');
    }
    
    addPreorderBadge() {
      const productImages = document.querySelectorAll(
        '.product__photo img, .product-single__photo img, .product-image img, .product-media img'
      );
      
      if (productImages.length > 0) {
        const imageContainer = productImages[0].parentNode;
        if (imageContainer && !imageContainer.querySelector('.preorder-professional-badge')) {
          const badge = document.createElement('div');
          badge.className = 'preorder-professional-badge';
          badge.textContent = 'Pre-Order';
          
          imageContainer.style.position = 'relative';
          imageContainer.appendChild(badge);
          
          this.logger.info('Professional preorder badge added');
        }
      }
    }
  }
  
  // Professional PreOrder Manager
  class ProfessionalPreOrderManager {
    constructor() {
      this.logger = new ProfessionalLogger(PROFESSIONAL_CONFIG.debug);
      this.detectionEngine = new SoldOutDetectionEngine(this.logger);
      this.uiManager = new ProfessionalUIManager(this.logger, PROFESSIONAL_CONFIG);
      this.initialized = false;
    }
    
    async init(config = {}) {
      if (this.initialized) {
        this.logger.warn('Professional PreOrder Manager already initialized');
        return;
      }
      
      this.logger.info('Initializing Professional PreOrder Manager', { config, version: PROFESSIONAL_CONFIG.version });
      
      // Merge configuration
      Object.assign(PROFESSIONAL_CONFIG, config);
      
      // Inject professional styles
      this.uiManager.injectStyles();
      
      // Detect sold-out status
      const soldOutResult = await this.detectionEngine.detect();
      
      if (!soldOutResult) {
        this.logger.info('Product not sold out, preorder functionality on standby');
        return;
      }
      
      this.logger.info('Sold-out product detected, activating preorder functionality', soldOutResult);
      
      // Create and insert preorder button
      const preorderButton = this.uiManager.createPreorderButton(PROFESSIONAL_CONFIG);
      this.insertPreorderButton(soldOutResult.element, preorderButton);
      
      // Add preorder badge
      this.uiManager.addPreorderBadge();
      
      // Mark as initialized
      this.initialized = true;
      
      // Dispatch professional event
      this.dispatchProfessionalEvent('preorder:professional_activated', {
        version: PROFESSIONAL_CONFIG.version,
        detection: soldOutResult,
        timestamp: new Date().toISOString()
      });
      
      this.logger.info('Professional PreOrder Manager initialization complete');
    }
    
    insertPreorderButton(soldOutButton, preorderButton) {
      if (soldOutButton) {
        // Professional transition effect
        soldOutButton.classList.add('sold-out-professional-hidden');
        
        setTimeout(() => {
          soldOutButton.style.display = 'none';
          soldOutButton.parentNode.insertBefore(preorderButton, soldOutButton.nextSibling);
          this.logger.info('Preorder button professionally inserted');
        }, PROFESSIONAL_CONFIG.ui.animationDuration);
      } else {
        // Find optimal insertion point
        const insertionTargets = [
          '.product-form__buttons',
          '.product-form',
          '.product__form',
          '.add-to-cart-form',
          'form[action*="/cart/add"]',
          '.product-form__cart',
          '.product__price',
          '.product-single__form',
          '.product'
        ];
        
        let inserted = false;
        for (const selector of insertionTargets) {
          const target = document.querySelector(selector);
          if (target) {
            target.appendChild(preorderButton);
            inserted = true;
            this.logger.info('Preorder button inserted at', selector);
            break;
          }
        }
        
        if (!inserted) {
          const fallbackContainer = document.querySelector('main, .main, #main, .container, body');
          if (fallbackContainer) {
            fallbackContainer.appendChild(preorderButton);
            this.logger.warn('Preorder button inserted at fallback location');
          }
        }
      }
    }
    
    dispatchProfessionalEvent(eventName, detail) {
      if (window.dispatchEvent) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
        this.logger.info('Professional event dispatched', { eventName, detail });
      }
    }
    
    getLogs() {
      return this.logger.getLogs();
    }
    
    exportLogs() {
      return this.logger.exportLogs();
    }
    
    restart() {
      this.initialized = false;
      this.init(PROFESSIONAL_CONFIG);
    }
  }
  
  // Initialize Professional PreOrder System
  function initializeProfessionalSystem() {
    // Prevent duplicate initialization
    if (window.PreOrderProfessionalLoaded) {
      console.log('✅ PreOrder Pro Professional already loaded');
      return;
    }
    window.PreOrderProfessionalLoaded = true;
    
    // Create professional manager
    const professionalManager = new ProfessionalPreOrderManager();
    
    // Initialize with configuration from App Embed Block or defaults
    const config = window.PREORDER_PRO_CONFIG || PROFESSIONAL_CONFIG;
    
    // Multi-attempt initialization for reliability
    let attempts = 0;
    const maxAttempts = PROFESSIONAL_CONFIG.performance.maxInitAttempts;
    
    function attemptInit() {
      attempts++;
      console.log(`🔄 Professional initialization attempt ${attempts}/${maxAttempts}`);
      
      const isReady = document.readyState === 'complete' || 
                     document.querySelector('button, input, .product, .product-form');
      
      if (isReady) {
        professionalManager.init(config);
      } else if (attempts < maxAttempts) {
        setTimeout(attemptInit, PROFESSIONAL_CONFIG.performance.initInterval);
      } else {
        console.warn('⚠️ Professional initialization reached max attempts, forcing init');
        professionalManager.init(config);
      }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attemptInit);
      document.addEventListener('load', attemptInit);
    } else {
      attemptInit();
    }
    
    // Additional delayed attempts for dynamic content
    setTimeout(attemptInit, 3000);
    setTimeout(attemptInit, 6000);
    
    // Expose professional API
    window.PreOrderPro = {
      manager: professionalManager,
      init: (config) => professionalManager.init(config),
      restart: () => professionalManager.restart(),
      getLogs: () => professionalManager.getLogs(),
      exportLogs: () => professionalManager.exportLogs(),
      config: PROFESSIONAL_CONFIG,
      version: PROFESSIONAL_CONFIG.version
    };
    
    console.log('🎯 PreOrder Pro Professional Edition loaded successfully');
    console.log('📊 Version:', PROFESSIONAL_CONFIG.version);
    console.log('🔧 Debug commands: window.PreOrderPro.restart(), window.PreOrderPro.getLogs()');
  }
  
  // Start Professional System
  initializeProfessionalSystem();
  
})();
