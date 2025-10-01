import React from 'react';
import {
  // 电商图标
  ShoppingCartPreorder,
  ProductBox,
  PriceTag,
  // 支付图标
  CreditCard,
  Wallet,
  Receipt,
  // 通知图标
  NotificationBell,
  EmailNotification,
  MessageChat,
  // 状态图标
  CheckSuccess,
  WarningAlert,
  ErrorCross,
  // 时间图标
  ClockTime,
  CalendarDate,
  CountdownTimer,
  // 预售徽章
  BadgePreorder,
  BadgeComingSoon,
  BadgeOutOfStock,
  // 物流图标
  Truck
} from './icons';

/**
 * 预售插件图标使用示例组件
 * 展示各种场景下的图标应用
 */
export default function PreorderIconExamples() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PreOrder Pro 图标使用示例
        </h1>
        <p className="text-gray-600">
          展示预售插件中各种场景的图标应用
        </p>
      </div>

      {/* 预售按钮示例 */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">预售按钮</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary flex items-center">
            <ShoppingCartPreorder size={16} className="mr-2" />
            立即预订
          </button>
          <button className="btn-secondary flex items-center">
            <BadgePreorder size={16} className="mr-2" />
            加入预售
          </button>
          <button className="btn-warning flex items-center">
            <CountdownTimer size={16} className="mr-2" />
            限时预售
          </button>
        </div>
      </section>

      {/* 商品状态徽章 */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">商品状态徽章</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <BadgePreorder size={20} className="mr-3 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">预售中</h3>
              <p className="text-sm text-blue-700">Pre-order Available</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <BadgeComingSoon size={20} className="mr-3 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-900">即将上市</h3>
              <p className="text-sm text-yellow-700">Coming Soon</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-red-50 rounded-lg">
            <BadgeOutOfStock size={20} className="mr-3 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">暂时缺货</h3>
              <p className="text-sm text-red-700">Out of Stock</p>
            </div>
          </div>
        </div>
      </section>

      {/* 支付相关 */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">支付功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">部分付款</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CreditCard size={18} className="mr-3 text-gray-600" />
                <span>定金支付</span>
              </div>
              <span className="font-semibold">¥299</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Wallet size={18} className="mr-3 text-gray-600" />
                <span>余款支付</span>
              </div>
              <span className="font-semibold">¥1,200</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">订单记录</h3>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <Receipt size={18} className="mr-3 text-green-600" />
              <div>
                <p className="font-medium text-green-900">支付成功</p>
                <p className="text-sm text-green-700">订单 #PO-2024-001</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 通知系统 */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">通知系统</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 border-l-4 border-blue-400 bg-blue-50">
            <NotificationBell size={18} className="mr-3 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">补货提醒</p>
              <p className="text-sm text-blue-700">您关注的商品已补货，快来抢购吧！</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 border-l-4 border-green-400 bg-green-50">
            <EmailNotification size={18} className="mr-3 text-green-600" />
            <div>
              <p className="font-medium text-green-900">邮件通知</p>
              <p className="text-sm text-green-700">预售确认邮件已发送到您的邮箱</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 border-l-4 border-purple-400 bg-purple-50">
            <MessageChat size={18} className="mr-3 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">客服消息</p>
              <p className="text-sm text-purple-700">关于您的预售订单，客服为您解答</p>
            </div>
          </div>
        </div>
      </section>

      {/* 状态反馈 */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">状态反馈</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckSuccess size={32} className="mx-auto mb-2 text-green-600" />
            <h3 className="font-medium text-green-900">预售成功</h3>
            <p className="text-sm text-green-700">订单已确认</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <WarningAlert size={32} className="mx-auto mb-2 text-yellow-600" />
            <h3 className="font-medium text-yellow-900">库存不足</h3>
            <p className="text-sm text-yellow-700">仅剩5件商品</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <ErrorCross size={32} className="mx-auto mb-2 text-red-600" />
            <h3 className="font-medium text-red-900">支付失败</h3>
            <p className="text-sm text-red-700">请重试支付</p>
          </div>
        </div>
      </section>

      {/* 时间管理 */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">时间管理</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <CountdownTimer size={24} className="mr-4 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">预售倒计时</h3>
                <p className="text-2xl font-bold text-blue-800">23:59:45</p>
                <p className="text-sm text-blue-700">距离预售结束</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <ClockTime size={20} className="mr-3 text-gray-600" />
              <div>
                <p className="font-medium">预售时间</p>
                <p className="text-sm text-gray-600">09:00 - 21:00</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CalendarDate size={20} className="mr-3 text-green-600" />
              <div>
                <p className="font-medium text-green-900">预计发货</p>
                <p className="text-sm text-green-700">2024年10月15日</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
              <Truck size={20} className="mr-3 text-indigo-600" />
              <div>
                <p className="font-medium text-indigo-900">物流状态</p>
                <p className="text-sm text-indigo-700">准备发货中</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 商品展示 */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">商品展示</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <ProductBox size={20} className="text-gray-600" />
              <BadgePreorder size={16} className="text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">iPhone 16 Pro</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PriceTag size={16} className="mr-1 text-gray-500" />
                <span className="font-semibold">¥8,999</span>
              </div>
              <button className="btn-primary text-sm">
                <ShoppingCartPreorder size={14} className="mr-1" />
                预订
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <ProductBox size={20} className="text-gray-600" />
              <BadgeComingSoon size={16} className="text-yellow-600" />
            </div>
            <h3 className="font-medium mb-2">MacBook Pro M4</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PriceTag size={16} className="mr-1 text-gray-500" />
                <span className="font-semibold">¥14,999</span>
              </div>
              <button className="btn-secondary text-sm">
                <NotificationBell size={14} className="mr-1" />
                提醒我
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow opacity-60">
            <div className="flex items-center justify-between mb-3">
              <ProductBox size={20} className="text-gray-600" />
              <BadgeOutOfStock size={16} className="text-red-600" />
            </div>
            <h3 className="font-medium mb-2">AirPods Pro 3</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PriceTag size={16} className="mr-1 text-gray-500" />
                <span className="font-semibold">¥1,899</span>
              </div>
              <button className="btn-secondary text-sm" disabled>
                <ErrorCross size={14} className="mr-1" />
                缺货
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 使用代码示例 */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">代码示例</h2>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
{`// 导入图标
import { 
  ShoppingCartPreorder, 
  BadgePreorder, 
  CheckSuccess 
} from '@/components/icons';

// 使用示例
<button className="btn-primary">
  <ShoppingCartPreorder size={16} className="mr-2" />
  立即预订
</button>

<div className="flex items-center">
  <BadgePreorder size={20} className="mr-2 text-blue-600" />
  <span>预售商品</span>
</div>

<CheckSuccess 
  size={24} 
  color="#10b981" 
  className="text-green-500" 
/>`}
          </pre>
        </div>
      </section>
    </div>
  );
}
