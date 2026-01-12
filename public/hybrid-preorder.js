// PreOrder Pro - 混合模式前端脚本
// 智能检测 App Embed Block，如果没有则启用 Script Tag 模式

(function () {
  'use strict';

  // 配置
  const CONFIG = {
    debug: true,
    version: '1.0.0',
    mode: 'hybrid',
    shop: window.Shopify?.shop || window.location.hostname,
    apiUrl: 'https://preorder.orbrother.com/api'
  };

  const log = (...args) => {
    if (CONFIG.debug) {
      console.log('[PreOrder Hybrid]', ...args);
    }
  };

  log('🚀 PreOrder Pro 混合模式启动', CONFIG);

  // 防止重复加载
  if (window.PreOrderHybridLoaded) {
    log('✅ 混合模式已加载，跳过');
    return;
  }
  window.PreOrderHybridLoaded = true;

  // 检测是否已有 App Embed Block
  function detectAppEmbedBlock() {
    // 检查是否已有 App Embed 注入的元素
    const indicators = [
      'window.PREORDER_CONFIG',
      'window.PreOrderProLoaded',
      'script[src*="universal-preorder"]',
      '.preorder-embed-active'
    ];

    for (const indicator of indicators) {
      if (indicator.startsWith('window.')) {
        if (window[indicator.split('.')[1]]) {
          log('✅ 检测到 App Embed Block:', indicator);
          return true;
        }
      } else {
        if (document.querySelector(indicator)) {
          log('✅ 检测到 App Embed Block:', indicator);
          return true;
        }
      }
    }

    log('❌ 未检测到 App Embed Block');
    return false;
  }

  // 创建预购按钮样式
  function injectStyles() {
    if (document.getElementById('preorder-hybrid-styles')) {
      return;
    }

    const styles = `
      /* PreOrder Pro - 混合模式样式 */
      .preorder-btn-hybrid {
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        position: relative !important;
        overflow: hidden !important;
        animation: preorderSlideIn 0.5s ease-out !important;
      }
      
      .preorder-btn-hybrid:hover {
        background: linear-gradient(135deg, #e55a2b 0%, #d7831a 100%) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
      }
      
      .preorder-btn-hybrid:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3) !important;
      }
      
      .preorder-btn-hybrid::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      
      .preorder-btn-hybrid:hover::before {
        left: 100%;
      }
      
      .preorder-badge-hybrid {
        position: absolute !important;
        top: 12px !important;
        right: 12px !important;
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
        color: white !important;
        padding: 6px 12px !important;
        border-radius: 16px !important;
        font-size: 11px !important;
        font-weight: bold !important;
        z-index: 1000 !important;
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4) !important;
        animation: preorderPulse 2s infinite !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      
      @keyframes preorderSlideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes preorderPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.9; }
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .preorder-btn-hybrid {
          font-size: 14px !important;
          padding: 12px 24px !important;
        }
        
        .preorder-badge-hybrid {
          font-size: 10px !important;
          padding: 4px 8px !important;
        }
      }
      
      /* 暗色主题适配 */
      @media (prefers-color-scheme: dark) {
        .preorder-btn-hybrid {
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.5) !important;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'preorder-hybrid-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    log('✅ 混合模式样式已注入');
  }

  // 检测售罄状态
  function detectSoldOutStatus() {
    log('🔍 检测售罄状态...');

    // 多种检测方法
    const detectionMethods = [
      // 方法1: 检查禁用按钮
      () => {
        const disabledButtons = document.querySelectorAll('button:disabled, input:disabled');
        for (const btn of disabledButtons) {
          const text = (btn.textContent || btn.value || '').toLowerCase();
          if (text.includes('sold out') || text.includes('unavailable') || text.includes('out of stock')) {
            return { found: true, button: btn, method: 'disabled_button' };
          }
        }
        return null;
      },

      // 方法2: 检查特定类名
      () => {
        const soldOutElements = document.querySelectorAll('.sold-out, .unavailable, .out-of-stock');
        if (soldOutElements.length > 0) {
          const nearbyButton = soldOutElements[0].closest('form')?.querySelector('button, input[type="submit"]');
          return { found: true, button: nearbyButton, method: 'class_name' };
        }
        return null;
      },

      // 方法3: 检查页面文本
      () => {
        const bodyText = document.body.textContent.toLowerCase();
        if (bodyText.includes('sold out')) {
          const anyButton = document.querySelector('button, input[type="submit"]');
          return { found: true, button: anyButton, method: 'page_text' };
        }
        return null;
      },

      // 方法4: 检查 Shopify 产品数据
      () => {
        if (window.meta?.product?.variants) {
          const variants = window.meta.product.variants;
          const allSoldOut = variants.every(v => !v.available);
          if (allSoldOut) {
            const productForm = document.querySelector('.product-form, form[action*="/cart/add"]');
            const button = productForm?.querySelector('button, input[type="submit"]');
            return { found: true, button: button, method: 'product_data' };
          }
        }
        return null;
      }
    ];

    for (const method of detectionMethods) {
      const result = method();
      if (result) {
        log('✅ 售罄检测成功:', result.method);
        return result;
      }
    }

    log('❌ 未检测到售罄状态');
    return { found: false, button: null, method: 'none' };
  }

  // 创建预购按钮
  function createPreorderButton() {
    const button = document.createElement('button');
    button.className = 'preorder-btn-hybrid';
    button.innerHTML = `
      <span style="margin-right: 8px;">🛒</span>
      <span>立即预订 Pre-Order Now</span>
    `;

    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      showPreorderModal();
    });

    return button;
  }

  // 显示预购模态框
  function showPreorderModal() {
    // 移除现有模态框
    const existingModal = document.getElementById('preorder-modal-hybrid');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'preorder-modal-hybrid';
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.6) !important;
      z-index: 10000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(5px) !important;
      animation: fadeIn 0.3s ease-out !important;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white !important;
      padding: 40px !important;
      border-radius: 16px !important;
      max-width: 500px !important;
      width: 90% !important;
      text-align: center !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      animation: slideUp 0.3s ease-out !important;
      position: relative !important;
    `;

    content.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 24px; animation: bounce 1s ease-out;">🎉</div>
      <h2 style="color: #333; margin-bottom: 16px; font-size: 28px; margin-top: 0; font-weight: 700;">预购成功！</h2>
      <p style="color: #666; margin-bottom: 32px; line-height: 1.6; font-size: 16px;">
        <strong style="color: #ff6b35;">✅ PreOrder Pro 混合模式工作正常！</strong><br><br>
        🏪 商店: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${CONFIG.shop}</code><br>
        🔧 模式: <span style="color: #ff6b35; font-weight: 600;">混合模式 (最大覆盖率)</span><br>
        🕒 时间: ${new Date().toLocaleString()}
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button onclick="this.closest('#preorder-modal-hybrid').remove()" 
                style="background: #ff6b35; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">
          关闭
        </button>
        <button onclick="window.open('https://preorder.orbrother.com', '_blank')" 
                style="background: #f5f5f5; color: #333; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">
          管理应用
        </button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // 添加动画样式
    const animationStyles = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;

    if (!document.getElementById('preorder-modal-animations')) {
      const animationSheet = document.createElement('style');
      animationSheet.id = 'preorder-modal-animations';
      animationSheet.textContent = animationStyles;
      document.head.appendChild(animationSheet);
    }

    // 5秒后自动关闭
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 8000);

    log('✅ 预购模态框已显示');
  }

  // 主初始化函数
  function initHybridPreorder() {
    log('🚀 初始化混合预购系统...');

    // 检查是否已有 App Embed Block
    const hasAppEmbed = detectAppEmbedBlock();

    if (hasAppEmbed) {
      log('✅ App Embed Block 已激活，混合模式待机');
      // App Embed Block 已处理，我们作为备用
      window.PreOrderHybridMode = 'standby';
      return;
    }

    log('🔄 App Embed Block 未激活，启用 Script Tag 模式');
    window.PreOrderHybridMode = 'active';

    // 注入样式
    injectStyles();

    // 检测售罄状态
    const soldOutStatus = detectSoldOutStatus();

    if (!soldOutStatus.found) {
      log('❌ 产品未售罄，跳过预购按钮创建');
      return;
    }

    log('✅ 产品已售罄，创建预购按钮');

    // 创建预购按钮
    const preorderButton = createPreorderButton();

    // 插入预购按钮
    if (soldOutStatus.button) {
      // 隐藏原按钮
      soldOutStatus.button.style.display = 'none';
      soldOutStatus.button.parentNode.insertBefore(preorderButton, soldOutStatus.button.nextSibling);
      log('✅ 预购按钮已插入到售罄按钮后');
    } else {
      // 寻找合适位置插入
      const insertTargets = [
        '.product-form',
        '.product__form',
        '.add-to-cart-form',
        'form[action*="/cart/add"]',
        '.product-form__buttons',
        '.product__price',
        '.product-single',
        '.product'
      ];

      let inserted = false;
      for (const selector of insertTargets) {
        const target = document.querySelector(selector);
        if (target) {
          target.appendChild(preorderButton);
          inserted = true;
          log('✅ 预购按钮插入到:', selector);
          break;
        }
      }

      if (!inserted) {
        // 最后的备选方案
        const container = document.querySelector('main, .main, #main, .container') || document.body;
        container.appendChild(preorderButton);
        log('⚠️ 预购按钮插入到备选位置');
      }
    }

    log('🎉 混合预购系统初始化完成！');
  }

  // 启动系统
  function startHybridSystem() {
    // 多次尝试初始化，确保页面完全加载
    let attempts = 0;
    const maxAttempts = 5;

    function tryInit() {
      attempts++;
      log(`🔄 初始化尝试 ${attempts}/${maxAttempts}`);

      if (document.readyState === 'complete' || document.querySelector('button, input')) {
        initHybridPreorder();
      } else if (attempts < maxAttempts) {
        setTimeout(tryInit, 2000);
      } else {
        log('❌ 达到最大尝试次数，初始化结束');
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryInit);
    } else {
      tryInit();
    }
  }

  // 全局暴露
  window.PreOrderHybrid = {
    init: initHybridPreorder,
    detect: detectSoldOutStatus,
    config: CONFIG,
    mode: window.PreOrderHybridMode || 'unknown'
  };

  // 启动混合系统
  startHybridSystem();

  log('🎯 PreOrder Pro 混合模式已加载并启动！');

})();
