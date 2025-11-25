import { useState, useEffect } from 'react'

interface Settings {
    auto_preorder_enabled: boolean
    auto_threshold: number
    auto_restore_on_restock: boolean
    allow_batch_operations: boolean
    default_estimated_shipping_days: number
    default_preorder_message: string
}

export default function SettingsPage() {
    const [shop, setShop] = useState('')
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const shopParam = new URLSearchParams(window.location.search).get('shop')
        if (shopParam) {
            setShop(shopParam)
            loadSettings(shopParam)
        }
    }, [])

    async function loadSettings(shopDomain: string) {
        try {
            setLoading(true)
            const response = await fetch(`/api/settings/preorder?shop=${shopDomain}`)
            const data = await response.json()
            setSettings(data.settings)
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoading(false)
        }
    }

    async function saveSettings() {
        if (!settings) return

        try {
            setSaving(true)
            const response = await fetch(`/api/settings/preorder?shop=${shop}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                alert('设置已保存！')
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('保存失败，请重试')
        } finally {
            setSaving(false)
        }
    }

    if (loading || !settings) {
        return <div className="loading">加载中...</div>
    }

    return (
        <div className="container">
            <header>
                <h1>PreOrder Pro - 全局设置</h1>
                <p className="subtitle">配置预购规则</p>
            </header>

            <div className="settings-grid">
                {/* 自动预购设置 */}
                <div className="settings-card">
                    <h2>🤖 自动预购模式</h2>
                    <p className="description">
                        当商品库存低于阈值时，自动启用预购功能
                    </p>

                    <div className="setting-row">
                        <label className="switch-label">
                            <input
                                type="checkbox"
                                checked={settings.auto_preorder_enabled}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    auto_preorder_enabled: e.target.checked
                                })}
                            />
                            <span className="switch"></span>
                            启用自动预购
                        </label>
                    </div>

                    {settings.auto_preorder_enabled && (
                        <>
                            <div className="setting-row">
                                <label>库存阈值</label>
                                <input
                                    type="number"
                                    value={settings.auto_threshold}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        auto_threshold: parseInt(e.target.value) || 0
                                    })}
                                    min="0"
                                    className="input-number"
                                />
                                <span className="hint">库存 ≤ 此值时启用预购（通常设为 0）</span>
                            </div>

                            <div className="setting-row">
                                <label className="switch-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.auto_restore_on_restock}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            auto_restore_on_restock: e.target.checked
                                        })}
                                    />
                                    <span className="switch"></span>
                                    补货时自动关闭预购
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* 批量操作设置 */}
                <div className="settings-card">
                    <h2>📦 批量操作</h2>
                    <p className="description">
                        允许一次性为多个商品启用/禁用预购
                    </p>

                    <div className="setting-row">
                        <label className="switch-label">
                            <input
                                type="checkbox"
                                checked={settings.allow_batch_operations}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    allow_batch_operations: e.target.checked
                                })}
                            />
                            <span className="switch"></span>
                            允许批量操作
                        </label>
                    </div>
                </div>

                {/* 默认配置 */}
                <div className="settings-card">
                    <h2>⚙️ 默认配置</h2>
                    <p className="description">
                        新启用预购时的默认设置
                    </p>

                    <div className="setting-row">
                        <label>预计发货天数</label>
                        <input
                            type="number"
                            value={settings.default_estimated_shipping_days}
                            onChange={(e) => setSettings({
                                ...settings,
                                default_estimated_shipping_days: parseInt(e.target.value) || 30
                            })}
                            min="1"
                            className="input-number"
                        />
                        <span className="hint">默认预计 X 天后发货</span>
                    </div>

                    <div className="setting-row">
                        <label>预购提示文本</label>
                        <textarea
                            value={settings.default_preorder_message}
                            onChange={(e) => setSettings({
                                ...settings,
                                default_preorder_message: e.target.value
                            })}
                            rows={3}
                            className="textarea"
                            placeholder="This item is available for pre-order..."
                        />
                        <span className="hint">使用 {'{days}'} 作为天数占位符</span>
                    </div>
                </div>
            </div>

            <div className="actions">
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="btn-primary"
                >
                    {saving ? '保存中...' : '保存设置'}
                </button>
            </div>

            <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px;
        }

        header {
          margin-bottom: 32px;
        }

        h1 {
          color: #1a202c;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #718096;
        }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
        }

        .settings-card h2 {
          color: #2d3748;
          margin-bottom: 8px;
          font-size: 18px;
        }

        .description {
          color: #718096;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .setting-row {
          margin-bottom: 20px;
        }

        .setting-row:last-child {
          margin-bottom: 0;
        }

        .setting-row > label {
          display: block;
          color: #4a5568;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .switch-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: #2d3748 !important;
        }

        .switch-label input[type="checkbox"] {
          display: none;
        }

        .switch {
          position: relative;
          width: 48px;
          height: 24px;
          background: #cbd5e0;
          border-radius: 12px;
          transition: background 0.3s;
        }

        .switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .switch-label input:checked + .switch {
          background: #48bb78;
        }

        .switch-label input:checked + .switch::after {
          transform: translateX(24px);
        }

        .input-number {
          width: 120px;
          padding: 8px 12px;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .hint {
          display: block;
          color: #a0aec0;
          font-size: 12px;
          margin-top: 4px;
        }

        .actions {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
        }

        .btn-primary {
          padding: 12px 32px;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #3182ce;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          font-size: 18px;
          color: #718096;
        }
      `}</style>
        </div>
    )
}
