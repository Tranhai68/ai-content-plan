'use client'

import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronUp, Sparkles, Trophy, TrendingUp, Lightbulb } from 'lucide-react'

interface StrategistData {
    total: number
    funnelCounts: Record<string, number>
    funnelPercentages: Record<string, number>
    formatCounts: Record<string, number>
    statusCounts: Record<string, number>
}

const FUNNEL_STAGES_DATA = [
    { key: 'AWARENESS', label: 'NHẬN BIẾT', color: '#f59e0b', idealPct: 35 },
    { key: 'CONSIDERATION', label: 'CÂN NHẮC', color: '#3b82f6', idealPct: 30 },
    { key: 'CONVERSION', label: 'CHUYỂN ĐỔI', color: '#10b981', idealPct: 15 },
    { key: 'LOYALTY', label: 'TRUNG THÀNH', color: '#8b5cf6', idealPct: 10 },
    { key: 'ADVOCACY', label: 'LAN TỎA', color: '#ec4899', idealPct: 10 },
]

const IDEAL_RATIO = '35/30/15/10/10'

export default function StrategistPage() {
    const [data, setData] = useState<StrategistData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showInsights, setShowInsights] = useState(false)
    const now = new Date()

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

    const d = data || { total: 0, funnelCounts: {}, funnelPercentages: {}, formatCounts: {}, statusCounts: {} }

    const calcFunnelBalance = () => {
        if (d.total === 0) return 0
        let totalDiff = 0
        FUNNEL_STAGES_DATA.forEach(s => {
            const actual = d.funnelPercentages[s.key] || 0
            totalDiff += Math.abs(actual - s.idealPct)
        })
        return Math.max(0, Math.round(100 - totalDiff))
    }

    const calcDiversity = () => {
        const formatCount = Object.keys(d.formatCounts).length
        if (formatCount >= 5) return 100
        if (formatCount >= 3) return 80
        if (formatCount >= 2) return 60
        if (formatCount >= 1) return 40
        return 0
    }

    const calcFrequency = () => {
        if (d.total === 0) return 0
        const ratio = Math.min(d.total / 30, 1)
        return Math.round(ratio * 100)
    }

    const funnelBalanceScore = calcFunnelBalance()
    const diversityScore = calcDiversity()
    const frequencyScore = calcFrequency()
    const overallScore = Math.round((funnelBalanceScore + diversityScore + frequencyScore) / 3)

    const getRating = (score: number) => {
        if (score >= 90) return { label: 'XUẤT SẮC', color: '#10b981' }
        if (score >= 75) return { label: 'TỐT', color: '#3b82f6' }
        if (score >= 50) return { label: 'TRUNG BÌNH', color: '#f59e0b' }
        return { label: 'CẦN CẢI THIỆN', color: '#ef4444' }
    }

    const rating = getRating(overallScore)

    const weeklyBreakdown = [1, 2, 3, 4, 5].map(week => {
        const weekItems: Record<string, number> = {}
        FUNNEL_STAGES_DATA.forEach(s => {
            const total = d.funnelCounts[s.key] || 0
            weekItems[s.key] = Math.max(0, Math.round(total / 4 + (week === 1 ? total % 4 : 0)))
        })
        return { week, items: weekItems }
    })

    const focusRecommendations = [
        { week: 1, title: 'Xây dựng Nhận biết', desc: 'Tập trung tạo content giới thiệu thương hiệu, sản phẩm mới' },
        { week: 2, title: 'Tăng Tương tác', desc: 'Tạo polls, Q&A, behind-the-scenes để tăng engagement' },
        { week: 3, title: 'Thúc đẩy Chuyển đổi', desc: 'Content sale, khuyến mãi, flash sale giữa tháng' },
        { week: 4, title: 'Chăm Sóc & Giữ Chân Khách Hàng', desc: 'Content tri ân, loyalty program, review từ khách hàng' },
    ]

    const headerGradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header with gradient */}
            <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: headerGradient }}>
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            🧠 AI Content Strategist
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white/80 font-normal">BETA</span>
                        </h1>
                        <p className="text-sm text-white/80">
                            Phân tích chiến lược nội dung và đề xuất tối ưu hóa cho tháng {now.getMonth() + 1}/{now.getFullYear()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h3 className="font-bold text-sm text-violet-800 dark:text-violet-300">Chào mừng đến với AI Content Strategist!</h3>
                        <p className="text-xs text-violet-600/80 dark:text-violet-400/80 mt-1">
                            Hệ thống AI sẽ phân tích kênh marketing của bạn, phát hiện các gaps trong chiến lược nội dung,
                            và đưa ra recommendations cụ thể để tối ưu hóa hiệu quả. Mỗi tuần bạn sẽ nhận được focus và action items
                            rõ ràng để đạt mục tiêu.
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Audit Score */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-violet-500" /> Đánh Giá Chiến Lược (AI Audit)
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Phân tích chuyên sâu dựa trên dữ liệu content tháng này
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-5xl font-bold font-heading" style={{ color: rating.color }}>{overallScore}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: rating.color }}>{rating.label}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                        { label: 'Cân Đối Phễu', score: funnelBalanceScore, icon: '⚖️' },
                        { label: 'Đa Dạng Hóa', score: diversityScore, icon: '🎨' },
                        { label: 'Tần Suất (Mục tiêu)', score: frequencyScore, icon: '📅' },
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-muted/30 text-center border border-border">
                            <p className="text-2xl mb-1">{item.icon}</p>
                            <p className="text-xs text-muted-foreground mb-2">{item.label}</p>
                            <p className="text-xl font-bold font-heading" style={{ color: getRating(item.score).color }}>
                                {item.score}/100
                            </p>
                        </div>
                    ))}
                </div>

                <button onClick={() => setShowInsights(!showInsights)}
                    className="flex items-center gap-2 text-xs text-primary hover:underline font-medium">
                    Chi tiết phân tích & Insights
                    {showInsights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {d.total > 0 ? `${d.total} bài` : '0 bài'}
                    </span>
                </button>

                {showInsights && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-border text-sm space-y-2 animate-scale-in">
                        <p>• <strong>Phễu:</strong> Tỉ lệ lý tưởng là {IDEAL_RATIO}. {funnelBalanceScore >= 80 ? 'Phân bổ hiện tại khá cân đối.' : 'Cần điều chỉnh phân bổ giữa các tầng phễu.'}</p>
                        <p>• <strong>Đa dạng:</strong> Đang sử dụng {Object.keys(d.formatCounts).length} loại format. {diversityScore >= 80 ? 'Rất đa dạng!' : 'Thử thêm các format mới như Video, Carousel.'}</p>
                        <p>• <strong>Tần suất:</strong> {d.total} bài/tháng. {frequencyScore >= 80 ? 'Tần suất tốt!' : 'Nên đăng thêm content để tăng reach.'}</p>
                    </div>
                )}
            </div>

            {/* Content Funnel (Actual vs Ideal) */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <h2 className="font-heading font-bold text-lg mb-2 flex items-center gap-2">
                    🔻 Phễu Nội Dung (Thực tế vs Lý tưởng)
                </h2>
                <div className="flex flex-col items-center gap-1 py-4">
                    {FUNNEL_STAGES_DATA.map((stage, i) => {
                        const count = d.funnelCounts[stage.key] || 0
                        const pct = d.total > 0 ? Math.round((count / d.total) * 100) : 0
                        const widthPct = 100 - (i * 15)

                        return (
                            <div key={stage.key}
                                className="relative flex items-center justify-center py-4 text-white font-bold text-sm transition-all hover:opacity-90"
                                style={{
                                    backgroundColor: stage.color,
                                    width: `${widthPct}%`,
                                    clipPath: 'polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)',
                                    opacity: count > 0 ? 1 : 0.35,
                                }}>
                                <span className="relative z-10 drop-shadow-sm text-xs">
                                    {stage.label}: {count} ({pct}%)
                                </span>
                            </div>
                        )
                    })}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                    *Tỉ lệ khuyến nghị cho chiến lược phát triển bền vững ({IDEAL_RATIO})
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                    🤔 Tại sao tỉ lệ chiến lược: {IDEAL_RATIO}?
                </p>
            </div>

            {/* Weekly Funnel Breakdown */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    📆 Phân bổ Funnel theo Tuần (Chi tiết)
                </h2>
                <div className="grid grid-cols-5 gap-3">
                    {weeklyBreakdown.map(({ week, items }) => (
                        <div key={week} className="text-center">
                            <p className="text-xs font-bold mb-2">Tuần {week}</p>
                            <div className="flex flex-col items-center gap-0.5">
                                {FUNNEL_STAGES_DATA.map((stage, i) => {
                                    const count = items[stage.key] || 0
                                    const w = 100 - (i * 15)
                                    return (
                                        <div key={stage.key}
                                            className="flex items-center justify-center py-1.5 text-white text-[9px] font-bold rounded-sm transition-all"
                                            style={{
                                                backgroundColor: stage.color,
                                                width: `${w}%`,
                                                opacity: count > 0 ? 1 : 0.3,
                                                clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
                                            }}>
                                            {stage.label.slice(0, 2)}: {count}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Focus Recommendations */}
            <div className="p-6 rounded-xl border border-border bg-card">
                <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Trọng Tâm Theo Tuần
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {focusRecommendations.map((rec, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border hover:shadow-md transition-all hover:border-primary/30 group cursor-pointer"
                            style={{
                                borderLeftWidth: 4,
                                borderLeftColor: FUNNEL_STAGES_DATA[i % FUNNEL_STAGES_DATA.length].color,
                            }}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-bold">TUẦN {rec.week}</span>
                                <TrendingUp className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-sm font-bold">{rec.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{rec.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
