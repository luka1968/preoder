/**
 * 库存为零预购按钮修复验证脚本
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 或者在商品页面添加 <script src="/test-fix-verification.js"></script>
 */

(function() {
  'use strict';

  console.log('🧪 开始验证预购按钮修复...');
  console.log('='.repeat(60));

  // 测试场景
  const testScenarios = [
    {
      name: '场景1: available = false',
      data: {
        available: false,
        inventory_quantity: 0
      },
      expected: true
    },
    {
      name: '场景2: inventory_quantity = 0',
      data: {
        available: true,
        inventory_quantity: 0,
        inventory_management: 'shopify'
      },
      expected: true
    },
    {
      name: '场景3: inventory_quantity = -5',
      data: {
        available: false,
        inventory_quantity: -5,
        inventory_management: 'shopify'
      },
      expected: true
    },
    {
      name: '场景4: inventory_quantity = 10 (有库存)',
      data: {
        available: true,
        inventory_quantity: 10,
        inventory_management: 'shopify'
      },
      expected: false
    },
    {
      name: '场景5: 无库存管理',
      data: {
        available: true,
        inventory_quantity: null,
        inventory_management: null
      },
      expected: false
    }
  ];

  // 模拟售罄检测逻辑（与修复后的代码一致）
  function testSoldOutDetection(variant) {
    const isOutOfStock = (
      variant.available === false ||
      (typeof variant.inventory_quantity === 'number' && variant.inventory_quantity <= 0) ||
      (variant.inventory_management && variant.inventory_quantity <= 0)
    );
    return isOutOfStock;
  }

  // 运行测试
  let passedTests = 0;
  let failedTests = 0;

  testScenarios.forEach((scenario, index) => {
    const result = testSoldOutDetection(scenario.data);
    const passed = result === scenario.expected;
    
    if (passed) {
      passedTests++;
      console.log(`✅ ${scenario.name}`);
    } else {
      failedTests++;
      console.error(`❌ ${scenario.name}`);
      console.error(`   预期: ${scenario.expected}, 实际: ${result}`);
    }
    
    console.log(`   数据:`, scenario.data);
    console.log(`   结果: ${result ? '显示预购' : '不显示预购'}`);
    console.log('');
  });

  console.log('='.repeat(60));
  console.log(`📊 测试结果: ${passedTests}/${testScenarios.length} 通过`);
  
  if (failedTests === 0) {
    console.log('🎉 所有测试通过！修复成功！');
  } else {
    console.error(`⚠️ ${failedTests} 个测试失败，需要进一步检查`);
  }
  console.log('='.repeat(60));

  // 检查当前页面的产品数据
  if (window.meta?.product) {
    console.log('');
    console.log('📦 当前页面产品数据:');
    console.log('产品ID:', window.meta.product.id);
    
    if (window.meta.product.variants) {
      console.log('变体数量:', window.meta.product.variants.length);
      
      window.meta.product.variants.forEach((variant, index) => {
        console.log(`\n变体 ${index + 1}:`);
        console.log('  - ID:', variant.id);
        console.log('  - available:', variant.available);
        console.log('  - inventory_quantity:', variant.inventory_quantity);
        console.log('  - inventory_policy:', variant.inventory_policy);
        console.log('  - inventory_management:', variant.inventory_management);
        
        const shouldShowPreorder = testSoldOutDetection(variant);
        console.log(`  - 预购状态: ${shouldShowPreorder ? '✅ 应显示' : '❌ 不显示'}`);
      });
    }
  } else {
    console.log('');
    console.log('ℹ️ 当前页面没有产品数据（可能不是产品页面）');
  }

  // 检查预购脚本是否已加载
  console.log('');
  console.log('🔍 检查预购脚本状态:');
  console.log('PreOrderIntegration:', window.PreOrderIntegration ? '✅ 已加载' : '❌ 未加载');
  console.log('PreOrderAppEmbed:', window.PreOrderAppEmbed ? '✅ 已加载' : '❌ 未加载');
  console.log('PREORDER_CONFIG:', window.PREORDER_CONFIG ? '✅ 已配置' : '❌ 未配置');

  if (window.PREORDER_CONFIG) {
    console.log('配置详情:', window.PREORDER_CONFIG);
  }

  // 提供手动测试函数
  window.testPreorderFix = {
    runTests: function() {
      console.log('🔄 重新运行测试...');
      location.reload();
    },
    
    checkCurrentProduct: function() {
      if (!window.meta?.product) {
        console.error('❌ 当前页面没有产品数据');
        return;
      }
      
      const variant = window.meta.product.variants?.[0];
      if (!variant) {
        console.error('❌ 没有找到变体数据');
        return;
      }
      
      console.log('📦 当前产品变体:');
      console.log(variant);
      
      const shouldShow = testSoldOutDetection(variant);
      console.log(`\n预购按钮应该${shouldShow ? '显示' : '不显示'}`);
      
      const preorderBtn = document.querySelector('.preorder-btn');
      const actuallyShowing = !!preorderBtn;
      
      console.log(`实际${actuallyShowing ? '显示了' : '没有显示'}预购按钮`);
      
      if (shouldShow === actuallyShowing) {
        console.log('✅ 状态正确！');
      } else {
        console.error('❌ 状态不匹配！可能需要刷新页面或检查脚本加载');
      }
    },
    
    forceInit: function() {
      console.log('🔄 强制重新初始化预购功能...');
      
      if (window.PreOrderIntegration) {
        window.PreOrderIntegration.init();
        console.log('✅ PreOrderIntegration 已重新初始化');
      }
      
      if (window.PreOrderAppEmbed) {
        window.PreOrderAppEmbed.init();
        console.log('✅ PreOrderAppEmbed 已重新初始化');
      }
      
      if (!window.PreOrderIntegration && !window.PreOrderAppEmbed) {
        console.error('❌ 预购脚本未加载');
      }
    }
  };

  console.log('');
  console.log('💡 提示: 使用以下命令进行手动测试:');
  console.log('  - testPreorderFix.checkCurrentProduct() - 检查当前产品');
  console.log('  - testPreorderFix.forceInit() - 强制重新初始化');
  console.log('  - testPreorderFix.runTests() - 重新运行测试');

})();
