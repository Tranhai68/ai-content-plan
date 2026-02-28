'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, Calendar } from 'lucide-react'

interface ReportData {
    total: number
    funnelCounts: Record<string, number>
    funnelPercentages: Record<string, number>
    formatCounts: Record<string, number>
    statusCounts: Record<string, number>
    topicCounts: Record<string, number>
    tofu: { count: number; percentage: number }
    mofu: { count: number; percentage: number }
    bofu: { count: number; percentage: number }
}

const FORMAT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    IMAGE_POST: { label: 'Post', icon: '📝', color: '#3b82f6' },
    VIDEO: { label: 'Video', icon: '🎬', color: '#8b5cf6' },
    CAROUSEL: { label: 'Carousel', icon: '🎠', color: '#ec4899' },
    TEXT_ONLY: { label: 'Text', icon: '📄', color: '#6b7280' },
    STORY: { label: 'Story', icon: '📱', color: '#14b8a6' },
    REEL: { label: 'Reel', icon: '🎵', color: '#a855f7' },
    TIKTOK: { label: 'TikTok', icon: '🎵', color: '#000' },
    SALE: { label: 'Sale', icon: '🏷️', color: '#dc2626' },
    LIVE_STREAM: { label: 'Livestream', icon: '📡', color: '#ef4444' },
    IMAGE: { label: 'Image', icon: '🖼️', color: '#10b981' },
    POLL: { label: 'Poll', icon: '📊', color: '#6366f1' },
    MEME: { label: 'Meme', icon: '😂', color: '#f59e0b' },
}

const TOPIC_COLORS: Record<string, string> = {
    'Inspiring (Truyền cảm hứng)': '#3b82f6',
    'Promotional (Khuyến mãi)': '#ef4444',
    'Trust Building (Xây dựng lòng tin)': '#f59e0b',
    'Other': '#6b7280',
}

const FUNNEL_VISUAL = [
    { key: 'AWARENESS', label: 'Nhận biết', color: '#f59e0b', width: '100%' },
    { key: 'CONSIDERATION', label: 'Cân nhắc', color: '#ef4444', width: '80%' },
    { key: 'CONVERSION', label: 'Chuyển đổi', color: '#ec4899', width: '60%' },
    { key: 'LOYALTY', label: 'Trung thành', color: '#8b5cf6', width: '40%' },
    { key: 'ADVOCACY', label: 'Lan tỏa', color: '#6366f1', width: '25%' },
]

