// PreOrder Pro - Globo 模式
// ✅ 直接加购物车 + Shopify Checkout

(function () {
    'use strict';

    console.log('🚀 PreOrder Widget (Globo Mode) Loading...');

    // ✅ 配置
    const defaultConfig = {
        shop: window.Shopify?.shop || window.location.hostname,
        enabled: true,
        debug: false,

        // 可配置文本
        i18n: {
            buttonText: 'Pre-Order Now',
            badgeText: 'Pre-Order'
        }
    };

    const CONFIG = {
        ...defaultConfig,
        ...window.PREORDER_CONFIG,
        i18n: {
            ...defaultConfig.i18n,
            ...(window.PREORDER_CONFIG?.i18n || {})
        }
    };

    const log = (...args) => {
        if (CONFIG.debug) console.log('[PreOrder]', ...args);
    };

    if (!CONFIG.enabled) return;

    // 售罄按钮选择器
    const SOLD_OUT_SELECTORS = [
        'button[disabled]',
        'input[disabled]',
        '.btn[disabled]',
        '.product-form__cart-submit[disabled]'
    ];

    // 图片容器选择器
    const IMAGE_SELECTORS = [
        '.product__media',
        '.product__photos',
        '.product-images',
        '.product__image'
    ];

    // 检测售罄
    function detectSoldOutStatus() {
        log('🔍 Detecting sold out status...');

        const buttons = document.querySelectorAll(SOLD_OUT_SELECTORS.join(', '));
        for (let button of buttons) {
            const text = (button.textContent || button.value || '').toLowerCase();
            if (text.includes('sold out') || text.includes('unavailable') ||
                text.includes('out of stock') || text.includes('缺货') || text.includes('售罄')) {
                log('✅ Found sold out button:', button);
                return { isSoldOut: true, button: button };
            }
        }

        if (window.meta?.product?.variants) {
            const variants = window.meta.product.variants;
            const currentVariantId = new URLSearchParams(window.location.search).get('variant');

            let targetVariant = currentVariantId
                ? variants.find(v => v.id.toString() === currentVariantId)
                : variants[0];

            if (targetVariant) {
                const isOutOfStock = (
                    targetVariant.available === false ||
                    (typeof targetVariant.inventory_quantity === 'number' && targetVariant.inventory_quantity <= 0)
                );

                if (isOutOfStock) {
                    log('✅ Variant sold out via Shopify data');
                    const anyButton = document.querySelector('button[name="add"], input[name="add"]');
                    return { isSoldOut: true, button: anyButton };
                }
            }
        }

        log('❌ Product is available');
        return { isSoldOut: false, button: null };
    }

    // 获取变体 ID
    function getVariantId() {
        let variantId = new URLSearchParams(window.location.search).get('variant');

        if (!variantId) {
            const variantSelect = document.querySelector('select[name="id"]');
            if (variantSelect) variantId = variantSelect.value;
        }

        if (!variantId) {
            const variantInput = document.querySelector('input[name="id"]');
            if (variantInput) variantId = variantInput.value;
        }

        if (!variantId && window.meta?.product?.variants?.[0]) {
            variantId = window.meta.product.variants[0].id;
        }

        return variantId;
    }

    // ✅ 加入购物车（Globo 方式）
    async function addToCartAndCheckout(variantId) {
        try {
            log('🛒 Adding to cart:', variantId);

            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    items: [{
                        id: parseInt(variantId),
                        quantity: 1,
                        properties: {
                            '_preorder': 'true',
                            '_preorder_item': 'This is a pre-order item',
                            '_estimated_shipping': '2-4 weeks'
                        }
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            const data = await response.json();
            log('✅ Added to cart:', data);

            // 跳转到 Checkout
            window.location.href = '/checkout';

        } catch (error) {
            console.error('❌ Add to cart error:', error);
            alert('Failed to add pre-order item. Please try again.');
        }
    }

    // 创建预购按钮
    function createPreorderButton() {
        const button = document.createElement('button');
        button.className = 'preorder-btn';
        button.innerHTML = `
      <span style="margin-right: 8px;">🛒</span>
      <span>${CONFIG.i18n.buttonText}</span>
    `;

        button.addEventListener('click', async (e) => {
            e.preventDefault();

            const variantId = getVariantId();
            if (!variantId) {
                alert('Unable to detect product variant');
                return;
            }

            await addToCartAndCheckout(variantId);
        });

        return button;
    }

    // 创建徽章
    function createPreorderBadge() {
        const badge = document.createElement('div');
        badge.className = 'preorder-badge';
        badge.textContent = CONFIG.i18n.badgeText;
        return badge;
    }

    // 初始化
    function initPreorderWidget() {
        log('🚀 Initializing PreOrder Widget (Globo Mode)...');

        const status = detectSoldOutStatus();

        if (!status.isSoldOut) {
            log('❌ Product is available, no preorder needed');
            return;
        }

        log('✅ Product sold out, showing preorder button');

        const preorderButton = createPreorderButton();

        if (status.button) {
            status.button.style.display = 'none';
            status.button.parentNode.insertBefore(preorderButton, status.button.nextSibling);
            log('✅ Preorder button inserted');
        } else {
            const targets = ['.product-form', '.product__form', '.add-to-cart-form'];
            for (const selector of targets) {
                const target = document.querySelector(selector);
                if (target) {
                    target.appendChild(preorderButton);
                    log('✅ Preorder button added to', selector);
                    break;
                }
            }
        }

        // 添加徽章
        for (const selector of IMAGE_SELECTORS) {
            const imageContainer = document.querySelector(selector);
            if (imageContainer) {
                imageContainer.style.position = 'relative';
                const badge = createPreorderBadge();
                imageContainer.appendChild(badge);
                log('✅ Badge added');
                break;
            }
        }

        log('🎉 PreOrder Widget initialized (Globo Mode)');
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreorderWidget);
    } else {
        initPreorderWidget();
    }

    // 全局暴露
    window.PreOrderWidget = {
        init: initPreorderWidget,
        config: CONFIG
    };

    // 样式
    const style = document.createElement('style');
    style.textContent = `
    .preorder-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
      padding: 16px 32px !important;
      border-radius: 8px !important;
      font-size: 16px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.3s ease !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
      width: 100% !important;
    }
    .preorder-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6) !important;
    }
    .preorder-btn:active {
      transform: translateY(0) !important;
    }
    .preorder-badge {
      position: absolute !important;
      top: 10px !important;
      right: 10px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      padding: 8px 16px !important;
      border-radius: 20px !important;
      font-size: 14px !important;
      font-weight: bold !important;
      z-index: 10 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
    }
  `;
    document.head.appendChild(style);

    log('🎯 PreOrder Widget loaded (Globo Mode)');

})();
