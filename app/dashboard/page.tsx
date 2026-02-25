'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    BarChart3, Calendar, FileText, TrendingUp, Plus, Sparkles,
    Loader2, ArrowRight
} from 'lucide-react'
import { FUNNEL_STAGES, CONTENT_STATUSES } from '@/lib/utils'

interface ContentItem {
    id: string
    title: string
    funnelStage: string
    status: string
    format: string
    scheduledDate: string
    createdAt: string
}

interface Stats {
    totalContent: number
    scheduled: number
    published: number
    drafts: number
    pending: number
    workspaceCount: number
    funnelDistribution: Array<{ funnelStage: string; _count: number }>
    recentItems: ContentItem[]
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const s = stats || {
        totalContent: 0, scheduled: 0, published: 0, drafts: 0,
        pending: 0, workspaceCount: 0, funnelDistribution: [], recentItems: [],
    }

    const statCards = [
        { label: 'Tổng bài viết', value: s.totalContent, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Đã lên lịch', value: s.scheduled, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Đã xuất bản', value: s.published, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Bản nháp', value: s.drafts, icon: BarChart3, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    ]

    const total = s.funnelDistribution.reduce((sum, d) => sum + d._count, 0)

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading">Xin chào! 👋</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Đây là tổng quan các hoạt động content marketing.
                    </p>
                </div>
                <Link href="/dashboard/content/new"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            gradient-brand text-white hover:opacity-90 transition-all shadow-lg shadow-red-200 dark:shadow-red-900/20">
                    <Plus className="w-4 h-4" /> Tạo Content mới
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.label}
                        className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${card.bg}`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold font-heading">{card.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Content */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-bold text-lg">Nội dung gần đây</h2>
                        <Link href="/dashboard/content"
                            className="text-xs text-primary hover:underline flex items-center gap-1">
                            Xem tất cả <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {s.recentItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">Chưa có nội dung nào</p>
                            <p className="text-sm mt-1">Bắt đầu tạo content với AI ngay!</p>
                            <Link href="/dashboard/content/new"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium
                  gradient-brand text-white">
                                <Plus className="w-4 h-4" /> Tạo ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {s.recentItems.map((item) => {
                                const stageKey = item.funnelStage as keyof typeof FUNNEL_STAGES
                                const statusKey = item.status as keyof typeof CONTENT_STATUSES
                                const stage = FUNNEL_STAGES[stageKey]
                                const statusInfo = CONTENT_STATUSES[statusKey]

                                return (
                                    <Link key={item.id} href={`/dashboard/content/${item.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-lg">{stage?.icon || '📄'}</span>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {stage?.label || item.funnelStage} • {new Date(item.scheduledDate).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                            style={{ backgroundColor: statusInfo?.color + '20', color: statusInfo?.color }}>
                                            {statusInfo?.label || item.status}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Funnel Distribution */}
                <div className="p-5 rounded-xl border border-border bg-card">
                    <h2 className="font-heading font-bold text-lg mb-4">Phân bổ phễu</h2>

                    {total === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Chưa có dữ liệu phễu
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(FUNNEL_STAGES).map(([key, stage]) => {
                                const dist = s.funnelDistribution.find(d => d.funnelStage === key)
                                const count = dist?._count || 0
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0

                                return (
                                    <div key={key}>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span>{stage.icon} {stage.label}</span>
                                            <span className="text-muted-foreground">{count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: stage.color }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