export default function ReportPage() {
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const now = new Date()
    const [reportMonth] = useState(`Tháng ${now.getMonth() + 1} - ${now.getFullYear()}`)

    useEffect(() => {
        fetch('/api/dashboard/report')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const d = data || {
        total: 0, funnelCounts: {}, funnelPercentages: {},
        formatCounts: {}, statusCounts: { DRAFT: 0, PENDING_REVIEW: 0, APPROVED: 0, SCHEDULED: 0, PUBLISHED: 0 },
        topicCounts: {}, tofu: { count: 0, percentage: 0 }, mofu: { count: 0, percentage: 0 }, bofu: { count: 0, percentage: 0 },
    }

    const published = d.statusCounts['PUBLISHED'] || 0
    const inProgress = (d.statusCounts['DRAFT'] || 0) + (d.statusCounts['PENDING_REVIEW'] || 0)
    const notStarted = d.total - published - inProgress
    const maxFormat = Math.max(...Object.values(d.formatCounts), 1)

    // AI recommendation
    let aiMessage = ''
    if (d.total === 0) {
        aiMessage = 'Hãy bắt đầu tạo content để nhận được phân tích chi tiết từ AI!'
    } else if (published === 0) {
        aiMessage = 'Lời Khuyên AI: Tến độ tháng này hơi chậm. Hãy tập trung hoàn thành các nội dung Video và Post đang thực hiện.'
    } else {
        aiMessage = `Lời Khuyên AI: Đã hoàn thành ${published}/${d.total} bài. Tiến độ tháng này ${published >= d.total / 2 ? 'tốt' : 'cần cải thiện'}. Hãy tập trung hoàn thành các nội dung còn lại.`
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" /> Báo Cáo Hiệu Quả
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Thống kê chi tiết kế hoạch nội dung tháng {now.getMonth() + 1}/{now.getFullYear()}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">{reportMonth}</span>
                </div>
            </div>

            {/* ToFu / MoFu / BoFu Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'ToFu - Nhận Biết', sublabel: 'Awareness & Discovery', pct: d.tofu.percentage, color: '#f59e0b', ringColor: 'stroke-amber-400', tag: 'Top', tagBg: 'bg-amber-50 text-amber-700' },
                    { label: 'MoFu - Cân Nhắc', sublabel: 'Consideration & Engagement', pct: d.mofu.percentage, color: '#ef4444', ringColor: 'stroke-red-400', tag: 'Middle', tagBg: 'bg-red-50 text-red-700' },
                    { label: 'BoFu - Chuyển Đổi', sublabel: 'Conversion & Loyalty', pct: d.bofu.percentage, color: '#10b981', ringColor: 'stroke-emerald-400', tag: 'Bottom', tagBg: 'bg-emerald-50 text-emerald-700' },
                ].map((item, i) => (
                    <div key={i} className="p-5 rounded-xl border border-border bg-card relative overflow-hidden group hover:shadow-md transition-shadow">
                        {/* Background decoration */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10"
                            style={{ backgroundColor: item.color }} />
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {/* Ring progress */}
                                <div className="relative w-12 h-12">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                                        <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                                        <circle cx="24" cy="24" r="18" fill="none"
                                            stroke={item.color} strokeWidth="4"
                                            strokeDasharray={`${(item.pct / 100) * 113} 113`}
                                            strokeLinecap="round" className="transition-all duration-1000" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${item.tagBg}`}>
                                {item.tag}
                            </span>
                        </div>
                        <p className="text-3xl font-bold font-heading" style={{ color: item.color }}>
                            {item.pct}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">{item.sublabel}</p>
                    </div>
                ))}
            </div>

            {/* Content Mix + Action Plan Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Mix */}
                <div className="p-5 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                        🎯 Phân bổ loại nội dung (Content Mix)
                    </h2>
                    {Object.keys(d.formatCounts).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(d.formatCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([format, count]) => {
                                    const meta = FORMAT_LABELS[format] || { label: format, icon: '📄', color: '#6b7280' }
                                    const pct = Math.round((count / maxFormat) * 100)
                                    return (
                                        <div key={format}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="flex items-center gap-1.5">
                                                    <span>{meta.icon}</span>
                                                    <span className="font-medium">{meta.label}</span>
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    {count} ({d.total > 0 ? Math.round((count / d.total) * 100) : 0}%)
                                                </span>
                                            </div>
                                            <div className="h-3 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )}
                </div>

                {/* Action Plan Status */}
                <div className="p-5 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                        ⏱️ Trạng thái Action Plan
                    </h2>
                    <div className="space-y-4">
                        {[
                            { label: 'Hoàn thành', count: published, color: '#10b981', max: d.total },
                            { label: 'Đang thực hiện', count: inProgress, color: '#3b82f6', max: d.total },
                            { label: 'Chưa bắt đầu', count: Math.max(0, notStarted), color: '#9ca3af', max: d.total },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{item.label}</span>
                                    <span className="font-bold" style={{ color: item.color }}>{item.count}</span>
                                </div>
                                <div className="h-3 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${item.max > 0 ? (item.count / item.max) * 100 : 0}%`,
                                            backgroundColor: item.color,
                                        }} />
                                </div>
                            </div>
                        ))}

                        {/* AI Message */}
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-400">{aiMessage}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Funnel Visual + Topic Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Marketing Funnel */}
                <div className="p-5 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-base mb-6 flex items-center gap-2">
                        🔻 Phễu Marketing (Visual Funnel)
                    </h2>
                    <div className="flex flex-col items-center gap-1.5">
                        {FUNNEL_VISUAL.map((stage) => {
                            const count = d.funnelCounts[stage.key] || 0
                            const pct = d.total > 0 ? Math.round((count / d.total) * 100) : 0
                            return (
                                <div key={stage.key}
                                    className="relative flex items-center justify-center py-3 rounded-lg text-white font-medium text-xs
                                    transition-all hover:opacity-90 hover:shadow-md"
                                    style={{
                                        backgroundColor: stage.color,
                                        width: stage.width,
                                        clipPath: 'polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)',
                                        opacity: count > 0 ? 1 : 0.4,
                                    }}>
                                    <span className="relative z-10">
                                        {stage.label}: {count} ({pct}%)
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {FUNNEL_VISUAL.map(s => (
                            <span key={s.key} className="flex items-center gap-1 text-[10px]">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Topic Distribution */}
                <div className="p-5 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-base mb-6 flex items-center gap-2">
                        🎯 Phân bổ theo chủ đề (Topic Distribution)
                    </h2>
                    {Object.keys(d.topicCounts).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
                    ) : (
                        <div>
                            {/* CSS Pie chart */}
                            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden"
                                style={{
                                    background: (() => {
                                        const entries = Object.entries(d.topicCounts)
                                        const total = entries.reduce((s, [, c]) => s + c, 0)
                                        if (total === 0) return '#e5e7eb'
                                        let gradParts: string[] = []
                                        let cumPct = 0
                                        entries.forEach(([topic, count]) => {
                                            const pct = (count / total) * 100
                                            const color = TOPIC_COLORS[topic] || '#6b7280'
                                            gradParts.push(`${color} ${cumPct}% ${cumPct + pct}%`)
                                            cumPct += pct
                                        })
                                        return `conic-gradient(${gradParts.join(', ')})`
                                    })(),
                                }}>
                                <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-lg font-bold font-heading">{d.total}</p>
                                        <p className="text-[9px] text-muted-foreground">bài viết</p>
                                    </div>
                                </div>
                            </div>
                            {/* Labels */}
                            <div className="space-y-2">
                                {Object.entries(d.topicCounts).map(([topic, count]) => {
                                    const pct = d.total > 0 ? Math.round((count / d.total) * 100) : 0
                                    return (
                                        <div key={topic} className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded" style={{ backgroundColor: TOPIC_COLORS[topic] || '#6b7280' }} />
                                                {topic}
                                            </span>
                                            <span className="font-bold">{pct}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Funnel Stage Distribution */}
            <div className="p-5 rounded-xl border border-border bg-card">
                <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                    📊 Phân bổ theo giai đoạn Funnel
                </h2>
                {d.total === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có dữ liệu</p>
                ) : (
                    <div className="space-y-3">
                        {FUNNEL_VISUAL.map(stage => {
                            const count = d.funnelCounts[stage.key] || 0
                            const pct = d.total > 0 ? Math.round((count / d.total) * 100) : 0
                            return (
                                <div key={stage.key} className="flex items-center gap-4">
                                    <span className="text-sm font-medium w-24 shrink-0">{stage.label}</span>
                                    <div className="flex-1 h-6 rounded bg-muted overflow-hidden relative">
                                        <div className="h-full rounded transition-all duration-700 flex items-center px-2"
                                            style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: stage.color }}>
                                            {pct > 10 && (
                                                <span className="text-[10px] text-white font-bold">{pct}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground w-16 text-right">{count} bài</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
