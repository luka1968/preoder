import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  BadgeComingSoon, 
  BadgeOutOfStock, 
  BadgePreorder, 
  Calendar, 
  Timer, 
  Truck
} from '../components/icons';
import { 
  HomeIcon,
  CogIcon,
  TagIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const heroIcons = [
  { name: 'HomeIcon', component: HomeIcon },
  { name: 'CogIcon', component: CogIcon },
  { name: 'TagIcon', component: TagIcon },
  { name: 'UserGroupIcon', component: UserGroupIcon },
  { name: 'EnvelopeIcon', component: EnvelopeIcon },
  { name: 'ChartBarIcon', component: ChartBarIcon },
  { name: 'ShoppingCartIcon', component: ShoppingCartIcon },
  { name: 'CurrencyDollarIcon', component: CurrencyDollarIcon },
  { name: 'CheckIcon', component: CheckIcon },
  { name: 'ExclamationTriangleIcon', component: ExclamationTriangleIcon },
  { name: 'EyeIcon', component: EyeIcon },
  { name: 'PencilIcon', component: PencilIcon },
];

const customIcons = [
  { name: 'BadgeComingSoon', component: BadgeComingSoon },
  { name: 'BadgeOutOfStock', component: BadgeOutOfStock },
  { name: 'BadgePreorder', component: BadgePreorder },
  { name: 'Calendar', component: Calendar },
  { name: 'Timer', component: Timer },
  { name: 'Truck', component: Truck },
];

const sizes = [
  { name: 'XS', value: 12 },
  { name: 'SM', value: 16 },
  { name: 'MD', value: 20 },
  { name: 'LG', value: 24 },
  { name: 'XL', value: 32 },
  { name: '2XL', value: 48 },
];

const colors = [
  { name: 'Current', value: 'currentColor' },
  { name: 'Primary', value: '#3b82f6' },
  { name: 'Success', value: '#10b981' },
  { name: 'Warning', value: '#f59e0b' },
  { name: 'Error', value: '#ef4444' },
  { name: 'Gray', value: '#6b7280' },
];

export default function IconShowcase() {
  const [selectedSize, setSelectedSize] = useState(24);
  const [selectedColor, setSelectedColor] = useState('currentColor');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHeroIcons = heroIcons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomIcons = customIcons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const IconCard = ({ name, component: IconComponent, isCustom = false }: {
    name: string;
    component: React.ComponentType<any>;
    isCustom?: boolean;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-lg">
          <IconComponent 
            size={selectedSize} 
            color={selectedColor}
            className="transition-all duration-200"
          />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {isCustom ? 'Custom' : 'Heroicons'}
          </p>
        </div>
        <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
          {selectedSize}px
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Icon Showcase - PreOrder Pro" shop="demo">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">图标展示</h1>
          <p className="text-gray-600">
            查看和测试项目中所有可用的图标组件
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">控制面板</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 搜索 */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                搜索图标
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="输入图标名称..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* 尺寸选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图标尺寸
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.value)}
                    className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                      selectedSize === size.value
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图标颜色
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                      selectedColor === color.value
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 自定义图标 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">自定义图标</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {filteredCustomIcons.length} 个图标
            </span>
          </div>
          
          {filteredCustomIcons.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredCustomIcons.map((icon) => (
                <IconCard
                  key={icon.name}
                  name={icon.name}
                  component={icon.component}
                  isCustom={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">没有找到匹配的自定义图标</p>
            </div>
          )}
        </div>

        {/* Heroicons */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Heroicons</h2>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {filteredHeroIcons.length} 个图标
            </span>
          </div>
          
          {filteredHeroIcons.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredHeroIcons.map((icon) => (
                <IconCard
                  key={icon.name}
                  name={icon.name}
                  component={icon.component}
                  isCustom={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">没有找到匹配的Heroicons图标</p>
            </div>
          )}
        </div>

        {/* 使用示例 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">使用示例</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">导入图标</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                <code>{`import { BadgePreorder, Timer, Calendar } from '@/components/icons';`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">基础使用</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                <code>{`<BadgePreorder size={24} color="#3b82f6" className="mr-2" />`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">在按钮中使用</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                <code>{`<button className="btn-primary">
  <BadgePreorder size={16} className="mr-2" />
  创建预售
</button>`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* 添加图标指南 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            添加新图标
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>1. 访问 <a href="https://www.iconfont.cn/" target="_blank" rel="noopener noreferrer" className="underline">iconfont.cn</a> 下载SVG图标</p>
            <p>2. 将SVG文件放入 <code className="bg-blue-100 px-1 rounded">public/icons/</code> 目录</p>
            <p>3. 运行 <code className="bg-blue-100 px-1 rounded">node scripts/icon-integration.js process</code></p>
            <p>4. 新图标组件将自动生成在 <code className="bg-blue-100 px-1 rounded">components/icons/</code> 目录</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
