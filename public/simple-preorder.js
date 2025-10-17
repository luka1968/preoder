// 简化版预购集成脚本 - 直接检测售罄状态并显示预购按钮
(function() {
  'use strict';

  console.log('PreOrder Script Loaded');

  // 等待页面加载完成
  function init() {
    console.log('PreOrder Init Started');
    
    // 查找售罄按钮
    const soldOutButton = document.querySelector('button[disabled], input[disabled]');
    const buttonText = soldOutButton ? (soldOutButton.textContent || soldOutButton.value || '').toLowerCase() : '';
    
    console.log('Found button:', soldOutButton);
    console.log('Button text:', buttonText);
    
    // 检查是否是售罄状态
    if (soldOutButton && (
      buttonText.includes('sold out') || 
      buttonText.includes('unavailable') || 
      buttonText.includes('out of stock')
    )) {
      console.log('Product is sold out, showing preorder button');
      showPreorderButton(soldOutButton);
    } else {
      console.log('Product is available or no sold out button found');
    }
  }

  // 显示预购按钮
  function showPreorderButton(originalButton) {
    // 创建预购按钮
    const preorderBtn = document.createElement('button');
    preorderBtn.innerHTML = '🛒 立即预订 Pre-Order Now';
    preorderBtn.className = 'btn preorder-btn';
    preorderBtn.style.cssText = `
      background: #ff6b35 !important;
      color: white !important;
      border: none !important;
      padding: 15px 30px !important;
      border-radius: 6px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      width: 100% !important;
      font-size: 16px !important;
      margin: 10px 0 !important;
      transition: all 0.3s ease !important;
      display: block !important;
    `;

    // 添加悬停效果
    preorderBtn.addEventListener('mouseover', () => {
      preorderBtn.style.background = '#e55a2b !important';
      preorderBtn.style.transform = 'translateY(-2px)';
    });

    preorderBtn.addEventListener('mouseout', () => {
      preorderBtn.style.background = '#ff6b35 !important';
      preorderBtn.style.transform = 'translateY(0)';
    });

    // 点击事件
    preorderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('预购功能已激活！\n\nPreorder feature activated!\n\n这证明我们的修复成功了 - 售罄时正确显示了预购按钮。');
    });

    // 替换原按钮
    originalButton.style.display = 'none';
    originalButton.parentNode.insertBefore(preorderBtn, originalButton.nextSibling);

    // 添加预购徽章到产品图片
    addPreorderBadge();
    
    console.log('Preorder button added successfully');
  }

  // 添加预购徽章
  function addPreorderBadge() {
    const imageContainer = document.querySelector('.product__media, .product-single__photos, .product-images, .featured-image');
    
    if (imageContainer) {
      const badge = document.createElement('div');
      badge.innerHTML = '预售 Pre-Order';
      badge.style.cssText = `
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
        background: #ff6b35 !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 4px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        z-index: 1000 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
      `;
      
      imageContainer.style.position = 'relative';
      imageContainer.appendChild(badge);
      
      console.log('Preorder badge added');
    }
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 也监听页面变化（适用于SPA）
  setTimeout(init, 1000);
  setTimeout(init, 3000);

})();
