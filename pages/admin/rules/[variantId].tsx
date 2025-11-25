import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function RuleEditorPage() {
    const router = useRouter()
    const { variantId, shop } = router.query

    const [rule, setRule] = useState<any>({
        manual_preorder: false,
        auto_preorder: false,
        auto_threshold: 0,
        button_text: 'Pre-Order Now',
        badge_text: 'Pre-Order',
        note_to_customer: '',
        expected_ship_date: '',
        allow_when_in_stock: false,
        preorder_limit: null,
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (shop && variantId) {
            loadRule()
        }
    }, [shop, variantId])

    async function loadRule() {
        setLoading(true)
        try {
            const res = await fetch(`/api/rules/${variantId}?shop=${shop}`)
            if (res.ok) {
                const data = await res.json()
                setRule(data.rule)
            }
        } catch (error) {
            console.error('Failed to load rule:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            const res = await fetch(`/api/rules/${variantId}?shop=${shop}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variant_id: variantId,
                    ...rule,
                }),
            })

            if (res.ok) {
                alert('Rule saved successfully!')
                router.push(`/admin/products?shop=${shop}`)
            }
        } catch (error) {
            console.error('Failed to save:', error)
            alert('Failed to save rule')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div className="container">
            <header>
                <h1>Edit Pre-order Rule</h1>
                <div className="actions">
                    <button onClick={() => router.back()} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save Rule'}
                    </button>
                </div>
            </header>

            <div className="form-sections">
                {/* Basic Settings */}
                <section className="form-section">
                    <h2>🎯 Pre-order Mode</h2>

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={rule.manual_preorder}
                            onChange={(e) => setRule({ ...rule, manual_preorder: e.target.checked })}
                        />
                        <span>Enable Manual Pre-order</span>
                    </label>

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={rule.auto_preorder}
                            onChange={(e) => setRule({ ...rule, auto_preorder: e.target.checked })}
                        />
                        <span>Enable Auto Pre-order (when out of stock)</span>
                    </label>

                    {rule.auto_preorder && (
                        <div className="field">
                            <label>Stock Threshold</label>
                            <input
                                type="number"
                                value={rule.auto_threshold}
                                onChange={(e) => setRule({ ...rule, auto_threshold: parseInt(e.target.value) })}
                                min="0"
                            />
                            <span className="hint">Auto-enable when stock ≤ this value</span>
                        </div>
                    )}
                </section>

                {/* Text Customization */}
                <section className="form-section">
                    <h2>✏️ Text Customization</h2>

                    <div className="field">
                        <label>Button Text</label>
                        <input
                            type="text"
                            value={rule.button_text}
                            onChange={(e) => setRule({ ...rule, button_text: e.target.value })}
                            placeholder="Pre-Order Now"
                        />
                    </div>

                    <div className="field">
                        <label>Badge Text</label>
                        <input
                            type="text"
                            value={rule.badge_text}
                            onChange={(e) => setRule({ ...rule, badge_text: e.target.value })}
                            placeholder="Pre-Order"
                        />
                    </div>

                    <div className="field">
                        <label>Note to Customer</label>
                        <textarea
                            value={rule.note_to_customer || ''}
                            onChange={(e) => setRule({ ...rule, note_to_customer: e.target.value })}
                            rows={3}
                            placeholder="Additional information for customers..."
                        />
                    </div>
                </section>

                {/* Business Rules */}
                <section className="form-section">
                    <h2>📦 Business Rules</h2>

                    <div className="field">
                        <label>Expected Ship Date</label>
                        <input
                            type="date"
                            value={rule.expected_ship_date || ''}
                            onChange={(e) => setRule({ ...rule, expected_ship_date: e.target.value })}
                        />
                    </div>

                    <div className="field">
                        <label>Pre-order Limit</label>
                        <input
                            type="number"
                            value={rule.preorder_limit || ''}
                            onChange={(e) => setRule({ ...rule, preorder_limit: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="Unlimited"
                            min="1"
                        />
                        <span className="hint">Maximum number of pre-orders (leave empty for unlimited)</span>
                    </div>

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={rule.allow_when_in_stock}
                            onChange={(e) => setRule({ ...rule, allow_when_in_stock: e.target.checked })}
                        />
                        <span>Allow pre-order even when in stock</span>
                    </label>
                </section>
            </div>

            <style jsx>{`
        .container { max-width: 800px; margin: 0 auto; padding: 24px; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { color: #1a202c; margin: 0; }
        .actions { display: flex; gap: 12px; }
        button { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .btn-primary { background: #4299e1; color: white; }
        .btn-secondary { background: #e2e8f0; color: #2d3748; }
        .form-sections { display: flex; flex-direction: column; gap: 24px; }
        .form-section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
        .form-section h2 { color: #2d3748; margin-bottom: 20px; font-size: 18px; }
        .field { margin-bottom: 20px; }
        .field label { display: block; color: #4a5568; font-weight: 500; margin-bottom: 8px; }
        .field input, .field textarea { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 14px; }
        .field textarea { resize: vertical; font-family: inherit; }
        .hint { display: block; color: #a0aec0; font-size: 12px; margin-top: 4px; }
        .checkbox-label { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; cursor: pointer; }
        .checkbox-label input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; }
        .checkbox-label span { color: #2d3748; font-weight: 500; }
      `}</style>
        </div>
    )
}
