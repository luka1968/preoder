# 图标使用指南

## 从iconfont.cn获取图标的步骤

### 1. 访问iconfont.cn
打开 [https://www.iconfont.cn/](https://www.iconfont.cn/)

### 2. 搜索图标
- 在搜索框中输入关键词（如：购物车、支付、通知等）
- 选择合适的图标风格（建议选择线性图标，与项目现有风格一致）

### 3. 下载图标
- 点击图标进入详情页
- 选择"下载"按钮
- 选择SVG格式下载
- 或者复制SVG代码

### 4. 添加到项目
将下载的SVG文件放入 `public/icons/` 目录，文件命名规范：
- 使用小写字母和连字符
- 描述性命名，如：`shopping-cart-filled.svg`

### 5. 生成React组件
运行以下命令自动生成React组件：
```bash
node scripts/icon-integration.js process
```

## 现有图标组件

### 预售相关图标
```tsx
import { BadgePreorder, BadgeComingSoon, BadgeOutOfStock } from '@/components/icons';

// 使用示例
<BadgePreorder size={20} color="#3b82f6" className="mr-2" />
<BadgeComingSoon size="md" color="warning" />
<BadgeOutOfStock className="text-red-500" />
```

### 功能图标
```tsx
import { Calendar, Timer, Truck } from '@/components/icons';

// 日历图标
<Calendar size={24} color="currentColor" />

// 计时器图标
<Timer size="lg" className="text-primary-600" />

// 配送图标
<Truck size={32} color="#10b981" />
```

## 图标属性

### 基础属性
- `size`: 图标尺寸，支持数字或预设值
- `color`: 图标颜色，支持CSS颜色值或预设值
- `className`: 额外的CSS类名

### 尺寸预设
```tsx
// 数字值
<Icon size={16} />
<Icon size={24} />
<Icon size={32} />

// 预设值（需要配置IconWrapper）
<Icon size="xs" />  // 12px
<Icon size="sm" />  // 16px
<Icon size="md" />  // 20px
<Icon size="lg" />  // 24px
<Icon size="xl" />  // 32px
<Icon size="2xl" /> // 48px
```

### 颜色预设
```tsx
<Icon color="primary" />    // 主题色
<Icon color="secondary" />  // 次要色
<Icon color="success" />    // 成功色
<Icon color="warning" />    // 警告色
<Icon color="error" />      // 错误色
<Icon color="info" />       // 信息色
<Icon color="current" />    // 当前文本色
```

## 在项目中使用图标

### 1. 导航菜单图标
```tsx
// components/Layout.tsx
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { BadgePreorder } from '@/components/icons';

const navigation = [
  { 
    name: 'Pre-orders', 
    href: '/preorders', 
    icon: BadgePreorder 
  },
  // ...
];
```

### 2. 按钮图标
```tsx
// 带图标的按钮
<button className="btn-primary">
  <BadgePreorder size={16} className="mr-2" />
  Create Pre-order
</button>
```

### 3. 状态徽章
```tsx
// 订单状态显示
<div className="flex items-center">
  <BadgePreorder size={14} className="mr-1 text-blue-500" />
  <span className="text-sm">Pre-order</span>
</div>
```

### 4. 表格图标
```tsx
// 表格中的状态图标
<td className="px-6 py-4">
  <div className="flex items-center">
    {order.type === 'preorder' ? (
      <BadgePreorder size={16} className="text-blue-500" />
    ) : (
      <BadgeOutOfStock size={16} className="text-red-500" />
    )}
  </div>
</td>
```

## 推荐的iconfont.cn图标

### 电商类图标搜索关键词
- **购物车**: "shopping cart", "cart", "购物车"
- **商品**: "product", "box", "商品", "包装"
- **支付**: "payment", "credit card", "支付", "信用卡"
- **订单**: "order", "receipt", "订单", "收据"

### 状态类图标搜索关键词
- **成功**: "check", "success", "完成", "对勾"
- **警告**: "warning", "alert", "警告", "感叹号"
- **错误**: "error", "close", "错误", "叉号"
- **信息**: "info", "question", "信息", "问号"

### 时间类图标搜索关键词
- **时钟**: "clock", "time", "时钟", "时间"
- **日历**: "calendar", "date", "日历", "日期"
- **倒计时**: "countdown", "timer", "倒计时", "计时器"

### 通知类图标搜索关键词
- **铃铛**: "bell", "notification", "铃铛", "通知"
- **邮件**: "mail", "email", "邮件", "信封"
- **消息**: "message", "chat", "消息", "聊天"

## 图标优化建议

### 1. 性能优化
- 使用SVG格式，支持无损缩放
- 移除不必要的SVG属性
- 合并相似的图标到sprite中

### 2. 一致性
- 保持图标风格统一（线性、填充、双色等）
- 使用统一的描边宽度
- 保持相似的视觉重量

### 3. 可访问性
- 为装饰性图标添加 `aria-hidden="true"`
- 为功能性图标添加适当的 `aria-label`
- 确保图标在高对比度模式下可见

### 4. 响应式设计
- 在移动设备上适当调整图标大小
- 确保触摸目标足够大（至少44px）
- 考虑不同屏幕密度的显示效果

## 故障排除

### 常见问题
1. **图标不显示**: 检查SVG文件路径和组件导入
2. **图标变形**: 确保viewBox属性正确设置
3. **颜色不生效**: 检查SVG中是否有硬编码的fill属性
4. **尺寸异常**: 确认CSS样式没有冲突

### 调试技巧
```tsx
// 添加边框查看图标边界
<Icon className="border border-red-500" />

// 检查SVG内容
console.log(document.querySelector('.icon').innerHTML);
```

## 更新图标

当需要更新或添加新图标时：

1. 将新的SVG文件添加到 `public/icons/` 目录
2. 运行 `node scripts/icon-integration.js process`
3. 更新相关组件中的图标引用
4. 测试图标在不同场景下的显示效果

## 最佳实践

1. **命名规范**: 使用描述性的文件名和组件名
2. **尺寸一致**: 在同一界面中保持图标尺寸的一致性
3. **颜色语义**: 使用有意义的颜色（红色表示错误，绿色表示成功等）
4. **适度使用**: 避免过度使用图标，保持界面简洁
5. **测试兼容**: 在不同浏览器和设备上测试图标显示效果
