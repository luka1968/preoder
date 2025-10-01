/**
 * 图标集成工具
 * 用于从iconfont.cn下载和集成图标到项目中
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class IconIntegration {
  constructor() {
    this.iconsDir = path.join(__dirname, '../public/icons');
    this.componentsDir = path.join(__dirname, '../components/icons');
    
    // 确保目录存在
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.iconsDir)) {
      fs.mkdirSync(this.iconsDir, { recursive: true });
    }
    if (!fs.existsSync(this.componentsDir)) {
      fs.mkdirSync(this.componentsDir, { recursive: true });
    }
  }

  /**
   * 下载SVG图标
   * @param {string} url - iconfont.cn的SVG图标URL
   * @param {string} filename - 保存的文件名
   */
  async downloadSvgIcon(url, filename) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.iconsDir, `${filename}.svg`);
      const file = fs.createWriteStream(filePath);

      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ 下载完成: ${filename}.svg`);
          resolve(filePath);
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {}); // 删除失败的文件
        reject(err);
      });
    });
  }

  /**
   * 生成React图标组件
   * @param {string} svgPath - SVG文件路径
   * @param {string} componentName - 组件名称
   */
  generateReactComponent(svgPath, componentName) {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // 提取SVG内容，移除XML声明和根标签
    const svgMatch = svgContent.match(/<svg[^>]*>(.*?)<\/svg>/s);
    if (!svgMatch) {
      throw new Error(`无效的SVG文件: ${svgPath}`);
    }

    const svgAttributes = svgContent.match(/<svg([^>]*)>/)[1];
    const svgInnerContent = svgMatch[1];

    const componentContent = `import React from 'react';

interface ${componentName}Props {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function ${componentName}({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: ${componentName}Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      ${svgInnerContent.trim()}
    </svg>
  );
}
`;

    const componentPath = path.join(this.componentsDir, `${componentName}.tsx`);
    fs.writeFileSync(componentPath, componentContent);
    console.log(`✅ 生成组件: ${componentName}.tsx`);
    
    return componentPath;
  }

  /**
   * 批量处理图标
   * @param {Array} icons - 图标配置数组
   */
  async processIcons(icons) {
    const results = [];
    
    for (const icon of icons) {
      try {
        console.log(`🔄 处理图标: ${icon.name}`);
        
        // 如果提供了URL，先下载
        if (icon.url) {
          await this.downloadSvgIcon(icon.url, icon.filename);
        }
        
        // 生成React组件
        const svgPath = path.join(this.iconsDir, `${icon.filename}.svg`);
        if (fs.existsSync(svgPath)) {
          const componentPath = this.generateReactComponent(svgPath, icon.componentName);
          results.push({
            name: icon.name,
            svgPath,
            componentPath,
            success: true
          });
        } else {
          console.log(`❌ SVG文件不存在: ${svgPath}`);
          results.push({
            name: icon.name,
            success: false,
            error: 'SVG文件不存在'
          });
        }
      } catch (error) {
        console.error(`❌ 处理失败 ${icon.name}:`, error.message);
        results.push({
          name: icon.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * 生成图标索引文件
   * @param {Array} results - 处理结果
   */
  generateIconIndex(results) {
    const successfulIcons = results.filter(r => r.success);
    
    const indexContent = `// 图标组件索引文件
// 自动生成，请勿手动修改

${successfulIcons.map(icon => 
  `export { default as ${icon.name.replace(/[^a-zA-Z0-9]/g, '')} } from './${icon.name.replace(/[^a-zA-Z0-9]/g, '')}';`
).join('\n')}

// 图标映射对象
export const IconMap = {
${successfulIcons.map(icon => 
  `  '${icon.name}': ${icon.name.replace(/[^a-zA-Z0-9]/g, '')},`
).join('\n')}
};

// 图标名称列表
export const IconNames = [
${successfulIcons.map(icon => `  '${icon.name}',`).join('\n')}
];
`;

    const indexPath = path.join(this.componentsDir, 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
    console.log(`✅ 生成索引文件: index.ts`);
  }

  /**
   * 优化SVG文件
   * @param {string} svgPath - SVG文件路径
   */
  optimizeSvg(svgPath) {
    let content = fs.readFileSync(svgPath, 'utf8');
    
    // 移除不必要的属性和空白
    content = content
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s*=\s*"/g, '="')
      .trim();
    
    // 确保viewBox存在
    if (!content.includes('viewBox')) {
      content = content.replace('<svg', '<svg viewBox="0 0 24 24"');
    }
    
    fs.writeFileSync(svgPath, content);
  }
}

// 使用示例
const iconIntegration = new IconIntegration();

// 预定义的图标配置
const preorderIcons = [
  {
    name: 'ShoppingCart',
    filename: 'shopping-cart-preorder',
    componentName: 'ShoppingCartPreorder',
    // url: 'https://www.iconfont.cn/api/icon/download?id=xxx&format=svg' // 从iconfont.cn获取
  },
  {
    name: 'CreditCard',
    filename: 'credit-card-payment',
    componentName: 'CreditCardPayment',
  },
  {
    name: 'Bell',
    filename: 'notification-bell',
    componentName: 'NotificationBell',
  },
  {
    name: 'Clock',
    filename: 'countdown-clock',
    componentName: 'CountdownClock',
  },
  {
    name: 'Package',
    filename: 'package-delivery',
    componentName: 'PackageDelivery',
  }
];

// 导出工具类和配置
module.exports = {
  IconIntegration,
  preorderIcons
};

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🚀 开始图标集成流程...');
  console.log('📋 请按照以下步骤操作：');
  console.log('1. 访问 https://www.iconfont.cn/');
  console.log('2. 搜索并选择合适的图标');
  console.log('3. 下载SVG格式的图标文件');
  console.log('4. 将SVG文件放入 public/icons/ 目录');
  console.log('5. 运行: node scripts/icon-integration.js process');
  
  const command = process.argv[2];
  
  if (command === 'process') {
    // 处理现有的SVG文件
    const iconsDir = path.join(__dirname, '../public/icons');
    const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
    
    const icons = svgFiles.map(file => {
      const name = path.basename(file, '.svg');
      const componentName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      return {
        name: componentName,
        filename: name,
        componentName: componentName
      };
    });
    
    iconIntegration.processIcons(icons).then(results => {
      iconIntegration.generateIconIndex(results);
      console.log('✅ 图标集成完成！');
      console.log(`📊 成功: ${results.filter(r => r.success).length}/${results.length}`);
    });
  }
}
