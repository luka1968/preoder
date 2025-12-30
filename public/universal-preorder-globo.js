// PreOrder Pro - Globo 模式（Shopify 原生 Checkout）
// 这个文件实现了与 Globo Pre-Order 相同的流程：正常结账 + 订单标记

(function () {
    'use strict';

    console.log('🚀 PreOrder Pro - Globo Mode Loading...');

    // 获取配置
    const CONFIG = window.PREORDER_CONFIG || {
        shop: window.Shopify?.shop || window.location.hostname,
        enabled: true,
        debug: false,
        estimatedShippingDate: '2025-12-01', // 预计发货日期
        preorderMessage: '此商品为预购商品，预计 {date} 发货'
    };

    // 日志函数
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[PreOrder Globo]', ...args);
        }
    }

    log('Configuration:', CONFIG);

    // 如果未启用，直接返回
    if (!CONFIG.enabled) {
        log('PreOrder is disabled, exiting');
        return;
    }

    // 通用的售罄按钮选择器
    const SOLD_OUT_SELECTORS = [
        'button[name="add"]:disabled',
        'button.product-form__submit:disabled',
        '.btn--sold-out',
        '.sold-out-button',
        'button:disabled[type="submit"]',
        'input[type="submit"]:disabled',
        'button.btn:disabled',
        '.product-form__submit:disabled',
        '[data-soldout="true"]',
        'button[disabled][aria-label*="Sold"]',
    ];

    // 购物车按钮选择器（非禁用状态）
    const ADD_TO_CART_SELECTORS = [
        'button[name="add"]',
        'button.product-form__submit',
        '.product-form__cart-submit',
        'button[type="submit"].btn',
        'input[type="submit"]',
        '.add-to-cart-button',
        '[data-add-to-cart]',
    ];

    // ==================== 核心功能 ====================

    /**
     * 检测售罄状态
     */
    function detectSoldOutStatus() {
        // 方法 1: 查找明确的售罄按钮
        for (const selector of SOLD_OUT_SELECTORS) {
            const button = document.querySelector(selector);
            if (button) {
                const buttonText = button.textContent.toLowerCase();
                if (
                    buttonText.includes('sold') ||
                    buttonText.includes('out of stock') ||
                    buttonText.includes('unavailable') ||
                    buttonText.includes('售罄') ||
                    buttonText.includes('缺货')
                ) {
                    log('✅ 检测到售罄按钮 (方法1):', selector, button);
                    return { isSoldOut: true, button };
                }
            }
        }

        // 方法 2: 检查 Shopify 产品对象
        if (window.ShopifyAnalytics?.meta?.product) {
            const product = window.ShopifyAnalytics.meta.product;
            if (product.variants) {
                const allSoldOut = product.variants.every((v) => !v.available);
                if (allSoldOut) {
                    log('✅ 所有变体都售罄 (方法2):', product);
                    return { isSoldOut: true, button: null };
                }
            }
        }

        // 方法 3: 检查页面文本
        const bodyText = document.body.textContent.toLowerCase();
        if (
            bodyText.includes('sold out') ||
            bodyText.includes('out of stock') ||
            bodyText.includes('售罄')
        ) {
            log('⚠️ 页面包含售罄文本 (方法3)');
            // 尝试查找任何禁用的提交按钮
            const disabledButton = document.querySelector(
                'button[type="submit"]:disabled, input[type="submit"]:disabled'
            );
            if (disabledButton) {
                return { isSoldOut: true, button: disabledButton };
            }
        }

        log('ℹ️ 未检测到售罄状态');
        return { isSoldOut: false, button: null };
    }

    /**
     * 获取产品和变体信息
     */
    function getProductInfo() {
        let productId = null;
        let variantId = null;

        // 方法 1: 从 ShopifyAnalytics 获取
        if (window.ShopifyAnalytics?.meta?.product) {
            const product = window.ShopifyAnalytics.meta.product;
            productId = product.id;
            if (product.variants && product.variants.length > 0) {
                variantId = product.variants[0].id; // 默认第一个变体
            }
            log('✅ 从 ShopifyAnalytics 获取:', { productId, variantId });
        }

        // 方法 2: 从表单中获取
        if (!variantId) {
            const variantInput = document.querySelector('input[name="id"]');
            if (variantInput) {
                variantId = variantInput.value;
                log('✅ 从表单 input[name="id"] 获取 variantId:', variantId);
            }
        }

        // 方法 3: 从 select 选择器获取
        if (!variantId) {
            const variantSelect = document.querySelector('select[name="id"]');
            if (variantSelect) {
                variantId = variantSelect.value;
                log('✅ 从 select[name="id"] 获取 variantId:', variantId);
            }
        }

        // 方法 4: 从 data 属性获取
        if (!productId || !variantId) {
            const productElement = document.querySelector('[data-product-id]');
            if (productElement) {
                productId = productElement.getAttribute('data-product-id');
                log('✅ 从 data-product-id 获取 productId:', productId);
            }

            const variantElement = document.querySelector('[data-variant-id]');
            if (variantElement) {
                variantId = variantElement.getAttribute('data-variant-id');
                log('✅ 从 data-variant-id 获取 variantId:', variantId);
            }
        }

        // 方法 5: 从页面 JSON-LD 获取
        if (!productId) {
            const jsonLd = document.querySelector('script[type="application/ld+json"]');
            if (jsonLd) {
                try {
                    const data = JSON.parse(jsonLd.textContent);
                    if (data['@type'] === 'Product' && data.productID) {
                        productId = data.productID;
                        log('✅ 从 JSON-LD 获取 productId:', productId);
                    }
                } catch (e) {
                    log('⚠️ 解析 JSON-LD 失败:', e);
                }
            }
        }

        log('📦 最终产品信息:', { productId, variantId });

        return { productId, variantId };
    }

    /**
     * 检查商品是否启用了预购 + 获取Campaign信息
     * 🆕 支持 Campaign 模式（按商品配置不同支付模式）
     */
    async function checkPreorderAndCampaign(variantId) {
        try {
            log('🔍 检查预购状态和Campaign信息...', variantId);

            // 调用后端 API 检查预购状态和campaign
            const apiUrl = CONFIG.apiUrl || '/api';
            const url = `${apiUrl}/preorder/variant/${variantId}?shop=${CONFIG.shop}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                log('⚠️ 无法获取变体信息，假设未启用预购');
                return { enabled: false, campaign: null };
            }

            const data = await response.json();
            const isEnabled = data.preorder_enabled === true || data.preorder_enabled === 'true';

            log(isEnabled ? '✅ 预购已启用' : 'ℹ️ 预购未启用', data);
            if (data.campaign) {
                log('🎯 检测到Campaign:', data.campaign);
            }

            return {
                enabled: isEnabled,
                campaign: data.campaign, // { payment_mode: 'immediate' | 'pay_later', ... }
                variantData: data
            };
        } catch (error) {
            log('❌ 检查预购失败:', error);
            return { enabled: false, campaign: null };
        }
    }

    /**
     * 创建预购按钮（支持不同支付模式）
     * 🆕 根据 campaign.payment_mode 显示不同文案
     */
    function createPreorderButton(originalButton, campaign) {
        const button = document.createElement('button');
        button.className = originalButton.className;
        button.type = 'button';

        // 根据payment_mode显示不同文案
        if (campaign && campaign.payment_mode === 'pay_later') {
            button.textContent = 'Pre-Order (Pay Later)';
            button.dataset.paymentMode = 'pay_later';
            button.dataset.campaignId = campaign.id;
        } else {
            button.textContent = 'Pre-Order Now';
            button.dataset.paymentMode = 'immediate';
            if (campaign) {
                button.dataset.campaignId = campaign.id;
            }
        }

        button.style.cssText = `
      background: #2563eb !important;
      color: white !important;
      border: none !important;
      cursor: pointer !important;
      opacity: 1 !important;
    `;

        button.addEventListener('click', handlePreorderClick);

        log('✅ 创建预购按钮 -', button.textContent);
        return button;
    }

    /**
     * 处理预购按钮点击 - 支持双模式
     * 🆕 根据 payment_mode 决定流程
     */
    async function handlePreorderClick(e) {
        e.preventDefault();
        e.stopPropagation();

        log('🛒 预购按钮被点击');

        const button = e.target;
        const paymentMode = button.dataset.paymentMode || 'immediate';
        const campaignId = button.dataset.campaignId;
        const { productId, variantId } = getProductInfo();

        if (!variantId) {
            alert('无法获取商品信息，请刷新页面后重试');
            return;
        }

        // 显示加载状态
        const originalText = button.textContent;
        button.textContent = paymentMode === 'pay_later' ? 'Creating order...' : 'Adding to cart...';
        button.disabled = true;

        try {
            if (paymentMode === 'pay_later') {
                // 🆕 Pay Later 模式：创建 Draft Order
                await createDraftOrderForPreorder(variantId, campaignId);
            } else {
                // 原有模式：加入购物车 + 结账
                await addToCartWithPreorderTag(variantId, campaignId);
                window.location.href = '/checkout';
            }
        } catch (error) {
            console.error('❌ 预购失败:', error);
            alert('预购失败，请稍后重试');
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    /**
     * 🆕 创建 Draft Order (Pay Later 模式)
     */
    async function createDraftOrderForPreorder(variantId, campaignId) {
        log('📝 创建 Draft Order (Pay Later)...');

        // 获取或让用户输入邮箱
        let email = prompt('请输入您的邮箱地址（用于接收支付链接）:');
        if (!email) {
            throw new Error('需要邮箱地址');
        }

        const apiUrl = CONFIG.apiUrl || '/api';
        const response = await fetch(`${apiUrl}/draft-order/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                shop: CONFIG.shop,
                variant_id: variantId,
                customer_email: email,
                campaign_id: campaignId,
                quantity: 1
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create draft order');
        }

        const result = await response.json();
        log('✅ Draft Order 创建成功:', result);

        // 显示成功消息
        alert(`预购订单创建成功！\n\n支付链接已发送到您的邮箱：${email}\n请在 ${result.preorder.auto_cancel_days} 天内完成支付。`);

        // 不跳转，停留在当前页面
        return result;
    }

    /**
     * 使用 Shopify Cart API 加入购物车（即时支付模式）
     */
    async function addToCartWithPreorderTag(variantId, campaignId) {
        log('🛒 调用 Shopify Cart API (Immediate Pay)...');

        const numericVariantId = parseInt(variantId.toString().replace(/\D/g, ''), 10);
        if (isNaN(numericVariantId)) {
            throw new Error(`Invalid variant ID: ${variantId}`);
        }

        const properties = {
            _preorder: 'true',
            _estimated_shipping: CONFIG.estimatedShippingDate,
            _preorder_message: CONFIG.preorderMessage.replace('{date}', CONFIG.estimatedShippingDate),
        };

        if (campaignId) {
            properties._campaign_id = campaignId.toString();
        }

        const cartData = {
            items: [{
                id: numericVariantId,
                quantity: 1,
                properties
            }]
        };

        log('📤 Cart API 请求:', cartData);

        const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cart API failed: ${errorText}`);
        }

        const result = await response.json();
        log('✅ 商品已加入购物车，准备跳转 Checkout');
        return result;
    }

    /**
     * 创建预购徽章（显示在产品图片上）
     */
    function createPreorderBadge() {
        const badge = document.createElement('div');
        badge.className = 'preorder-badge';
        badge.textContent = 'Pre-Order';
        badge.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: #2563eb;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      z-index: 10;
      text-transform: uppercase;
    `;

        log('✅ 创建预购徽章');
        return badge;
    }

    /**
     * 主要的初始化函数
     */
    async function initPreorderWidget() {
        log('🔍 初始化预购 Widget...');

        // 0. 获取产品信息
        const { productId, variantId } = getProductInfo();

        if (!variantId) {
            log('⚠️ 无法获取 variantId，退出初始化');
            return false;
        }

        // 1. 检查预购状态和Campaign信息
        const { enabled, campaign, variantData } = await checkPreorderAndCampaign(variantId);

        if (!enabled) {
            log('ℹ️ 预购未启用，无需显示预购按钮');
            return false;
        }

        log('✅ 预购已启用，准备显示预购按钮');
        if (campaign) {
            log(`🎯 使用 Campaign: ${campaign.name}, 支付模式: ${campaign.payment_mode}`);
        }

        // 2. 检测售罄状态
        const { isSoldOut, button: soldOutButton } = detectSoldOutStatus();

        if (!isSoldOut) {
            log('ℹ️ 商品未售罄，但预购已启用，仍然显示预购按钮');
            // 注意：Globo 模式允许即使有库存也显示预购按钮
        }

        log('✅ 准备替换为预购按钮');

        // 3. 替换售罄按钮为预购按钮（传递campaign信息）
        if (soldOutButton) {
            const preorderButton = createPreorderButton(soldOutButton, campaign);
            soldOutButton.parentNode.replaceChild(preorderButton, soldOutButton);
            log('✅ 已替换售罄按钮为预购按钮');
        } else {
            // 如果找不到售罄按钮，尝试查找任何提交按钮并替换
            for (const selector of ADD_TO_CART_SELECTORS) {
                const button = document.querySelector(selector);
                if (button) {
                    const preorderButton = createPreorderButton(button, campaign);
                    button.parentNode.replaceChild(preorderButton, button);
                    log('✅ 已替换添加到购物车按钮为预购按钮');
                    break;
                }
            }
        }

        // 4. 添加预购徽章到产品图片
        const imageSelectors = [
            '.product__media-wrapper',
            '.product__image',
            '.featured-image',
            '.product-gallery',
            '.product-single__photo',
        ];

        for (const selector of imageSelectors) {
            const imageWrapper = document.querySelector(selector);
            if (imageWrapper && imageWrapper.style.position !== 'relative') {
                imageWrapper.style.position = 'relative';
                const badge = createPreorderBadge();
                imageWrapper.appendChild(badge);
                log('✅ 已添加预购徽章到产品图片');
                break;
            }
        }

        log('🎉 预购 Widget 初始化完成');
        return true;
    }

    /**
     * 多重初始化策略（确保在不同主题中都能正常工作）
     */
    function multipleInitAttempts() {
        let attempts = 0;
        const maxAttempts = 5;

        function tryInit() {
            attempts++;
            log(`尝试初始化 (${attempts}/${maxAttempts})...`);

            const success = initPreorderWidget();

            if (!success && attempts < maxAttempts) {
                setTimeout(tryInit, 1000);
            } else if (success) {
                log('✅ 初始化成功!');
            } else {
                log('⚠️ 达到最大尝试次数，初始化失败');
            }
        }

        tryInit();
    }

    // 启动 widget
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', multipleInitAttempts);
    } else {
        multipleInitAttempts();
    }

    // 监听自定义事件（例如主题可能会触发产品更新事件）
    document.addEventListener('product:updated', function () {
        log('🔄 产品已更新，重新初始化');
        initPreorderWidget();
    });

    // 全局暴露
    window.PreOrderGloboMode = {
        init: multipleInitAttempts,
        detect: detectSoldOutStatus,
        config: CONFIG,
    };

    log('🎯 PreOrder Globo Mode Widget loaded and ready!');
})();
