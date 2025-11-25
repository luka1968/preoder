// PreOrder Pro - Universal Widget for App Embed Block
(function () {
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

  // 通用的售罄按钮选择�?- 覆盖所有可能的主题
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

  // 产品图片容器选择�?  const IMAGE_SELECTORS = [
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

  // 检测售罄状�?  function detectSoldOutStatus() {
    log('🔍 Detecting sold out status...');

    // 方法1: 检查disabled按钮的文�?    const buttons = document.querySelectorAll(SOLD_OUT_SELECTORS.join(', '));
    for (let button of buttons) {
      const text = (button.textContent || button.value || '').toLowerCase();
      if (text.includes('sold out') ||
        text.includes('unavailable') ||
        text.includes('out of stock') ||
        text.includes('缺货') ||
        text.includes('售罄')) {
        log('�?Found sold out button:', button);
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
          // 检查available字段（最可靠�?          targetVariant.available === false ||
          // 检查库存数量为0或负�?          (typeof targetVariant.inventory_quantity === 'number' && targetVariant.inventory_quantity <= 0) ||
          // 检查库存管理且库存�?
          (targetVariant.inventory_management && targetVariant.inventory_quantity <= 0)
        );

        if (isOutOfStock) {
          log('�?Variant sold out via Shopify data:', targetVariant);
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

    log('�?Product appears to be available');
    return { isSoldOut: false, button: null };
  }

  // 获取产品信息
  function getProductInfo() {
    const productId = window.meta?.product?.id ||
      document.querySelector('[data-product-id]')?.dataset.productId ||
      new URLSearchParams(window.location.search).get('product');

    const variantId = new URLSearchParams(window.location.search).get('variant') ||
      window.meta?.product?.variants?.[0]?.id;

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

      // 调用预购API或显示预购表�?      try {
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

    // 这里可以调用你的预购API
    // const response = await fetch(`${CONFIG.apiUrl}/preorder`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ productId, variantId, shop: CONFIG.shop })
    // });

    // 暂时显示成功消息
    showPreorderModal();
  }

  // 创建预购徽章
  function createPreorderBadge() {
    const badge = document.createElement('div');
    badge.className = 'preorder-badge';
    badge.innerHTML = '预售 Pre-Order';
    return badge;
  }

  // 显示预购模态框
  function showPreorderModal() {
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
      <h2 style="color: #333; margin-bottom: 16px; font-size: 24px;">预购成功�?/h2>
      <p style="color: #666; margin-bottom: 24px; line-height: 1.5;">
        恭喜！App Embed Block 预购功能完美运行�?br>
        <strong>�?无需手动修改主题代码</strong><br>
        <strong>�?自动适配所有主�?/strong><br>
        <strong>�?用户只需一键启�?/strong>
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

    // 检测售罄状�?    const status = detectSoldOutStatus();

    if (!status.isSoldOut) {
      log('�?Product is available, no preorder needed');
      return;
    }

    log('�?Product is sold out, showing preorder button');

    // 创建并插入预购按�?    const preorderButton = createPreorderButton();

    if (status.button) {
      // 隐藏原按钮并插入预购按钮
      status.button.style.display = 'none';
      status.button.parentNode.insertBefore(preorderButton, status.button.nextSibling);
      log('�?Preorder button inserted after original button');
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
          log('�?Preorder button inserted into:', selector);
          break;
        }
      }

      if (!inserted) {
        log('⚠️ Could not find suitable insertion point');
      }
    }

    // 添加预购徽章到产品图�?    for (const selector of IMAGE_SELECTORS) {
      const imageContainer = document.querySelector(selector);
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        const badge = createPreorderBadge();
        imageContainer.appendChild(badge);
        log('�?Preorder badge added to:', selector);
        break;
      }
    }

    log('🎉 PreOrder Widget initialized successfully via App Embed!');
  }

  // 多重初始化策�?  function multipleInitAttempts() {
    let attempts = 0;
    const maxAttempts = 3;

    function tryInit() {
      attempts++;
      log(`🔄 Initialization attempt ${attempts}/${maxAttempts}`);

      const hasContent = document.querySelectorAll('button, input, .product').length > 0;

      if (hasContent) {
        initPreorderWidget();
      } else if (attempts < maxAttempts) {
        log(`�?Page not ready, retrying in 2s...`);
        setTimeout(tryInit, 2000);
      } else {
        log('�?Max attempts reached');
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

  // 监听自定义事�?  window.addEventListener('preorder:loaded', function (event) {
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
