# 图标集成方案

本文档说明了如何在PreOrder Pro项目中集成和使用来自iconfont.cn的图标。

## 🎯 项目概述

PreOrder Pro是一个Shopify预售插件，需要丰富的图标来增强用户界面体验。项目已集成了完整的图标管理系统，支持从iconfont.cn快速添加新图标。

## 📁 文件结构

```
pre_order/
├── components/
│   └── icons/                    # 图标组件目录
│       ├── IconWrapper.tsx       # 图标包装器组件
│       ├── BadgePreorder.tsx     # 预售徽章图标
│       ├── BadgeComingSoon.tsx   # 即将上市徽章
│       ├── BadgeOutOfStock.tsx   # 缺货徽章
│       ├── Calendar.tsx          # 日历图标
│       ├── Timer.tsx             # 计时器图标
│       ├── Truck.tsx             # 配送图标
│       └── index.ts              # 图标导出索引
├── public/
│   └── icons/                    # SVG源文件目录
│       ├── badge-preorder.svg
│       ├── badge-coming-soon.svg
│       ├── badge-out-of-stock.svg
│       ├── calendar.svg
│       ├── timer.svg
│       └── truck.svg
├── scripts/
│   └── icon-integration.js       # 图标集成工具
├── docs/
│   ├── icon-requirements.md      # 图标需求文档
│   └── icon-usage-guide.md       # 图标使用指南
└── pages/
    └── icons.tsx                  # 图标展示页面
```

## 🚀 快速开始

### 1. 从iconfont.cn添加新图标

1. **访问iconfont.cn**
   ```
   https://www.iconfont.cn/
   ```

2. **搜索图标**
   - 输入关键词（如：购物车、支付、通知）
   - 选择线性风格图标（与项目风格一致）

3. **下载图标**
   - 点击图标详情页
   - 选择SVG格式下载
   - 或复制SVG代码

4. **添加到项目**
   ```bash
   # 将SVG文件放入public/icons/目录
   # 文件命名：使用小写字母和连字符
   # 例如：shopping-cart-filled.svg
   ```

5. **生成React组件**
   ```bash
   npm run icons:process
   ```

### 2. 使用图标组件

```tsx
// 导入图标
import { BadgePreorder, Timer, Calendar } from '@/components/icons';

// 基础使用
<BadgePreorder size={24} color="#3b82f6" />

// 在按钮中使用
<button className="btn-primary">
  <BadgePreorder size={16} className="mr-2" />
  创建预售
</button>

// 状态显示
<div className="flex items-center">
  <Timer size={14} className="mr-1 text-blue-500" />
  <span>倒计时中</span>
</div>
```

## 🛠️ 可用命令

```bash
# 处理现有SVG文件，生成React组件
npm run icons:process

# 查看图标集成帮助
npm run icons:help

# 启动开发服务器查看图标展示页面
npm run dev
# 访问 http://localhost:3000/icons
```

## 📋 现有图标

| 图标名称 | 组件名 | 用途 | 文件 |
|---------|--------|------|------|
| 预售徽章 | `BadgePreorder` | 预售商品标识 | `badge-preorder.svg` |
| 即将上市 | `BadgeComingSoon` | 即将上市商品 | `badge-coming-soon.svg` |
| 缺货徽章 | `BadgeOutOfStock` | 缺货商品标识 | `badge-out-of-stock.svg` |
| 日历 | `Calendar` | 日期选择、时间显示 | `calendar.svg` |
| 计时器 | `Timer` | 倒计时、时间提醒 | `timer.svg` |
| 配送 | `Truck` | 物流、配送状态 | `truck.svg` |

## 🎨 图标规范

### 技术要求
- **格式**: SVG矢量格式
- **尺寸**: 24x24px基准
- **颜色**: 支持CSS颜色变量
- **风格**: 线性图标，1.5px描边

### 使用场景
- **导航菜单**: 16-20px
- **按钮图标**: 16-18px
- **状态徽章**: 12-16px
- **页面标题**: 20-24px

### 属性配置
```tsx
interface IconProps {
  size?: number | string;    // 图标尺寸
  color?: string;           // 图标颜色
  className?: string;       // CSS类名
}
```

## 🔧 工具说明

### icon-integration.js
自动化图标集成工具，功能包括：
- SVG文件下载（支持iconfont.cn URL）
- React组件生成
- TypeScript类型定义
- 索引文件更新
- SVG优化

### IconWrapper.tsx
图标包装器组件，提供：
- 统一的属性接口
- 尺寸和颜色预设
- 可访问性支持
- 响应式设计

## 📖 推荐图标

### 电商相关
- 购物车（多种状态）
- 商品展示
- 价格标签
- 库存管理

### 支付相关
- 信用卡
- 钱包
- 收据
- 退款

### 通知状态
- 铃铛通知
- 邮件提醒
- 成功/失败状态
- 警告提示

### 时间管理
- 时钟倒计时
- 日历日期
- 沙漏等待
- 闹钟提醒

## 🎯 最佳实践

### 1. 保持一致性
- 选择同一设计师或同一系列的图标
- 保持相同的视觉风格和描边宽度
- 使用统一的颜色方案

### 2. 性能优化
- 使用SVG格式减少文件大小
- 移除不必要的SVG属性
- 考虑使用图标字体或sprite

### 3. 可访问性
- 为装饰性图标添加`aria-hidden="true"`
- 为功能性图标提供适当的标签
- 确保足够的对比度

### 4. 响应式设计
- 在不同设备上测试图标显示
- 确保触摸目标大小合适
- 考虑高分辨率屏幕的显示效果

## 🔍 故障排除

### 常见问题

1. **图标不显示**
   - 检查SVG文件路径
   - 确认组件正确导入
   - 验证SVG格式是否正确

2. **图标变形**
   - 检查viewBox属性
   - 确认宽高比例
   - 验证CSS样式

3. **颜色不生效**
   - 检查SVG中的fill属性
   - 使用stroke而非fill
   - 确认CSS优先级

### 调试技巧
```tsx
// 添加边框查看图标边界
<Icon className="border border-red-500" />

// 检查生成的HTML
console.log(document.querySelector('.icon').outerHTML);
```

## 📚 相关文档

- [图标需求文档](./docs/icon-requirements.md)
- [图标使用指南](./docs/icon-usage-guide.md)
- [Heroicons官方文档](https://heroicons.com/)
- [iconfont.cn使用指南](https://www.iconfont.cn/help/detail?spm=a313x.7781069.1998910419.d8cf4382a&helptype=code)

## 🤝 贡献指南

1. 添加新图标前请先查看现有图标
2. 遵循项目的命名规范
3. 确保图标风格一致
4. 更新相关文档
5. 测试在不同场景下的显示效果

## 📄 许可证

本项目图标集成方案遵循MIT许可证。从iconfont.cn下载的图标请遵循其相应的许可证条款。
