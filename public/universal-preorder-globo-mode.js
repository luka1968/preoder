// PreOrder Pro - Globo Mode (正常 Checkout + 订单标记)
// 这是 Globo Pre-Order 的实现方式：不创建 Draft Order，直接使用 Shopify Checkout
(function () {
    'use strict';

    console.log('🚀 PreOrder Globo Mode Widget Loading...');

    // 🌐 多语言翻译
    const TRANSLATIONS = {
        'en': {
            buttonText: 'Pre-Order Now',
            buttonAdding: 'Adding to cart...',
            badge: 'Pre-Order',
            shippingNoteTitle: 'Pre-Order Information',
            shippingNoteEstimatedDate: 'Estimated shipping date',
            shippingNoteDescription: 'This item is currently out of stock. Pre-order now to ensure priority shipping.',
            successMessage: 'Added to cart! Redirecting to checkout...',
            errorMessage: 'Operation failed, please try again'
        },
        'zh-CN': {
            buttonText: '立即预订',
            buttonAdding: '加入购物车中...',
            badge: '预售',
            shippingNoteTitle: '预购说明',
            shippingNoteEstimatedDate: '预计发货日期',
            shippingNoteDescription: '此商品目前缺货，立即预订可确保优先发货。',
            successMessage: '已加入购物车！即将前往结账...',
            errorMessage: '操作失败，请重试'
        },
        'zh': { // 简体中文降级
            buttonText: '立即预订',
            buttonAdding: '加入购物车中...',
            badge: '预售',
            shippingNoteTitle: '预购说明',
            shippingNoteEstimatedDate: '预计发货日期',
            shippingNoteDescription: '此商品目前缺货，立即预订可确保优先发货。',
            successMessage: '已加入购物车！即将前往结账...',
            errorMessage: '操作失败，请重试'
        },
        'zh-TW': {
            buttonText: '立即預訂',
            buttonAdding: '加入購物車中...',
            badge: '預售',
            shippingNoteTitle: '預購說明',
            shippingNoteEstimatedDate: '預計發貨日期',
            shippingNoteDescription: '此商品目前缺貨，立即預訂可確保優先發貨。',
            successMessage: '已加入購物車！即將前往結帳...',
            errorMessage: '操作失敗，請重試'
        },
        'es': { // 西班牙语
            buttonText: 'Pre-ordenar ahora',
            buttonAdding: 'Añadiendo al carrito...',
            badge: 'Pre-orden',
            shippingNoteTitle: 'Información de pre-orden',
            shippingNoteEstimatedDate: 'Fecha estimada de envío',
            shippingNoteDescription: 'Este artículo está actualmente agotado. Pre-ordene ahora para asegurar el envío prioritario.',
            successMessage: '¡Añadido al carrito! Redirigiendo al pago...',
            errorMessage: 'Operación fallida, por favor intenta de nuevo'
        },
        'fr': { // 法语
            buttonText: 'Pré-commander maintenant',
            buttonAdding: 'Ajout au panier...',
            badge: 'Pré-commande',
            shippingNoteTitle: 'Information de pré-commande',
            shippingNoteEstimatedDate: 'Date d\'expédition estimée',
            shippingNoteDescription: 'Cet article est actuellement en rupture de stock. Pré-commandez maintenant pour assurer une expédition prioritaire.',
            successMessage: 'Ajouté au panier! Redirection vers la caisse...',
            errorMessage: 'Opération échouée, veuillez réessayer'
        },
        'de': { // 德语
            buttonText: 'Jetzt vorbestellen',
            buttonAdding: 'Wird zum Warenkorb hinzugefügt...',
            badge: 'Vorbestellung',
            shippingNoteTitle: 'Vorbestellungsinformation',
            shippingNoteEstimatedDate: 'Geschätztes Versanddatum',
            shippingNoteDescription: 'Dieser Artikel ist derzeit nicht auf Lager. Bestellen Sie jetzt vor, um vorrangigen Versand zu sichern.',
            successMessage: 'Zum Warenkorb hinzugefügt! Weiterleitung zur Kasse...',
            errorMessage: 'Vorgang fehlgeschlagen, bitte erneut versuchen'
        },
        'ja': { // 日语
            buttonText: '今すぐ予約注文',
            buttonAdding: 'カートに追加中...',
            badge: '予約注文',
            shippingNoteTitle: '予約注文情報',
            shippingNoteEstimatedDate: '出荷予定日',
            shippingNoteDescription: 'この商品は現在在庫切れです。今すぐ予約注文して優先出荷を確保してください。',
            successMessage: 'カートに追加されました！チェックアウトにリダイレクトしています...',
            errorMessage: '操作が失敗しました。もう一度お試しください'
        },
        'ko': { // 韩语
            buttonText: '지금 예약 주문',
            buttonAdding: '장바구니에 추가 중...',
            badge: '예약 주문',
            shippingNoteTitle: '예약 주문 정보',
            shippingNoteEstimatedDate: '예상 배송일',
            shippingNoteDescription: '이 상품은 현재 품절입니다. 지금 예약 주문하여 우선 배송을 확보하세요.',
            successMessage: '장바구니에 추가되었습니다! 결제 페이지로 이동 중...',
            errorMessage: '작업이 실패했습니다. 다시 시도해 주세요'
        },
        'it': { // 意大利语
            buttonText: 'Pre-ordina ora',
            buttonAdding: 'Aggiunta al carrello...',
            badge: 'Pre-ordine',
            shippingNoteTitle: 'Informazioni pre-ordine',
            shippingNoteEstimatedDate: 'Data di spedizione stimata',
            shippingNoteDescription: 'Questo articolo è attualmente esaurito. Pre-ordina ora per garantire la spedizione prioritaria.',
            successMessage: 'Aggiunto al carrello! Reindirizzamento al checkout...',
            errorMessage: 'Operazione fallita, riprova'
        },
        'pt': { // 葡萄牙语
            buttonText: 'Pré-encomendar agora',
            buttonAdding: 'Adicionando ao carrinho...',
            badge: 'Pré-encomenda',
            shippingNoteTitle: 'Informação de pré-encomenda',
            shippingNoteEstimatedDate: 'Data estimada de envio',
            shippingNoteDescription: 'Este item está atualmente esgotado. Pré-encomende agora para garantir o envio prioritário.',
            successMessage: 'Adicionado ao carrinho! Redirecionando para o checkout...',
            errorMessage: 'Operação falhou, tente novamente'
        },
        'ru': { // 俄语
            buttonText: 'Предзаказать сейчас',
            buttonAdding: 'Добавление в корзину...',
            badge: 'Предзаказ',
            shippingNoteTitle: 'Информация о предзаказе',
            shippingNoteEstimatedDate: 'Ожидаемая дата отправки',
            shippingNoteDescription: 'Этот товар в настоящее время нет в наличии. Сделайте предзаказ сейчас, чтобы обеспечить приоритетную доставку.',
            successMessage: 'Добавлено в корзину! Перенаправление на оформление заказа...',
            errorMessage: 'Операция не удалась, попробуйте еще раз'
        }
    };

    // 🔍 检测当前语言
    function detectLocale() {
        // 优先级1: Shopify locale
        if (typeof Shopify !== 'undefined' && Shopify.locale) {
            return Shopify.locale;
        }

        // 优先级2: URL 路径 (例如 /zh-cn/products/...)
        const pathMatch = window.location.pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)\//);
        if (pathMatch) {
            return pathMatch[1];
        }

        // 优先级3: HTML lang 属性
        const htmlLang = document.documentElement.lang;
        if (htmlLang) {
            return htmlLang;
        }

        // 优先级4: 浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            return browserLang;
        }

        // 默认: 英语
        return 'en';
    }

    // 🌍 获取翻译文本
    function getTranslations(locale) {
        // 精确匹配
        if (TRANSLATIONS[locale]) {
            return TRANSLATIONS[locale];
        }

        // 语言代码匹配 (zh-CN → zh)
        const languageCode = locale.split('-')[0].toLowerCase();
        for (const key in TRANSLATIONS) {
            if (key.toLowerCase().startsWith(languageCode)) {
                return TRANSLATIONS[key];
            }
        }

        // 降级到英语
        return TRANSLATIONS['en'];
    }

    // 检测并设置语言
    const currentLocale = detectLocale();
    const t = getTranslations(currentLocale);

    console.log('🌍 Detected locale:', currentLocale);
    console.log('📝 Using translations:', t);

    // 获取配置（合并用户配置和翻译）
    const CONFIG = Object.assign({
        shop: window.Shopify?.shop || window.location.hostname,
        apiUrl: 'https://shopmall.dpdns.org/api',
        enabled: true,
        debug: true,
        estimatedShippingDate: '2025-12-15',
        showEstimatedDate: true,
        locale: currentLocale
    }, window.PREORDER_CONFIG || {}, {
        translations: t // 确保翻译总是最新的
    });

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
      <span>${CONFIG.translations.buttonText}</span>
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
        <span>${CONFIG.translations.buttonAdding}</span>
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
          <span>${CONFIG.translations.buttonText}</span>
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
        badge.innerHTML = `🔥 ${CONFIG.translations.badge}`;
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
        <strong>${CONFIG.translations.shippingNoteTitle}</strong>
      </div>
      <div style="margin-left: 24px;">
        ${CONFIG.translations.shippingNoteEstimatedDate}：<strong>${CONFIG.estimatedShippingDate || '即将补货'}</strong>
        <br>
        ${CONFIG.translations.shippingNoteDescription}
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
      <span>${CONFIG.translations.successMessage}</span>
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
      <span>${message || CONFIG.translations.errorMessage}</span>
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
