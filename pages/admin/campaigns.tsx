import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CampaignsPage() {
    const router = useRouter()
    const { shop } = router.query
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        if (shop) {
            loadCampaigns()
        }
    }, [shop])

    async function loadCampaigns() {
        try {
            setLoading(true)
            const response = await fetch(`/api/campaigns?shop=${shop}`)
            const data = await response.json()
            if (data.success) {
                setCampaigns(data.campaigns)
            }
        } catch (error) {
            console.error('Failed to load campaigns:', error)
        } finally {
            setLoading(false)
        }
    }

    async function createCampaign(campaignData) {
        try {
            const response = await fetch(`/api/campaigns?shop=${shop}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignData)
            })
            const data = await response.json()
            if (data.success) {
                await loadCampaigns()
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Failed to create campaign:', error)
            alert('Failed to create campaign')
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>
                        Pre-Order Campaigns
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                        Manage pre-order campaigns with different payment modes
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    + Create Campaign
                </button>
            </div>

            {/* Campaigns Grid */}
            {campaigns.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #e5e7eb'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                        No Campaigns Yet
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                        Create your first pre-order campaign to start using Pay Later features
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {campaigns.map(campaign => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onEdit={() => router.push(`/admin/campaigns/${campaign.id}?shop=${shop}`)}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateCampaignModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createCampaign}
                />
            )}
        </div>
    )
}

function CampaignCard({ campaign, onEdit }) {
    const modeLabels = {
        immediate: { text: 'Immediate Pay', color: '#10b981', bg: '#d1fae5' },
        pay_later: { text: 'Pay Later', color: '#3b82f6', bg: '#dbeafe' },
        deposit: { text: 'Deposit Mode', color: '#f59e0b', bg: '#fef3c7' }
    }

    const mode = modeLabels[campaign.payment_mode] || modeLabels.immediate

    return (
        <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            ':hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
        }}
            onClick={onEdit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                        {campaign.name}
                    </h3>
                    <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: mode.color,
                        background: mode.bg
                    }}>
                        {mode.text}
                    </span>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: campaign.enabled ? '#d1fae5' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                }}>
                    {campaign.enabled ? '✅' : '⏸️'}
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '16px 0',
                borderTop: '1px solid #f3f4f6'
            }}>
                <Stat label="Products" value={campaign.stats?.product_count || 0} />
                <Stat label="Orders" value={campaign.stats?.total_orders || 0} />
                <Stat label="Pending" value={campaign.stats?.pending_payments || 0} color="#ef4444" />
            </div>

            {campaign.payment_mode === 'pay_later' && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                    🕐 Auto-cancel in {campaign.auto_cancel_days} days
                    {campaign.send_payment_reminder && ` · 📧 Auto-reminder`}
                </div>
            )}
        </div>
    )
}

function Stat({ label, value, color = '#111' }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{label}</div>
        </div>
    )
}

function CreateCampaignModal({ onClose, onCreate }) {
    const [formData, setFormData] = useState({
        name: '',
        payment_mode: 'pay_later',
        auto_cancel_days: 7,
        lock_inventory: true,
        send_payment_reminder: true,
        reminder_days_before_cancel: 2,
        enabled: true
    })

    function handleSubmit(e) {
        e.preventDefault()
        if (!formData.name) {
            alert('Please enter campaign name')
            return
        }
        onCreate(formData)
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}
            onClick={onClose}>
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
                onClick={e => e.stopPropagation()}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '600' }}>
                    Create New Campaign
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Campaign Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., High-value Electronics Pre-order"
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Payment Mode
                        </label>
                        <select
                            value={formData.payment_mode}
                            onChange={e => setFormData({ ...formData, payment_mode: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '15px'
                            }}>
                            <option value="immediate">Immediate Pay</option>
                            <option value="pay_later">Pay Later</option>
                        </select>
                    </div>

                    {formData.payment_mode === 'pay_later' && (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Auto-cancel after: {formData.auto_cancel_days} days
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={formData.auto_cancel_days}
                                    onChange={e => setFormData({ ...formData, auto_cancel_days: parseInt(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.lock_inventory}
                                        onChange={e => setFormData({ ...formData, lock_inventory: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span>Lock inventory</span>
                                </label>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.send_payment_reminder}
                                        onChange={e => setFormData({ ...formData, send_payment_reminder: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span>Send payment reminders</span>
                                </label>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500'
                            }}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: '8px',
                                background: '#2563eb',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500'
                            }}>
                            Create Campaign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
