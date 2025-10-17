// PreOrder Pro - 调试工具
(function() {
  'use strict';
  
  console.log('🔍 PreOrder Pro Debug Tool Starting...');
  
  // 创建调试面板
  function createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'preorder-debug-panel';
    panel.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      width: 350px !important;
      background: #1a1a1a !important;
      color: #00ff00 !important;
      border: 2px solid #00ff00 !important;
      border-radius: 8px !important;
      padding: 15px !important;
      font-family: 'Courier New', monospace !important;
      font-size: 12px !important;
      z-index: 999999 !important;
      box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3) !important;
      max-height: 400px !important;
      overflow-y: auto !important;
    `;
    
    return panel;
  }
  
  // 检测函数
  function runDiagnostics() {
    const results = [];
    
    // 1. 检查 Shopify 环境
    results.push('=== SHOPIFY 环境检测 ===');
    results.push(`✓ Shopify对象: ${window.Shopify ? '存在' : '❌ 不存在'}`);
    results.push(`✓ 商店域名: ${window.Shopify?.shop || '未检测到'}`);
    results.push(`✓ 产品数据: ${window.meta?.product ? '存在' : '❌ 不存在'}`);
    
    // 2. 检查产品状态
    results.push('\n=== 产品状态检测 ===');
    if (window.meta?.product) {
      const product = window.meta.product;
      results.push(`✓ 产品ID: ${product.id}`);
      results.push(`✓ 变体数量: ${product.variants?.length || 0}`);
      
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0];
        results.push(`✓ 库存数量: ${variant.inventory_quantity}`);
        results.push(`✓ 库存策略: ${variant.inventory_policy}`);
        results.push(`✓ 是否可用: ${variant.available ? '是' : '❌ 否'}`);
      }
    }
    
    // 3. 检查售罄按钮
    results.push('\n=== 售罄按钮检测 ===');
    const soldOutButtons = document.querySelectorAll('button[disabled], input[disabled]');
    results.push(`✓ 找到禁用按钮: ${soldOutButtons.length} 个`);
    
    soldOutButtons.forEach((btn, index) => {
      const text = (btn.textContent || btn.value || '').trim();
      results.push(`  ${index + 1}. "${text}" - ${btn.tagName}`);
    });
    
    // 4. 检查预购脚本
    results.push('\n=== 预购脚本检测 ===');
    results.push(`✓ PreOrderWidget: ${window.PreOrderWidget ? '已加载' : '❌ 未加载'}`);
    results.push(`✓ UniversalPreOrder: ${window.UniversalPreOrder ? '已加载' : '❌ 未加载'}`);
    results.push(`✓ PreOrderAppEmbed: ${window.PreOrderAppEmbed ? '已加载' : '❌ 未加载'}`);
    
    // 5. 检查现有预购按钮
    results.push('\n=== 预购按钮检测 ===');
    const preorderButtons = document.querySelectorAll('.preorder-btn, .universal-preorder');
    results.push(`✓ 预购按钮数量: ${preorderButtons.length}`);
    
    // 6. 检查脚本标签
    results.push('\n=== 脚本标签检测 ===');
    const scripts = document.querySelectorAll('script[src*="preorder"], script[src*="universal"]');
    results.push(`✓ 预购脚本标签: ${scripts.length} 个`);
    
    scripts.forEach((script, index) => {
      results.push(`  ${index + 1}. ${script.src}`);
    });
    
    // 7. 手动触发检测
    results.push('\n=== 手动检测结果 ===');
    const hasDisabledButton = Array.from(soldOutButtons).some(btn => {
      const text = (btn.textContent || btn.value || '').toLowerCase();
      return text.includes('sold out') || text.includes('unavailable');
    });
    results.push(`✓ 检测到售罄: ${hasDisabledButton ? '是' : '❌ 否'}`);
    
    return results;
  }
  
  // 手动触发预购初始化
  function manualPreorderInit() {
    console.log('🚀 手动触发预购初始化...');
    
    // 尝试调用各种初始化函数
    if (window.PreOrderWidget && window.PreOrderWidget.create) {
      try {
        const widget = window.PreOrderWidget.create();
        console.log('✅ PreOrderWidget 初始化成功');
      } catch (error) {
        console.error('❌ PreOrderWidget 初始化失败:', error);
      }
    }
    
    if (window.UniversalPreOrder && window.UniversalPreOrder.init) {
      try {
        window.UniversalPreOrder.init();
        console.log('✅ UniversalPreOrder 初始化成功');
      } catch (error) {
        console.error('❌ UniversalPreOrder 初始化失败:', error);
      }
    }
    
    if (window.PreOrderAppEmbed && window.PreOrderAppEmbed.init) {
      try {
        window.PreOrderAppEmbed.init();
        console.log('✅ PreOrderAppEmbed 初始化成功');
      } catch (error) {
        console.error('❌ PreOrderAppEmbed 初始化失败:', error);
      }
    }
  }
  
  // 创建测试预购按钮
  function createTestPreorderButton() {
    // 找到 "Sold out" 按钮
    const soldOutButton = document.querySelector('button:disabled');
    if (!soldOutButton) {
      console.log('❌ 未找到售罄按钮');
      return;
    }
    
    // 创建测试预购按钮
    const testButton = document.createElement('button');
    testButton.className = 'preorder-btn test-preorder';
    testButton.innerHTML = `
      <span style="margin-right: 8px;">🧪</span>
      <span>测试预购按钮 Test PreOrder</span>
    `;
    
    testButton.style.cssText = `
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
    `;
    
    testButton.addEventListener('click', () => {
      alert('🎉 测试预购按钮工作正常！\n\n这证明脚本可以正常运行。\n如果你看到这个按钮，说明问题在于自动检测逻辑。');
    });
    
    // 插入按钮
    soldOutButton.style.display = 'none';
    soldOutButton.parentNode.insertBefore(testButton, soldOutButton.nextSibling);
    
    console.log('✅ 测试预购按钮已创建');
  }
  
  // 显示调试信息
  function showDebugInfo() {
    const panel = createDebugPanel();
    const results = runDiagnostics();
    
    panel.innerHTML = `
      <div style="text-align: center; margin-bottom: 10px; font-weight: bold; color: #00ff00;">
        🔍 PreOrder Pro 调试面板
      </div>
      <div style="margin-bottom: 10px;">
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; float: right;">
          关闭
        </button>
        <button onclick="window.preorderDebug.manualInit()" 
                style="background: #4444ff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
          手动初始化
        </button>
        <button onclick="window.preorderDebug.createTest()" 
                style="background: #44ff44; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
          创建测试按钮
        </button>
      </div>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 11px;">${results.join('\n')}</pre>
    `;
    
    document.body.appendChild(panel);
  }
  
  // 全局暴露调试函数
  window.preorderDebug = {
    show: showDebugInfo,
    manualInit: manualPreorderInit,
    createTest: createTestPreorderButton,
    diagnose: runDiagnostics
  };
  
  // 自动显示调试面板
  setTimeout(showDebugInfo, 1000);
  
  console.log('🎯 PreOrder Pro 调试工具已加载');
  console.log('📋 使用方法:');
  console.log('  - window.preorderDebug.show() - 显示调试面板');
  console.log('  - window.preorderDebug.manualInit() - 手动初始化');
  console.log('  - window.preorderDebug.createTest() - 创建测试按钮');
  
})();
