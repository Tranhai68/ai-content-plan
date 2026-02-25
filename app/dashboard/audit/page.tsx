'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react'
import { FUNNEL_STAGES } from '@/lib/utils'

interface Stats {
    totalContent: number
    published: number
    drafts: number
    pending: number
    scheduled: number
    funnelDistribution: Array<{ funnelStage: string; _count: number }>
}

export default function AuditPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [funnelTarget, setFunnelTarget] = useState({
        AWARENESS: 40, CONSIDERATION: 30, CONVERSION: 15, LOYALTY: 10, ADVOCACY: 5,
    })

    useEffect(() => {
        // Load stats
        fetch('/api/dashboard/stats').then(r => r.json()).then(data => {
            setStats(data)
            setLoading(false)
        }).catch(() => setLoading(false))

        // Load funnel target
        fetch('/api/workspace/default').then(r => r.json()).then(ws => {
            if (ws.id) {
                fetch(`/api/workspace/${ws.id}/funnel`).then(r => r.json()).then(data => {
                    if (data.awareness !== undefined) {
                        setFunnelTarget({
                            AWARENESS: data.awareness,
                            CONSIDERATION: data.consideration,
                            CONVERSION: data.conversion,
                            LOYALTY: data.loyalty,
                            ADVOCACY: data.advocacy,
                        })
                    }
                })
            }
        }).catch(() => { })
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const s = stats || {
        totalContent: 0, published: 0, drafts: 0, pending: 0, scheduled: 0, funnelDistribution: [],
    }

    const total = s.funnelDistribution.reduce((sum, d) => sum + d._count, 0)

    // Calculate Health Score
    let healthScore = 50 // base
    if (s.totalContent > 0) healthScore += 10
    if (s.published > 0) healthScore += 10
    if (s.totalContent >= 10) healthScore += 10
    if (total > 0) {
        // Check funnel balance
        const diff = Object.entries(funnelTarget).reduce((sum, [key, target]) => {
            const actual = s.funnelDistribution.find(d => d.funnelStage === key)?._count || 0
            const actualPct = total > 0 ? (actual / total) * 100 : 0
            return sum + Math.abs(actualPct - target)
        }, 0)
        if (diff < 30) healthScore += 15
        else if (diff < 50) healthScore += 5
    }
    healthScore = Math.min(healthScore, 100)

    // Alerts
    const alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string }> = []
    if (s.totalContent === 0) {
        alerts.push({ type: 'warning', message: 'Chưa có nội dung nào. Hãy bắt đầu tạo content!' })
    }
    if (s.drafts > 3) {
        alerts.push({ type: 'warning', message: `Có ${s.drafts} bài nháp chưa được duyệt.` })
    }
    if (s.published > 0) {
        alerts.push({ type: 'success', message: `Đã xuất bản ${s.published} bài viết thành công.` })
    }
    if (s.scheduled > 0) {
        alerts.push({ type: 'info', message: `${s.scheduled} bài đã lên lịch chờ đăng.` })
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold font-heading">📊 AI Audit & Analytics</h1>
                <p className="text-muted-foreground text-sm mt-1">Phân tích sức khỏe chiến lược và hiệu quả nội dung</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Score */}
                <div className="p-6 rounded-xl border border-border bg-card text-center">
                    <h2 className="font-heading font-bold text-lg mb-4">Sức khỏe chiến lược</h2>
                    <div className="relative w-36 h-36 mx-auto mb-4">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                            <circle cx="60" cy="60" r="52" fill="none"
                                stroke={healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="12"
                                strokeDasharray={`${(healthScore / 100) * 327} 327`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold font-heading">{healthScore}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium">
                        {healthScore >= 70 ? '🎉 Tốt!' : healthScore >= 40 ? '⚡ Cần cải thiện' : '⚠️ Cần hành động'}
                    </p>
                </div>

                {/* Stats */}
                <div className="p-6 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-lg mb-4">Thống kê nội dung</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold font-heading">{s.totalContent}</p>
                            <p className="text-xs text-muted-foreground">Tổng bài</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold font-heading text-emerald-500">{s.published}</p>
                            <p className="text-xs text-muted-foreground">Đã đăng</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold font-heading text-amber-500">{s.pending}</p>
                            <p className="text-xs text-muted-foreground">Chờ duyệt</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold font-heading text-blue-500">{s.scheduled}</p>
                            <p className="text-xs text-muted-foreground">Đã lên lịch</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="p-6 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-lg mb-4">Thông báo</h2>
                    {alerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Không có thông báo</p>
                    ) : (
                        <div className="space-y-2">
                            {alerts.map((alert, i) => (
                                <div key={i} className={`flex items-start gap-2 p-3 rounded-lg text-sm ${alert.type === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                        : alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                    {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                        : alert.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            : <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />}
                                    {alert.message}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Funnel Plan vs Actual */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <h2 className="font-heading font-bold text-lg mb-4">📈 Kế hoạch vs Thực tế</h2>
                {total === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có dữ liệu để phân tích</p>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(FUNNEL_STAGES).map(([key, stage]) => {
                            const dist = s.funnelDistribution.find(d => d.funnelStage === key)
                            const actual = dist?._count || 0
                            const actualPct = total > 0 ? Math.round((actual / total) * 100) : 0
                            const target = funnelTarget[key as keyof typeof funnelTarget] || 0

                            return (
                                <div key={key}>
                                    <div className="flex justify-between items-center text-sm mb-1.5">
                                        <span>{stage.icon} {stage.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Kế hoạch: {target}% | Thực tế: {actualPct}% ({actual} bài)
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-4">
                                        <div className="flex-1 rounded-l-full bg-muted overflow-hidden relative">
                                            <div className="h-full rounded-l-full opacity-40 transition-all"
                                                style={{ width: `${target}%`, backgroundColor: stage.color }} />
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                                                KH: {target}%
                                            </span>
                                        </div>
                                        <div className="flex-1 rounded-r-full bg-muted overflow-hidden relative">
                                            <div className="h-full rounded-r-full transition-all"
                                                style={{ width: `${actualPct}%`, backgroundColor: stage.color }} />
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                                                TT: {actualPct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
