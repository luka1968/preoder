// PreOrder Pro - 立即修复版本
// 专业级一次性解决方案，无需重新安装应用

(function() {
  'use strict';
  
  console.log('🚀 PreOrder Pro 立即修复版本启动...');
  
  // 防止重复加载
  if (window.PreOrderInstantFix) {
    console.log('✅ 立即修复版本已运行');
    return;
  }
  window.PreOrderInstantFix = true;
  
  // 配置
  const CONFIG = {
    debug: true,
    version: '2.0.0',
    shop: window.Shopify?.shop || 'arivi-shop.myshopify.com',
    mode: 'instant_fix'
  };
  
  console.log('📊 配置信息:', CONFIG);
  
  // 注入专业级样式
  function injectProfessionalStyles() {
    if (document.getElementById('preorder-instant-styles')) return;
    
    const styles = `
      /* PreOrder Pro - 专业级样式 */
      .preorder-btn-instant {
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
        color: white !important;
        border: none !important;
        padding: 16px 32px !important;
        border-radius: 12px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        width: 100% !important;
        font-size: 16px !important;
        margin: 12px 0 !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4) !important;
        text-transform: none !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
        position: relative !important;
        overflow: hidden !important;
        min-height: 56px !important;
        letter-spacing: 0.5px !important;
        animation: preorderSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      .preorder-btn-instant:hover {
        background: linear-gradient(135deg, #e55a2b 0%, #d7831a 100%) !important;
        transform: translateY(-3px) scale(1.02) !important;
        box-shadow: 0 12px 35px rgba(255, 107, 53, 0.5) !important;
      }
      
      .preorder-btn-instant:active {
        transform: translateY(-1px) scale(1.01) !important;
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
      }
      
      .preorder-btn-instant::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .preorder-btn-instant:hover::before {
        left: 100%;
      }
      
      .preorder-icon {
        margin-right: 10px !important;
        font-size: 20px !important;
        animation: preorderBounce 2s infinite !important;
      }
      
      .preorder-text {
        font-weight: 700 !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
      }
      
      .preorder-badge-instant {
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
        color: white !important;
        padding: 8px 16px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        z-index: 1000 !important;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.5) !important;
        animation: preorderPulse 3s infinite !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
      }
      
      @keyframes preorderSlideIn {
        0% { 
          opacity: 0; 
          transform: translateY(30px) scale(0.9); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0) scale(1); 
        }
      }
      
      @keyframes preorderPulse {
        0%, 100% { 
          transform: scale(1); 
          opacity: 1; 
        }
        50% { 
          transform: scale(1.08); 
          opacity: 0.9; 
        }
      }
      
      @keyframes preorderBounce {
        0%, 20%, 50%, 80%, 100% { 
          transform: translateY(0); 
        }
        40% { 
          transform: translateY(-4px); 
        }
        60% { 
          transform: translateY(-2px); 
        }
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .preorder-btn-instant {
          font-size: 15px !important;
          padding: 14px 28px !important;
          min-height: 52px !important;
        }
        
        .preorder-badge-instant {
          font-size: 11px !important;
          padding: 6px 12px !important;
        }
      }
      
      /* 暗色主题适配 */
      @media (prefers-color-scheme: dark) {
        .preorder-btn-instant {
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6) !important;
        }
      }
      
      /* 售罄按钮隐藏动画 */
      .sold-out-hidden {
        opacity: 0 !important;
        transform: scale(0.95) !important;
        transition: all 0.3s ease !important;
        pointer-events: none !important;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'preorder-instant-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    console.log('✅ 专业级样式已注入');
  }
  
  // 智能检测售罄状态 - 多重检测机制
  function detectSoldOutWithMultipleMethods() {
    console.log('🔍 开始智能售罄检测...');
    
    const detectionResults = [];
    
    // 方法1: 检查禁用按钮 (最常见)
    const disabledButtons = document.querySelectorAll('button:disabled, input:disabled');
    console.log('找到禁用按钮:', disabledButtons.length);
    
    for (let i = 0; i < disabledButtons.length; i++) {
      const btn = disabledButtons[i];
      const text = (btn.textContent || btn.value || '').toLowerCase().trim();
      console.log(`按钮 ${i + 1} 文本: "${text}"`);
      
      if (text.includes('sold out') || 
          text.includes('unavailable') || 
          text.includes('out of stock') ||
          text.includes('缺货') ||
          text.includes('售罄') ||
          text.includes('sold') ||
          text.includes('out')) {
        detectionResults.push({
          method: 'disabled_button',
          element: btn,
          confidence: 0.9,
          text: text
        });
      }
    }
    
    // 方法2: 检查按钮文本 (即使未禁用)
    const allButtons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
    for (const btn of allButtons) {
      const text = (btn.textContent || btn.value || '').toLowerCase().trim();
      if (text.includes('sold out') || text.includes('unavailable')) {
        detectionResults.push({
          method: 'button_text',
          element: btn,
          confidence: 0.8,
          text: text
        });
      }
    }
    
    // 方法3: 检查特定类名
    const soldOutElements = document.querySelectorAll('.sold-out, .unavailable, .out-of-stock, [class*="sold"], [class*="unavailable"]');
    if (soldOutElements.length > 0) {
      const nearbyButton = soldOutElements[0].closest('form, .product-form, .product')?.querySelector('button, input[type="submit"]');
      if (nearbyButton) {
        detectionResults.push({
          method: 'class_detection',
          element: nearbyButton,
          confidence: 0.7,
          text: 'class-based detection'
        });
      }
    }
    
    // 方法4: 检查页面文本内容
    const bodyText = document.body.textContent.toLowerCase();
    if (bodyText.includes('sold out') || bodyText.includes('out of stock')) {
      const formButton = document.querySelector('form[action*="/cart/add"] button, .product-form button, .add-to-cart button');
      if (formButton) {
        detectionResults.push({
          method: 'page_text',
          element: formButton,
          confidence: 0.6,
          text: 'page content detection'
        });
      }
    }
    
    // 方法5: Shopify 产品数据检查
    if (window.meta?.product) {
      const product = window.meta.product;
      if (product.variants && product.variants.every(v => !v.available)) {
        const productButton = document.querySelector('.product-form button, form[action*="/cart/add"] button');
        if (productButton) {
          detectionResults.push({
            method: 'shopify_data',
            element: productButton,
            confidence: 0.95,
            text: 'shopify product data'
          });
        }
      }
    }
    
    console.log('检测结果:', detectionResults);
    
    // 选择置信度最高的结果
    if (detectionResults.length > 0) {
      const bestResult = detectionResults.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      console.log('✅ 最佳检测结果:', bestResult);
      return {
        found: true,
        button: bestResult.element,
        method: bestResult.method,
        confidence: bestResult.confidence,
        text: bestResult.text
      };
    }
    
    console.log('❌ 未检测到售罄状态');
    return { found: false, button: null, method: 'none' };
  }
  
  // 创建专业级预购按钮
  function createProfessionalPreorderButton() {
    const button = document.createElement('button');
    button.className = 'preorder-btn-instant';
    button.innerHTML = `
      <span class="preorder-icon">🛒</span>
      <span class="preorder-text">立即预订 Pre-Order Now</span>
    `;
    
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      showProfessionalModal();
    });
    
    return button;
  }
  
  // 显示专业级成功模态框
  function showProfessionalModal() {
    // 移除现有模态框
    const existingModal = document.getElementById('preorder-success-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'preorder-success-modal';
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.7) !important;
      z-index: 99999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(8px) !important;
      animation: modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white !important;
      padding: 50px !important;
      border-radius: 20px !important;
      max-width: 600px !important;
      width: 90% !important;
      text-align: center !important;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4) !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative !important;
    `;
    
    content.innerHTML = `
      <div style="font-size: 80px; margin-bottom: 30px; animation: successBounce 1.2s ease-out;">🎉</div>
      <h2 style="color: #333; margin-bottom: 20px; font-size: 32px; margin-top: 0; font-weight: 800;">预购成功！</h2>
      <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">✅ PreOrder Pro 专业版正常运行！</p>
      </div>
      <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: left;">
        <h3 style="margin-top: 0; color: #333; font-size: 18px; margin-bottom: 15px;">📊 系统信息</h3>
        <div style="display: grid; gap: 10px; font-size: 14px; color: #666;">
          <div><strong>🏪 商店:</strong> <code style="background: #e9ecef; padding: 2px 8px; border-radius: 4px;">${CONFIG.shop}</code></div>
          <div><strong>🔧 模式:</strong> <span style="color: #ff6b35; font-weight: 600;">立即修复版 v${CONFIG.version}</span></div>
          <div><strong>🕒 时间:</strong> ${new Date().toLocaleString()}</div>
          <div><strong>🎯 状态:</strong> <span style="color: #28a745; font-weight: 600;">完全激活</span></div>
        </div>
      </div>
      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <button onclick="this.closest('#preorder-success-modal').remove()" 
                style="background: #ff6b35; color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 16px; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
          关闭
        </button>
        <button onclick="window.open('https://shopmall.dpdns.org', '_blank')" 
                style="background: #6c757d; color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 16px; transition: all 0.2s;">
          管理应用
        </button>
        <button onclick="location.reload()" 
                style="background: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 16px; transition: all 0.2s;">
          刷新页面
        </button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // 添加动画样式
    const animationStyles = `
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalSlideUp {
        from { opacity: 0; transform: translateY(50px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes successBounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
        40% { transform: translateY(-15px) scale(1.1); }
        60% { transform: translateY(-8px) scale(1.05); }
      }
    `;
    
    if (!document.getElementById('preorder-modal-animations')) {
      const animationSheet = document.createElement('style');
      animationSheet.id = 'preorder-modal-animations';
      animationSheet.textContent = animationStyles;
      document.head.appendChild(animationSheet);
    }
    
    // 10秒后自动关闭
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 10000);
    
    console.log('✅ 专业级成功模态框已显示');
  }
  
  // 智能插入预购按钮
  function smartInsertPreorderButton(soldOutButton, preorderButton) {
    console.log('🎯 智能插入预购按钮...');
    
    if (soldOutButton) {
      // 添加隐藏动画到售罄按钮
      soldOutButton.classList.add('sold-out-hidden');
      
      // 延迟插入预购按钮，创建平滑过渡
      setTimeout(() => {
        soldOutButton.style.display = 'none';
        soldOutButton.parentNode.insertBefore(preorderButton, soldOutButton.nextSibling);
        console.log('✅ 预购按钮已替换售罄按钮');
      }, 300);
    } else {
      // 寻找最佳插入位置
      const insertTargets = [
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
      for (const selector of insertTargets) {
        const target = document.querySelector(selector);
        if (target) {
          target.appendChild(preorderButton);
          inserted = true;
          console.log('✅ 预购按钮插入到:', selector);
          break;
        }
      }
      
      if (!inserted) {
        // 最后的备选方案
        const container = document.querySelector('main, .main, #main, .container, body');
        if (container) {
          container.appendChild(preorderButton);
          console.log('⚠️ 预购按钮插入到备选位置');
        }
      }
    }
  }
  
  // 主初始化函数
  function initInstantPreorderFix() {
    console.log('🚀 PreOrder Pro 立即修复版本初始化...');
    
    // 注入专业级样式
    injectProfessionalStyles();
    
    // 智能检测售罄状态
    const soldOutDetection = detectSoldOutWithMultipleMethods();
    
    if (!soldOutDetection.found) {
      console.log('❌ 产品未售罄，预购功能待机');
      console.log('💡 提示: 确保产品库存为0或按钮显示"Sold out"');
      return;
    }
    
    console.log('✅ 检测到售罄产品，激活预购功能');
    console.log('📊 检测方法:', soldOutDetection.method);
    console.log('🎯 置信度:', (soldOutDetection.confidence * 100) + '%');
    
    // 创建专业级预购按钮
    const preorderButton = createProfessionalPreorderButton();
    
    // 智能插入预购按钮
    smartInsertPreorderButton(soldOutDetection.button, preorderButton);
    
    // 添加预购徽章到产品图片
    const productImage = document.querySelector('.product__photo img, .product-single__photo img, .product-image img');
    if (productImage && productImage.parentNode) {
      const badge = document.createElement('div');
      badge.className = 'preorder-badge-instant';
      badge.textContent = 'Pre-Order';
      productImage.parentNode.style.position = 'relative';
      productImage.parentNode.appendChild(badge);
      console.log('✅ 预购徽章已添加');
    }
    
    console.log('🎉 PreOrder Pro 立即修复版本初始化完成！');
    
    // 发送成功事件
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('preorder:activated', {
        detail: {
          version: CONFIG.version,
          method: soldOutDetection.method,
          confidence: soldOutDetection.confidence,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }
  
  // 多重启动机制 - 确保在各种情况下都能运行
  function startWithMultipleAttempts() {
    let attempts = 0;
    const maxAttempts = 8;
    
    function tryInit() {
      attempts++;
      console.log(`🔄 初始化尝试 ${attempts}/${maxAttempts}`);
      
      // 检查页面是否准备就绪
      const isReady = document.readyState === 'complete' || 
                     document.querySelector('button, input') ||
                     document.querySelector('.product, .product-form');
      
      if (isReady) {
        initInstantPreorderFix();
      } else if (attempts < maxAttempts) {
        setTimeout(tryInit, 1500);
      } else {
        console.log('❌ 达到最大尝试次数');
        // 强制初始化
        initInstantPreorderFix();
      }
    }
    
    // 立即尝试
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryInit);
      document.addEventListener('load', tryInit);
    } else {
      tryInit();
    }
    
    // 额外的延迟初始化，处理动态加载的内容
    setTimeout(tryInit, 3000);
    setTimeout(tryInit, 6000);
  }
  
  // 全局暴露调试接口
  window.PreOrderInstantFix = {
    init: initInstantPreorderFix,
    detect: detectSoldOutWithMultipleMethods,
    config: CONFIG,
    version: CONFIG.version,
    restart: startWithMultipleAttempts
  };
  
  // 启动立即修复系统
  startWithMultipleAttempts();
  
  console.log('🎯 PreOrder Pro 立即修复版本已加载！');
  console.log('🔧 调试命令: window.PreOrderInstantFix.restart()');
  
})();
