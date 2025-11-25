import { useState, useEffect } from 'react'

export default function FrontendSettingsPage() {
    const [shop, setShop] = useState('')
    const [settings, setSettings] = useState<any>(null)
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
        setLoading(true)
        try {
            const res = await fetch(`/api/frontend/settings?shop=${shopDomain}`)
            const data = await res.json()
            setSettings(data.settings || {})
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            const res = await fetch(`/api/frontend/settings?shop=${shop}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            if (res.ok) {
                alert('Settings saved!')
            }
        } catch (error) {
            console.error('Failed to save:', error)
            alert('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading || !settings) return <div className="loading">Loading...</div>

    return (
        <div className="container">
            <header>
                <h1>Frontend Widget Settings</h1>
                <button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </header>

            <div className="sections">
                {/* Button Style */}
                <section className="section">
                    <h2>🎨 Button Style</h2>

                    <div className="grid">
                        <div className="field">
                            <label>Button Color</label>
                            <input
                                type="color"
                                value={settings.button_color || '#4299e1'}
                                onChange={(e) => setSettings({ ...settings, button_color: e.target.value })}
                            />
                        </div>

                        <div className="field">
                            <label>Text Color</label>
                            <input
                                type="color"
                                value={settings.button_text_color || '#ffffff'}
                                onChange={(e) => setSettings({ ...settings, button_text_color: e.target.value })}
                            />
                        </div>

                        <div className="field">
                            <label>Hover Color</label>
                            <input
                                type="color"
                                value={settings.button_hover_color || '#3182ce'}
                                onChange={(e) => setSettings({ ...settings, button_hover_color: e.target.value })}
                            />
                        </div>

                        <div className="field">
                            <label>Border Radius (px)</label>
                            <input
                                type="number"
                                value={settings.button_border_radius || 6}
                                onChange={(e) => setSettings({ ...settings, button_border_radius: parseInt(e.target.value) })}
                                min="0"
                                max="50"
                            />
                        </div>

                        <div className="field">
                            <label>Font Size (px)</label>
                            <input
                                type="number"
                                value={settings.button_font_size || 14}
                                onChange={(e) => setSettings({ ...settings, button_font_size: parseInt(e.target.value) })}
                                min="10"
                                max="24"
                            />
                        </div>
                    </div>

                    <div className="preview">
                        <strong>Preview:</strong>
                        <button
                            style={{
                                backgroundColor: settings.button_color,
                                color: settings.button_text_color,
                                borderRadius: `${settings.button_border_radius}px`,
                                fontSize: `${settings.button_font_size}px`,
                                padding: settings.button_padding || '12px 24px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                            }}
                        >
                            Pre-Order Now
                        </button>
                    </div>
                </section>

                {/* Badge Style */}
                <section className="section">
                    <h2>🏷️ Badge Style</h2>

                    <div className="grid">
                        <div className="field">
                            <label>Badge Color</label>
                            <input
                                type="color"
                                value={settings.badge_color || '#2563eb'}
                                onChange={(e) => setSettings({ ...settings, badge_color: e.target.value })}
                            />
                        </div>

                        <div className="field">
                            <label>Text Color</label>
                            <input
                                type="color"
                                value={settings.badge_text_color || '#ffffff'}
                                onChange={(e) => setSettings({ ...settings, badge_text_color: e.target.value })}
                            />
                        </div>

                        <div className="field">
                            <label>Position</label>
                            <select
                                value={settings.badge_position || 'top-left'}
                                onChange={(e) => setSettings({ ...settings, badge_position: e.target.value })}
                            >
                                <option value="top-left">Top Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="bottom-right">Bottom Right</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Display Options */}
                <section className="section">
                    <h2>👁️ Display Options</h2>

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={settings.show_preorder_badge || true}
                            onChange={(e) => setSettings({ ...settings, show_preorder_badge: e.target.checked })}
                        />
                        <span>Show Pre-order Badge</span>
                    </label>

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={settings.show_shipping_date || true}
                            onChange={(e) => setSettings({ ...settings, show_shipping_date: e.target.checked })}
                        />
                        <span>Show Expected Shipping Date</span>
                    </label>

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={settings.show_countdown || false}
                            onChange={(e) => setSettings({ ...settings, show_countdown: e.target.checked })}
                        />
                        <span>Show Countdown Timer</span>
                    </label>

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={settings.show_sold_count || false}
                            onChange={(e) => setSettings({ ...settings, show_sold_count: e.target.checked })}
                        />
                        <span>Show Pre-ordered Count</span>
                    </label>
                </section>

                {/* Text Templates */}
                <section className="section">
                    <h2>📝 Text Templates</h2>

                    <div className="field">
                        <label>Pre-order Message</label>
                        <input
                            type="text"
                            value={settings.preorder_message_template || 'Expected to ship {date}'}
                            onChange={(e) => setSettings({ ...settings, preorder_message_template: e.target.value })}
                            placeholder="Expected to ship {date}"
                        />
                        <span className="hint">Use {'{date}'} as placeholder</span>
                    </div>
                </section>
            </div>

            <style jsx>{`
        .container { max-width: 1000px; margin: 0 auto; padding: 24px; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { color: #1a202c; }
        button { padding: 12px 24px; background: #4299e1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .sections { display: flex; flex-direction: column; gap: 24px; }
        .section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
        .section h2 { color: #2d3748; margin-bottom: 20px; font-size: 18px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .field label { display: block; color: #4a5568; font-weight: 500; margin-bottom: 8px; }
        .field input, .field select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e0; border-radius: 6px; }
        .hint { display: block; color: #a0aec0; font-size: 12px; margin-top: 4px; }
        .preview { background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .preview strong { display: block; margin-bottom: 16px; color: #2d3748; }
        .checkbox { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; cursor: pointer; }
        .checkbox input { width: 20px; height: 20px; }
        .checkbox span { color: #2d3748; font-weight: 500; }
      `}</style>
        </div>
    )
}
