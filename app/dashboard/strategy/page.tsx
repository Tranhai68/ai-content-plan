'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'

const FUNNEL_COLORS: Record<string, { label: string; color: string; icon: string }> = {
    awareness: { label: 'Nhận biết', color: '#3b82f6', icon: '👁️' },
    consideration: { label: 'Cân nhắc', color: '#f59e0b', icon: '🤔' },
    conversion: { label: 'Chuyển đổi', color: '#ef4444', icon: '🎯' },
    loyalty: { label: 'Trung thành', color: '#10b981', icon: '💚' },
    advocacy: { label: 'Lan tỏa', color: '#8b5cf6', icon: '📣' },
}

export default function StrategyPage() {
    const [workspaceId, setWorkspaceId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [funnel, setFunnel] = useState({
        awareness: 40,
        consideration: 30,
        conversion: 15,
        loyalty: 10,
        advocacy: 5,
    })

    const [campaigns, setCampaigns] = useState<Array<{
        id: string; name: string; startDate: string; endDate: string; status: string
    }>>([])
    const [showCampaignForm, setShowCampaignForm] = useState(false)
    const [campaignName, setCampaignName] = useState('')
    const [campaignStart, setCampaignStart] = useState('')
    const [campaignEnd, setCampaignEnd] = useState('')
    const [creatingCampaign, setCreatingCampaign] = useState(false)

    useEffect(() => {
        // Get default workspace and load data
        fetch('/api/workspace/default').then(r => r.json()).then(ws => {
            if (ws.id) {
                setWorkspaceId(ws.id)
                // Load funnel config
                fetch(`/api/workspace/${ws.id}/funnel`).then(r => r.json()).then(data => {
                    if (data.awareness !== undefined) {
                        setFunnel({
                            awareness: data.awareness,
                            consideration: data.consideration,
                            conversion: data.conversion,
                            loyalty: data.loyalty,
                            advocacy: data.advocacy,
                        })
                    }
                })
                // Load campaigns
                fetch(`/api/workspace/${ws.id}/campaigns`).then(r => r.json()).then(data => {
                    if (Array.isArray(data)) setCampaigns(data)
                })
            }
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const total = Object.values(funnel).reduce((a, b) => a + b, 0)

    const updateFunnel = (key: keyof typeof funnel, value: number) => {
        setFunnel(prev => ({ ...prev, [key]: value }))
        setSaved(false)
    }

    const handleSaveFunnel = async () => {
        if (!workspaceId) return
        setSaving(true)
        try {
            await fetch(`/api/workspace/${workspaceId}/funnel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funnel),
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) { console.error(e) } finally {
            setSaving(false)
        }
    }

    const handleCreateCampaign = async () => {
        if (!workspaceId || !campaignName.trim() || !campaignStart || !campaignEnd) return
        setCreatingCampaign(true)
        try {
            await fetch(`/api/workspace/${workspaceId}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: campaignName, startDate: campaignStart, endDate: campaignEnd }),
            })
            // Reload campaigns
            const res = await fetch(`/api/workspace/${workspaceId}/campaigns`)
            const data = await res.json()
            if (Array.isArray(data)) setCampaigns(data)
            setCampaignName('')
            setCampaignStart('')
            setCampaignEnd('')
            setShowCampaignForm(false)
        } catch (e) { console.error(e) } finally {
            setCreatingCampaign(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading">Chiến lược Marketing</h1>
                    <p className="text-muted-foreground text-sm mt-1">Cấu hình phễu marketing 5 tầng</p>
                </div>
                <button onClick={handleSaveFunnel} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            gradient-brand text-white hover:opacity-90 transition-all disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saved ? '✅ Đã lưu!' : 'Lưu cấu hình'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funnel Config */}
                <div className="p-6 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-lg mb-1">Phễu Marketing 5 Tầng</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Tổng: {total}% {total !== 100 && <span className="text-amber-500">(nên bằng 100%)</span>}
                    </p>

                    <div className="space-y-5">
                        {Object.entries(FUNNEL_COLORS).map(([key, meta]) => (
                            <div key={key}>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="font-medium">{meta.icon} {meta.label}</span>
                                    <span className="font-bold" style={{ color: meta.color }}>
                                        {funnel[key as keyof typeof funnel]}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={funnel[key as keyof typeof funnel]}
                                    onChange={(e) => updateFunnel(key as keyof typeof funnel, parseInt(e.target.value))}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${meta.color} 0%, ${meta.color} ${funnel[key as keyof typeof funnel]}%, hsl(var(--muted)) ${funnel[key as keyof typeof funnel]}%, hsl(var(--muted)) 100%)`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Funnel Visual */}
                <div className="p-6 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-lg mb-6">Phễu phân bổ</h2>
                    <div className="flex flex-col items-center gap-2">
                        {Object.entries(FUNNEL_COLORS).map(([key, meta], i) => {
                            const val = funnel[key as keyof typeof funnel]
                            const widthPct = 100 - (i * 15)

                            return (
                                <div key={key}
                                    className="relative flex items-center justify-center py-3 rounded-lg text-white font-medium text-sm
                    transition-all hover:opacity-90"
                                    style={{
                                        backgroundColor: meta.color,
                                        width: `${widthPct}%`,
                                        opacity: val > 0 ? 1 : 0.3,
                                    }}>
                                    {meta.icon} {meta.label}: {val}%
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Campaigns */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-lg">Chiến dịch Marketing</h2>
                    <button onClick={() => setShowCampaignForm(!showCampaignForm)}
                        className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-brand-red-dark transition-colors">
                        + Thêm chiến dịch
                    </button>
                </div>

                {showCampaignForm && (
                    <div className="p-4 mb-4 rounded-lg border border-border bg-muted/30 animate-scale-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input type="text" placeholder="Tên chiến dịch" value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                            <input type="date" value={campaignStart} onChange={(e) => setCampaignStart(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                            <input type="date" value={campaignEnd} onChange={(e) => setCampaignEnd(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={handleCreateCampaign} disabled={creatingCampaign}
                                className="px-3 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground disabled:opacity-50">
                                {creatingCampaign ? 'Đang tạo...' : 'Tạo'}
                            </button>
                            <button onClick={() => setShowCampaignForm(false)}
                                className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}

                {campaigns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có chiến dịch nào</p>
                ) : (
                    <div className="space-y-2">
                        {campaigns.map(c => (
                            <div key={c.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                <div>
                                    <p className="font-medium text-sm">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(c.startDate).toLocaleDateString('vi-VN')} — {new Date(c.endDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                                    {c.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
