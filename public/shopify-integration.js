// Shopify主题集成脚本 - 简化版预购功能
(function() {
  'use strict';

  // 配置
  const CONFIG = {
    appUrl: window.PREORDER_APP_URL || 'https://your-vercel-app.vercel.app', // 你的Vercel应用URL
    debug: true
  };

  // 日志函数
  const log = (...args) => {
    if (CONFIG.debug) {
      console.log('[PreOrder]', ...args);
    }
  };

  // 创建预购按钮
  function createPreorderButton(productId, variantId) {
    const button = document.createElement('button');
    button.className = 'btn preorder-btn';
    button.innerHTML = '🛒 立即预订';
    button.style.cssText = `
      background: #ff6b35;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      margin: 10px 0;
      width: 100%;
      font-size: 16px;
      transition: background 0.3s ease;
    `;

    button.addEventListener('mouseover', () => {
      button.style.background = '#e55a2b';
    });

    button.addEventListener('mouseout', () => {
      button.style.background = '#ff6b35';
    });

    button.addEventListener('click', () => {
      handlePreorderClick(productId, variantId);
    });

    return button;
  }

  // 创建预购徽章
  function createPreorderBadge() {
    const badge = document.createElement('div');
    badge.className = 'preorder-badge';
    badge.innerHTML = '🏷️ 预售';
    badge.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff6b35;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    return badge;
  }

  // 处理预购点击
  function handlePreorderClick(productId, variantId) {
    log('预购点击:', productId, variantId);
    
    // 显示预购表单
    showPreorderModal(productId, variantId);
  }

  // 显示预购模态框
  function showPreorderModal(productId, variantId) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'preorder-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;

    modalContent.innerHTML = `
      <h3 style="margin-bottom: 20px;">预购商品</h3>
      <p style="margin-bottom: 20px; color: #666;">请输入您的邮箱地址，我们会在商品到货时通知您。</p>
      <form id="preorder-form">
        <input type="email" id="preorder-email" placeholder="请输入邮箱地址" required 
               style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;">
        <input type="text" id="preorder-name" placeholder="姓名（可选）" 
               style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;">
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="flex: 1; background: #ff6b35; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer;">
            提交预购
          </button>
          <button type="button" id="close-modal" style="flex: 1; background: #ccc; color: black; border: none; padding: 12px; border-radius: 4px; cursor: pointer;">
            取消
          </button>
        </div>
      </form>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 绑定事件
    document.getElementById('close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('preorder-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('preorder-email').value;
      const name = document.getElementById('preorder-name').value;
      
      await submitPreorder(productId, variantId, email, name);
      document.body.removeChild(modal);
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // 提交预购
  async function submitPreorder(productId, variantId, email, name) {
    try {
      log('提交预购:', { productId, variantId, email, name });
      
      // 这里可以调用你的API
      const response = await fetch(`${CONFIG.appUrl}/api/preorder/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: window.Shopify?.shop || '',
          productId,
          variantId,
          email,
          name
        })
      });

      if (response.ok) {
        alert('✅ 预购成功！我们会在商品到货时通知您。');
      } else {
        throw new Error('预购失败');
      }
    } catch (error) {
      log('预购错误:', error);
      alert('❌ 预购失败，请稍后重试。');
    }
  }

  // 获取产品信息
  function getProductInfo() {
    let productId = null;
    let variantId = null;

    // 尝试从多个来源获取产品ID
    if (window.meta && window.meta.product) {
      productId = window.meta.product.id;
    } else if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta.product) {
      productId = window.ShopifyAnalytics.meta.product.id;
    }

    // 获取当前变体ID
    const variantSelect = document.querySelector('select[name="id"]');
    const variantInput = document.querySelector('input[name="id"]');
    
    if (variantSelect) {
      variantId = variantSelect.value;
    } else if (variantInput) {
      variantId = variantInput.value;
    }

    return { productId, variantId };
  }

  // 检查是否应该显示预购
  function shouldShowPreorder() {
    // 简单检查：如果添加到购物车按钮被禁用，则显示预购
    const addToCartBtn = document.querySelector('button[name="add"], input[name="add"], .btn-product-add');
    
    if (addToCartBtn) {
      return addToCartBtn.disabled || 
             addToCartBtn.textContent.includes('Sold out') ||
             addToCartBtn.textContent.includes('缺货') ||
             addToCartBtn.textContent.includes('售罄');
    }

    return false;
  }

  // 初始化预购功能
  function initPreorder() {
    log('初始化预购功能...');

    const { productId, variantId } = getProductInfo();
    
    if (!productId) {
      log('未找到产品ID，跳过预购初始化');
      return;
    }

    log('产品信息:', { productId, variantId });

    // 添加预购徽章到产品图片
    const productImages = document.querySelectorAll('.product__photo, .product-single__photo, .product-image-main img');
    if (productImages.length > 0) {
      const firstImage = productImages[0];
      const imageContainer = firstImage.parentElement;
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        const badge = createPreorderBadge();
        imageContainer.appendChild(badge);
      }
    }

    // 添加预购按钮
    const addToCartBtn = document.querySelector('button[name="add"], input[name="add"], .btn-product-add');
    if (addToCartBtn) {
      const preorderBtn = createPreorderButton(productId, variantId);
      
      // 如果商品缺货，替换按钮；否则添加在下方
      if (shouldShowPreorder()) {
        addToCartBtn.style.display = 'none';
        addToCartBtn.parentElement.appendChild(preorderBtn);
      } else {
        // 添加在购买按钮下方作为额外选项
        addToCartBtn.parentElement.appendChild(preorderBtn);
      }
    }

    log('预购功能初始化完成');
  }

  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreorder);
  } else {
    initPreorder();
  }

  // 监听变体变化
  document.addEventListener('change', (e) => {
    if (e.target.name === 'id' || e.target.matches('select[name="id"], input[name="id"]')) {
      log('变体变化，重新初始化...');
      setTimeout(initPreorder, 100);
    }
  });

  // 暴露到全局，方便调试
  window.PreOrderIntegration = {
    init: initPreorder,
    config: CONFIG
  };

})();
