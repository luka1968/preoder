// PreOrder Pro - 简单直接注入版本
(function() {
  'use strict';
  
  console.log('🚀 PreOrder Pro Simple Inject Loading...');
  
  // 防止重复加载
  if (window.PreOrderSimpleLoaded) {
    console.log('✅ PreOrder Simple already loaded');
    return;
  }
  window.PreOrderSimpleLoaded = true;
  
  // 配置
  const CONFIG = {
    debug: true,
    shop: window.Shopify?.shop || window.location.hostname,
    apiUrl: 'https://preorder-pro-fix.vercel.app/api'
  };
  
  const log = (...args) => {
    if (CONFIG.debug) {
      console.log('[PreOrder Simple]', ...args);
    }
  };
  
  log('Starting with config:', CONFIG);
  
  // 检测售罄状态
  function detectSoldOut() {
    log('🔍 Detecting sold out status...');
    
    // 检查禁用的按钮
    const disabledButtons = document.querySelectorAll('button:disabled, input:disabled');
    log('Found disabled buttons:', disabledButtons.length);
    
    for (let button of disabledButtons) {
      const text = (button.textContent || button.value || '').toLowerCase();
      log('Button text:', text);
      
      if (text.includes('sold out') || 
          text.includes('unavailable') || 
          text.includes('out of stock') ||
          text.includes('缺货') ||
          text.includes('售罄')) {
        log('✅ Found sold out button:', button);
        return { isSoldOut: true, button: button };
      }
    }
    
    // 检查页面文本
    const pageText = document.body.textContent.toLowerCase();
    if (pageText.includes('sold out')) {
      log('✅ Found "sold out" in page text');
      const anyButton = document.querySelector('button, input[type="submit"]');
      return { isSoldOut: true, button: anyButton };
    }
    
    log('❌ No sold out status detected');
    return { isSoldOut: false, button: null };
  }
  
  // 创建预购按钮
  function createPreorderButton() {
    const button = document.createElement('button');
    button.className = 'preorder-btn-simple';
    button.innerHTML = `
      <span style="margin-right: 8px;">🛒</span>
      <span>立即预订 Pre-Order Now</span>
    `;
    
    // 样式
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      z-index: 1000 !important;
      position: relative !important;
    `;
    
    // 悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
    });
    
    // 点击事件
    button.addEventListener('click', (e) => {
      e.preventDefault();
      showPreorderSuccess();
    });
    
    return button;
  }
  
  // 显示预购成功消息
  function showPreorderSuccess() {
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
      <h2 style="color: #333; margin-bottom: 16px; font-size: 24px; margin-top: 0;">预购成功！</h2>
      <p style="color: #666; margin-bottom: 24px; line-height: 1.5; margin-top: 0;">
        <strong>✅ PreOrder Pro 工作正常！</strong><br>
        这证明预购功能已经成功激活。<br>
        <small>商店: ${CONFIG.shop}</small>
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
  
  // 主初始化函数
  function initPreorder() {
    log('🚀 Initializing PreOrder...');
    
    const status = detectSoldOut();
    
    if (!status.isSoldOut) {
      log('❌ Product is not sold out, skipping');
      return;
    }
    
    log('✅ Product is sold out, creating preorder button');
    
    const preorderButton = createPreorderButton();
    
    if (status.button) {
      // 隐藏原按钮，插入预购按钮
      status.button.style.display = 'none';
      status.button.parentNode.insertBefore(preorderButton, status.button.nextSibling);
      log('✅ Preorder button inserted after sold out button');
    } else {
      // 寻找合适位置插入
      const targets = [
        '.product-form',
        '.product__form', 
        '.add-to-cart-form',
        'form[action*="/cart/add"]',
        '.product-form__buttons',
        '.product__price'
      ];
      
      let inserted = false;
      for (const selector of targets) {
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
        const container = document.querySelector('.product, .product-single, main') || document.body;
        container.appendChild(preorderButton);
        log('⚠️ Preorder button inserted as fallback');
      }
    }
    
    log('🎉 PreOrder initialization complete!');
  }
  
  // 多次尝试初始化
  let attempts = 0;
  const maxAttempts = 5;
  
  function tryInit() {
    attempts++;
    log(`🔄 Initialization attempt ${attempts}/${maxAttempts}`);
    
    if (document.readyState === 'complete' || document.querySelector('button, input')) {
      initPreorder();
    } else if (attempts < maxAttempts) {
      setTimeout(tryInit, 2000);
    } else {
      log('❌ Max attempts reached, giving up');
    }
  }
  
  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
  
  // 全局暴露
  window.PreOrderSimple = {
    init: initPreorder,
    detect: detectSoldOut,
    config: CONFIG
  };
  
  log('🎯 PreOrder Simple loaded and ready!');
  
})();
