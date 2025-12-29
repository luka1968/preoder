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
        alert('Settings saved!')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings, please try again')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="container">
      <header>
        <h1>PreOrder Pro - Global Settings</h1>
        <p className="subtitle">Configure pre-order rules</p>
      </header>

      <div className="settings-grid">
        {/* 自动预购设置 */}
        <div className="settings-card">
          <h2>🤖 Auto Pre-order Mode</h2>
          <p className="description">
            Automatically enable pre-order when product inventory falls below threshold
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
              Enable Auto Pre-order
            </label>
          </div>

          {settings.auto_preorder_enabled && (
            <>
              <div className="setting-row">
                <label>Inventory Threshold</label>
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
                <span className="hint">Enable pre-order when inventory ≤ this value (usually set to 0)</span>
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
                  Auto-disable pre-order when restocked
                </label>
              </div>
            </>
          )}
        </div>

        {/* 批量操作设置 */}
        <div className="settings-card">
          <h2>📦 Batch Operations</h2>
          <p className="description">
            Allow enabling/disabling pre-order for multiple products at once
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
              Allow Batch Operations
            </label>
          </div>
        </div>

        {/* 默认配置 */}
        <div className="settings-card">
          <h2>⚙️ Default Configuration</h2>
          <p className="description">
            Default settings when enabling pre-order
          </p>

          <div className="setting-row">
            <label>Estimated Shipping Days</label>
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
            <span className="hint">Default estimated shipping in X days</span>
          </div>

          <div className="setting-row">
            <label>Pre-order Message</label>
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
            <span className="hint">Use {'{days}'} as a placeholder for days</span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Settings'}
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
