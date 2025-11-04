// PreOrder Pro - Universal Widget (从 assets 复制)
// 这个文件需要可以通过 https://your-app.vercel.app/universal-preorder.js 访问

// 直接加载修复后的脚本
(function() {
  'use strict';

  console.log('🚀 PreOrder Universal Widget (App Embed) Loading...');

  // 获取配置
  const CONFIG = window.PREORDER_CONFIG || {
    shop: window.Shopify?.shop || window.location.hostname,
    apiUrl: 'https://preorder-pro-fix.vercel.app/api',
    enabled: true,
    debug: false
  };

  const log = (...args) => {
    if (CONFIG.debug) {
      console.log('[PreOrder App Embed]', ...args);
    }
  };

  log('Configuration:', CONFIG);

  // 如果未启用，直接返回
  if (!CONFIG.enabled) {
    log('PreOrder is disabled, exiting');
    return;
  }

  // 通用的售罄按钮选择器 - 覆盖所有可能的主题
  const SOLD_OUT_SELECTORS = [
    'button[disabled]',
    'input[disabled]',
    '.btn[disabled]',
    '.button[disabled]',
    '.product-form__cart-submit[disabled]',
    '.btn--add-to-cart[disabled]',
    '.add-to-cart-button[disabled]',
    '.product-form__add-button[disabled]',
    '.product__add-button[disabled]',
    '.product-single__add-to-cart[disabled]',
    '.shopify-payment-button__button--unbranded[disabled]'
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

  // 检测售罄状态
  function detectSoldOutStatus() {
    log('🔍 Detecting sold out status...');
    
    // 方法1: 检查disabled按钮的文本
    const buttons = document.querySelectorAll(SOLD_OUT_SELECTORS.join(', '));
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

    // 方法2: 检查Shopify产品数据
    if (window.meta?.product?.variants) {
      const variants = window.meta.product.variants;
      const currentVariantId = new URLSearchParams(window.location.search).get('variant');
      
      let targetVariant = null;
      if (currentVariantId) {
        targetVariant = variants.find(v => v.id.toString() === currentVariantId);
      } else {
        targetVariant = variants[0]; // 默认变体
      }
      
      if (targetVariant) {
        // 修复：更宽松的库存检测逻辑
        const isOutOfStock = (
          // 检查available字段（最可靠）
          targetVariant.available === false ||
          // 检查库存数量为0或负数
          (typeof targetVariant.inventory_quantity === 'number' && targetVariant.inventory_quantity <= 0) ||
          // 检查库存管理且库存为0
          (targetVariant.inventory_management && targetVariant.inventory_quantity <= 0)
        );
        
        if (isOutOfStock) {
          log('✅ Variant sold out via Shopify data:', targetVariant);
          log('📊 Inventory details:', {
            available: targetVariant.available,
            inventory_quantity: targetVariant.inventory_quantity,
            inventory_policy: targetVariant.inventory_policy,
            inventory_management: targetVariant.inventory_management
          });
          const anyButton = document.querySelector('button[name="add"], input[name="add"], .btn-product-add');
          return { isSoldOut: true, button: anyButton };
        }
      }
    }

    log('❌ Product appears to be available');
    return { isSoldOut: false, button: null };
  }

  // 获取产品信息
  function getProductInfo() {
    // 尝试多种方式获取 productId
    let productId = null;
    
    // 方法1: 从 window.meta
    if (window.meta?.product?.id) {
      productId = window.meta.product.id;
    }
    
    // 方法2: 从 data 属性
    if (!productId) {
      const productEl = document.querySelector('[data-product-id]');
      if (productEl) {
        productId = productEl.dataset.productId;
      }
    }
    
    // 方法3: 从 URL
    if (!productId) {
      productId = new URLSearchParams(window.location.search).get('product');
    }
    
    // 方法4: 从 Shopify 全局对象
    if (!productId && window.ShopifyAnalytics?.meta?.product?.id) {
      productId = window.ShopifyAnalytics.meta.product.id;
    }
    
    // 尝试多种方式获取 variantId
    let variantId = null;
    
    // 方法1: 从 URL 参数
    variantId = new URLSearchParams(window.location.search).get('variant');
    
    // 方法2: 从选中的变体
    if (!variantId) {
      const variantSelect = document.querySelector('select[name="id"]');
      if (variantSelect) {
        variantId = variantSelect.value;
      }
    }
    
    // 方法3: 从隐藏的 input
    if (!variantId) {
      const variantInput = document.querySelector('input[name="id"]');
      if (variantInput) {
        variantId = variantInput.value;
      }
    }
    
    // 方法4: 从 window.meta
    if (!variantId && window.meta?.product?.variants?.[0]?.id) {
      variantId = window.meta.product.variants[0].id;
    }
    
    // 方法5: 从 Shopify 全局对象
    if (!variantId && window.ShopifyAnalytics?.meta?.product?.variants?.[0]?.id) {
      variantId = window.ShopifyAnalytics.meta.product.variants[0].id;
    }
    
    log('📦 Product Info:', { productId, variantId });

    return { productId, variantId };
  }

  // 创建预购按钮
  function createPreorderButton() {
    const button = document.createElement('button');
    button.className = 'preorder-btn animate-in';
    button.innerHTML = `
      <span style="margin-right: 8px;">🛒</span>
      <span>立即预订 Pre-Order Now</span>
    `;

    // 点击事件
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // 添加点击动画
      button.style.transform = 'scale(0.98)';
      setTimeout(() => {
        button.style.transform = 'translateY(-2px)';
      }, 150);

      // 获取产品信息
      const { productId, variantId } = getProductInfo();
      
      // 调用预购API或显示预购表单
      try {
        await handlePreorderClick(productId, variantId);
      } catch (error) {
        console.error('PreOrder error:', error);
        showPreorderModal();
      }
    });

    return button;
  }

  // 处理预购点击
  async function handlePreorderClick(productId, variantId) {
    log('🛒 PreOrder button clicked', { productId, variantId });
    
    // 显示输入表单
    showPreorderForm(productId, variantId);
  }
  
  // 提交预购到后端
  async function submitPreorder(productId, variantId, email, name) {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/preorder/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: CONFIG.shop,
          productId: productId,
          variantId: variantId,
          email: email,
          name: name
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        log('✅ Preorder submitted successfully', result);
        return { success: true, data: result };
      } else {
        log('❌ Preorder submission failed', result);
        return { success: false, error: result.error || 'Unknown error' };
      }
    } catch (error) {
      log('❌ Preorder submission error', error);
      return { success: false, error: error.message };
    }
  }

  // 创建预购徽章
  function createPreorderBadge() {
    const badge = document.createElement('div');
    badge.className = 'preorder-badge';
    badge.innerHTML = '预售 Pre-Order';
    return badge;
  }

  // 显示预购表单
  function showPreorderForm(productId, variantId) {
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
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    content.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px; text-align: center;">🛒</div>
      <h2 style="color: #333; margin-bottom: 16px; font-size: 24px; text-align: center;">预购商品</h2>
      <p style="color: #666; margin-bottom: 24px; line-height: 1.5; text-align: center;">
        商品到货后我们会立即通知您
      </p>
      <form id="preorder-form" style="text-align: left;">
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">邮箱 *</label>
          <input type="email" id="preorder-email" required 
                 style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
                 placeholder="your@email.com">
        </div>
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">姓名</label>
          <input type="text" id="preorder-name" 
                 style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
                 placeholder="您的姓名（可选）">
        </div>
        <div style="display: flex; gap: 12px;">
          <button type="button" id="cancel-btn"
                  style="flex: 1; background: #f5f5f5; color: #666; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
            取消
          </button>
          <button type="submit" id="submit-btn"
                  style="flex: 1; background: #ff6b35; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
            提交预购
          </button>
        </div>
        <div id="preorder-message" style="margin-top: 16px; padding: 12px; border-radius: 6px; display: none;"></div>
      </form>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // 绑定事件
    const form = content.querySelector('#preorder-form');
    const cancelBtn = content.querySelector('#cancel-btn');
    const submitBtn = content.querySelector('#submit-btn');
    const messageDiv = content.querySelector('#preorder-message');

    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = content.querySelector('#preorder-email').value;
      const name = content.querySelector('#preorder-name').value;

      // 禁用提交按钮
      submitBtn.disabled = true;
      submitBtn.textContent = '提交中...';

      // 提交预购
      const result = await submitPreorder(productId, variantId, email, name);

      if (result.success) {
        messageDiv.style.display = 'block';
        messageDiv.style.background = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.textContent = '✅ 预购成功！我们会在商品到货时通知您。';
        
        setTimeout(() => {
          modal.remove();
        }, 3000);
      } else {
        messageDiv.style.display = 'block';
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.textContent = '❌ 提交失败：' + (result.error || '请稍后重试');
        
        submitBtn.disabled = false;
        submitBtn.textContent = '提交预购';
      }
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  // 显示成功模态框
  function showSuccessModal() {
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
        我们会在商品到货时通过邮件通知您
      </p>
      <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
              style="background: #ff6b35; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
        关闭
      </button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // 5秒后自动关闭
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 5000);
  }

  // 主要的初始化函数
  function initPreorderWidget() {
    log('🚀 Initializing PreOrder Widget via App Embed...');
    
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
        log('⚠️ Could not find suitable insertion point');
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

    log('🎉 PreOrder Widget initialized successfully via App Embed!');
  }

  // 多重初始化策略
  function multipleInitAttempts() {
    let attempts = 0;
    const maxAttempts = 3;
    
    function tryInit() {
      attempts++;
      log(`🔄 Initialization attempt ${attempts}/${maxAttempts}`);
      
      const hasContent = document.querySelectorAll('button, input, .product').length > 0;
      
      if (hasContent) {
        initPreorderWidget();
      } else if (attempts < maxAttempts) {
        log(`⏳ Page not ready, retrying in 2s...`);
        setTimeout(tryInit, 2000);
      } else {
        log('❌ Max attempts reached');
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

  // 监听自定义事件
  window.addEventListener('preorder:loaded', function(event) {
    log('📡 PreOrder loaded event received:', event.detail);
  });

  // 全局暴露
  window.PreOrderAppEmbed = {
    init: multipleInitAttempts,
    detect: detectSoldOutStatus,
    config: CONFIG
  };

  log('🎯 PreOrder App Embed Widget loaded and ready!');

})();
