// PreOrder Pro - Globo Mode (正常 Checkout + 订单标记)
// 这是 Globo Pre-Order 的实现方式：不创建 Draft Order，直接使用 Shopify Checkout
(function () {
    'use strict';

    console.log('🚀 PreOrder Globo Mode Widget Loading...');

    // 获取配置
    const CONFIG = window.PREORDER_CONFIG || {
        shop: window.Shopify?.shop || window.location.hostname,
        apiUrl: 'https://shopmall.dpdns.org/api',
        enabled: true,
        debug: true, // Globo 模式默认开启调试
        estimatedShippingDate: '2025-12-15', // 默认预计发货日期
        showEstimatedDate: true // 是否显示预计发货日期
    };

    const log = (...args) => {
        if (CONFIG.debug) {
            console.log('[PreOrder Globo Mode]', ...args);
        }
    };

    log('Configuration:', CONFIG);

    // 如果未启用，直接返回
    if (!CONFIG.enabled) {
        log('PreOrder is disabled, exiting');
        return;
    }

    // 通用的售罄按钮选择器
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
                const isOutOfStock = (
                    targetVariant.available === false ||
                    (typeof targetVariant.inventory_quantity === 'number' && targetVariant.inventory_quantity <= 0) ||
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
        let productId = null;
        let variantId = null;

        // 获取 productId
        if (window.meta?.product?.id) {
            productId = window.meta.product.id;
        } else {
            const productEl = document.querySelector('[data-product-id]');
            if (productEl) {
                productId = productEl.dataset.productId;
            }
        }

        // 获取 variantId
        variantId = new URLSearchParams(window.location.search).get('variant');
        if (!variantId) {
            const variantSelect = document.querySelector('select[name="id"]');
            if (variantSelect) {
                variantId = variantSelect.value;
            }
        }
        if (!variantId) {
            const variantInput = document.querySelector('input[name="id"]');
            if (variantInput) {
                variantId = variantInput.value;
            }
        }
        if (!variantId && window.meta?.product?.variants?.[0]?.id) {
            variantId = window.meta.product.variants[0].id;
        }

        log('📦 Product info:', { productId, variantId });
        return { productId, variantId };
    }

    // 🎯 关键：使用 Shopify Cart API 加入购物车（带预购标记）
    async function addToCartWithPreorderTag(variantId) {
        try {
            log('🛒 Adding to cart with preorder tag...');

            if (!variantId) {
                throw new Error('缺少 variant ID');
            }

            // 使用 Shopify Cart API
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    items: [{
                        id: variantId,
                        quantity: 1,
                        properties: {
                            '_preorder': 'true',
                            '_是預購商品': '是',
                            '_estimated_shipping': CONFIG.estimatedShippingDate || '即将补货',
                            '_預計發貨日期': CONFIG.estimatedShippingDate || '即将补货'
                        }
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                log('❌ Cart API error:', errorText);
                throw new Error('加入购物车失败');
            }

            const result = await response.json();
            log('✅ Added to cart successfully:', result);

            // 显示成功消息
            showSuccessMessage();

            // 延迟后跳转到 Checkout
            setTimeout(() => {
                log('🔀 Redirecting to checkout...');
                window.location.href = '/checkout';
            }, 1000);

            return true;

        } catch (error) {
            log('❌ Add to cart error:', error);
            showErrorMessage(error.message);
            return false;
        }
    }

    // 创建预购按钮
    function createPreorderButton() {
        const button = document.createElement('button');
        button.className = 'preorder-btn preorder-globo-mode animate-in';
        button.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      margin-top: 12px;
    `;

        button.innerHTML = `
      <span style="font-size: 20px;">🛒</span>
      <span>立即预订 Pre-Order Now</span>
    `;

        // 悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });

        // 点击事件 - 直接加入购物车
        button.addEventListener('click', async (e) => {
            e.preventDefault();

            // 添加点击动画
            button.style.transform = 'scale(0.98)';
            button.disabled = true;
            button.innerHTML = `
        <span style="font-size: 20px;">⏳</span>
        <span>加入购物车中...</span>
      `;

            // 获取产品信息
            const { variantId } = getProductInfo();

            // 加入购物车
            const success = await addToCartWithPreorderTag(variantId);

            if (!success) {
                // 恢复按钮状态
                button.disabled = false;
                button.style.transform = 'translateY(0)';
                button.innerHTML = `
          <span style="font-size: 20px;">🛒</span>
          <span>立即预订 Pre-Order Now</span>
        `;
            }
        });

        return button;
    }

    // 创建预购徽章
    function createPreorderBadge() {
        const badge = document.createElement('div');
        badge.className = 'preorder-badge preorder-globo-badge';
        badge.style.cssText = `
      position: absolute;
      top: 16px;
      left: 16px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
      animation: pulse 2s ease-in-out infinite;
    `;
        badge.innerHTML = '🔥 預售 Pre-Order';
        return badge;
    }

    // 创建预计发货日期提示
    function createEstimatedShippingNote() {
        if (!CONFIG.showEstimatedDate) return null;

        const note = document.createElement('div');
        note.className = 'preorder-shipping-note';
        note.style.cssText = `
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #495057;
      line-height: 1.6;
    `;
        note.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-size: 16px;">📦</span>
        <strong>預購說明 Pre-Order Information</strong>
      </div>
      <div style="margin-left: 24px;">
        預計發貨日期：<strong>${CONFIG.estimatedShippingDate || '即将补货'}</strong>
        <br>
        此商品目前缺貨，立即預訂可確保優先發貨。
      </div>
    `;
        return note;
    }

    // 显示成功消息
    function showSuccessMessage() {
        const toast = document.createElement('div');
        toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(17, 153, 142, 0.5);
      z-index: 10000;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
    `;
        toast.innerHTML = `
      <span style="font-size: 24px;">✅</span>
      <span>已加入購物車！即將前往結帳...</span>
    `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    // 显示错误消息
    function showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(245, 87, 108, 0.5);
      z-index: 10000;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
    `;
        toast.innerHTML = `
      <span style="font-size: 24px;">❌</span>
      <span>${message || '操作失敗，請重試'}</span>
    `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 主要的初始化函数
    function initPreorderWidget() {
        log('🚀 Initializing PreOrder Widget (Globo Mode)...');

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

        // 添加预计发货日期说明
        const shippingNote = createEstimatedShippingNote();
        if (shippingNote) {
            const priceElement = document.querySelector('.product__price, .price, .product-info');
            if (priceElement) {
                priceElement.parentNode.insertBefore(shippingNote, priceElement.nextSibling);
                log('✅ Shipping note added');
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

        // 添加动画样式
        addAnimationStyles();

        log('🎉 PreOrder Widget (Globo Mode) initialized successfully!');
    }

    // 添加CSS动画
    function addAnimationStyles() {
        if (document.getElementById('preorder-globo-animations')) return;

        const style = document.createElement('style');
        style.id = 'preorder-globo-animations';
        style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .animate-in {
        animation: slideInRight 0.5s ease-out;
      }
    `;
        document.head.appendChild(style);
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

    // 全局暴露
    window.PreOrderGloboMode = {
        init: multipleInitAttempts,
        detect: detectSoldOutStatus,
        addToCart: addToCartWithPreorderTag,
        config: CONFIG
    };

    log('🎯 PreOrder Globo Mode Widget loaded and ready!');

})();
