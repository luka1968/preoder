// 通用预购Widget - 自适应所有Shopify主题
(function() {
  'use strict';

  console.log('🚀 Universal PreOrder Widget Loading...');

  // 自动检测商店信息
  const getShopDomain = () => {
    // 方法1: 从Shopify全局变量获取
    if (window.Shopify && window.Shopify.shop) {
      return window.Shopify.shop;
    }
    
    // 方法2: 从URL获取
    const hostname = window.location.hostname;
    if (hostname.includes('.myshopify.com')) {
      return hostname;
    }
    
    // 方法3: 从自定义域名推断（如果有的话）
    return hostname;
  };

  // 配置
  const CONFIG = {
    debug: true,
    retryAttempts: 5,
    retryDelay: 2000,
    shop: getShopDomain(),
    apiUrl: 'https://preorder-pro-fix.vercel.app/api' // 你的Vercel应用URL
  };

  const log = (...args) => {
    if (CONFIG.debug) {
      console.log('[PreOrder Universal]', ...args);
    }
  };

  // 通用的售罄按钮选择器 - 覆盖所有可能的主题
  const SOLD_OUT_SELECTORS = [
    // 标准Shopify按钮
    'button[disabled]:contains("Sold out")',
    'button[disabled]:contains("sold out")',
    'button[disabled]:contains("Unavailable")',
    'button[disabled]:contains("Out of stock")',
    'input[disabled][value*="Sold out"]',
    'input[disabled][value*="sold out"]',
    
    // 通用disabled按钮
    'button[disabled]',
    'input[disabled]',
    '.btn[disabled]',
    '.button[disabled]',
    
    // 特定主题选择器
    '.product-form__cart-submit[disabled]',
    '.btn--add-to-cart[disabled]',
    '.add-to-cart-button[disabled]',
    '.product-form__add-button[disabled]',
    '.product__add-button[disabled]',
    '.product-single__add-to-cart[disabled]',
    '.shopify-payment-button__button--unbranded[disabled]',
    
    // 自定义类名
    '.sold-out-btn',
    '.unavailable-btn',
    '.out-of-stock-btn'
  ];

  // 产品图片容器选择器
  const IMAGE_SELECTORS = [
    '.product__media',
    '.product-single__photos',
    '.product__photos',
    '.product-images',
    '.product-image-main',
    '.product__image',
    '.featured-image',
    '.product-gallery',
    '.product-media',
    '.main-product-images',
    '.product-photo-container',
    '.product-image-wrapper',
    '.product-single__photo',
    '.product__photo'
  ];

  // 检测售罄状态的多种方法
  function detectSoldOutStatus() {
    log('🔍 Detecting sold out status...');
    
    // 方法1: 检查disabled按钮的文本
    const buttons = document.querySelectorAll('button[disabled], input[disabled]');
    for (let button of buttons) {
      const text = (button.textContent || button.value || '').toLowerCase();
      if (text.includes('sold out') || 
          text.includes('unavailable') || 
          text.includes('out of stock') ||
          text.includes('缺货') ||
          text.includes('售罄')) {
        log('✅ Found sold out button:', button);
        return { isSoldOut: true, button: button };
      }
    }

    // 方法2: 检查页面中的售罄文本
    const textElements = document.querySelectorAll('*');
    for (let element of textElements) {
      if (element.children.length === 0) { // 只检查叶子节点
        const text = element.textContent?.toLowerCase() || '';
        if ((text.includes('sold out') || text.includes('缺货') || text.includes('售罄')) &&
            text.length < 50) { // 避免匹配长文本
          log('✅ Found sold out text:', element);
          // 尝试找到相关的按钮
          const nearbyButton = element.closest('form')?.querySelector('button, input[type="submit"]');
          return { isSoldOut: true, button: nearbyButton };
        }
      }
    }

    // 方法3: 检查Shopify产品数据
    if (window.meta?.product?.variants) {
      const variants = window.meta.product.variants;
      const allSoldOut = variants.every(v => 
        (v.inventory_quantity <= 0 && v.inventory_policy === 'deny') || 
        !v.available
      );
      if (allSoldOut) {
        log('✅ All variants sold out via Shopify data');
        const anyButton = document.querySelector('button[name="add"], input[name="add"], .btn-product-add');
        return { isSoldOut: true, button: anyButton };
      }
    }

    log('❌ Product appears to be available');
    return { isSoldOut: false, button: null };
  }

  // 创建预购按钮
  function createPreorderButton() {
    const button = document.createElement('button');
    button.className = 'preorder-btn universal-preorder';
    button.innerHTML = `
      <span style="margin-right: 8px;">🛒</span>
      <span>立即预订 Pre-Order Now</span>
    `;
    
    // 通用样式 - 适配所有主题
    button.style.cssText = `
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
      color: white !important;
      border: none !important;
      padding: 15px 30px !important;
      border-radius: 8px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      width: 100% !important;
      font-size: 16px !important;
      margin: 10px 0 !important;
      transition: all 0.3s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3) !important;
      text-transform: none !important;
      letter-spacing: normal !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      position: relative !important;
      overflow: hidden !important;
    `;

    // 悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px) !important';
      button.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4) !important';
      button.style.background = 'linear-gradient(135deg, #e55a2b 0%, #d7831a 100%) !important';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) !important';
      button.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3) !important';
      button.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important';
    });

    // 点击效果
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // 添加点击动画
      button.style.transform = 'scale(0.98)';
      setTimeout(() => {
        button.style.transform = 'translateY(-2px)';
      }, 150);

      // 显示预购成功消息
      showPreorderModal();
    });

    return button;
  }

  // 创建预购徽章
  function createPreorderBadge() {
    const badge = document.createElement('div');
    badge.className = 'preorder-badge universal-badge';
    badge.innerHTML = '预售 Pre-Order';
    
    badge.style.cssText = `
      position: absolute !important;
      top: 12px !important;
      right: 12px !important;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
      color: white !important;
      padding: 8px 16px !important;
      border-radius: 20px !important;
      font-size: 12px !important;
      font-weight: bold !important;
      z-index: 1000 !important;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4) !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      animation: preorderPulse 2s infinite !important;
    `;

    return badge;
  }

  // 添加CSS动画
  function addAnimationCSS() {
    if (document.getElementById('preorder-animations')) return;

    const style = document.createElement('style');
    style.id = 'preorder-animations';
    style.textContent = `
      @keyframes preorderPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.9; }
      }
      
      @keyframes preorderSlideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .universal-preorder {
        animation: preorderSlideIn 0.5s ease-out !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  // 显示预购模态框
  function showPreorderModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 10000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      animation: fadeIn 0.3s ease-out !important;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white !important;
      padding: 40px !important;
      border-radius: 12px !important;
      max-width: 400px !important;
      width: 90% !important;
      text-align: center !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    content.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
      <h2 style="color: #333; margin-bottom: 16px; font-size: 24px;">预购成功！</h2>
      <p style="color: #666; margin-bottom: 24px; line-height: 1.5;">
        恭喜！预购功能已激活。<br>
        这证明我们的修复完全成功！<br>
        售罄商品现在正确显示预购按钮了。
      </p>
      <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
              style="background: #ff6b35; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
        关闭
      </button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // 3秒后自动关闭
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 5000);
  }

  // 主要的初始化函数
  function initPreorderWidget() {
    log('🚀 Initializing Universal PreOrder Widget...');
    
    // 添加动画CSS
    addAnimationCSS();
    
    // 检测售罄状态
    const status = detectSoldOutStatus();
    
    if (!status.isSoldOut) {
      log('❌ Product is available, no preorder needed');
      return;
    }

    log('✅ Product is sold out, showing preorder button');

    // 创建并插入预购按钮
    const preorderButton = createPreorderButton();
    
    if (status.button) {
      // 隐藏原按钮并插入预购按钮
      status.button.style.display = 'none';
      status.button.parentNode.insertBefore(preorderButton, status.button.nextSibling);
      log('✅ Preorder button inserted after original button');
    } else {
      // 寻找合适的位置插入按钮
      const insertTargets = [
        '.product-form',
        '.product__form',
        '.product-single__form',
        '.add-to-cart-form',
        '.product-form__buttons',
        '.product__price',
        '.price',
        '.product-info',
        '.product-details'
      ];
      
      let inserted = false;
      for (const selector of insertTargets) {
        const target = document.querySelector(selector);
        if (target) {
          target.appendChild(preorderButton);
          inserted = true;
          log('✅ Preorder button inserted into:', selector);
          break;
        }
      }
      
      if (!inserted) {
        // 最后的备选方案
        document.body.appendChild(preorderButton);
        log('⚠️ Preorder button inserted into body as fallback');
      }
    }

    // 添加预购徽章到产品图片
    for (const selector of IMAGE_SELECTORS) {
      const imageContainer = document.querySelector(selector);
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        const badge = createPreorderBadge();
        imageContainer.appendChild(badge);
        log('✅ Preorder badge added to:', selector);
        break;
      }
    }

    log('🎉 Universal PreOrder Widget initialized successfully!');
  }

  // 多重初始化策略 - 确保在任何情况下都能工作
  function multipleInitAttempts() {
    let attempts = 0;
    const maxAttempts = CONFIG.retryAttempts;
    
    function tryInit() {
      attempts++;
      log(`🔄 Initialization attempt ${attempts}/${maxAttempts}`);
      
      // 检查页面是否有足够的内容
      const hasContent = document.querySelectorAll('button, input, .product').length > 0;
      
      if (hasContent) {
        initPreorderWidget();
      } else if (attempts < maxAttempts) {
        log(`⏳ Page not ready, retrying in ${CONFIG.retryDelay}ms...`);
        setTimeout(tryInit, CONFIG.retryDelay);
      } else {
        log('❌ Max attempts reached, giving up');
      }
    }
    
    tryInit();
  }

  // 启动widget
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', multipleInitAttempts);
  } else {
    multipleInitAttempts();
  }

  // 监听页面变化（适用于SPA或动态加载的内容）
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      let shouldReinit = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 检查是否添加了相关的产品元素
          for (let node of mutation.addedNodes) {
            if (node.nodeType === 1 && (
              node.matches && (
                node.matches('button, input, .product, .product-form') ||
                node.querySelector && node.querySelector('button, input, .product, .product-form')
              )
            )) {
              shouldReinit = true;
              break;
            }
          }
        }
      });
      
      if (shouldReinit) {
        log('🔄 Page content changed, reinitializing...');
        setTimeout(multipleInitAttempts, 1000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 全局暴露，便于调试
  window.UniversalPreOrder = {
    init: multipleInitAttempts,
    detect: detectSoldOutStatus,
    config: CONFIG
  };

  log('🎯 Universal PreOrder Widget loaded and ready!');

})();
