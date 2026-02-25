'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    Loader2, Palette, Target, FileText, Users, ArrowRight
} from 'lucide-react'

interface Workspace {
    id: string
    name: string
    description: string | null
    brand: { brandName: string; industry: string; toneStyle: string } | null
    funnelConfig: { awareness: number; consideration: number; conversion: number; loyalty: number; advocacy: number } | null
    _count: { members: number; contentItems: number }
}

export default function WorkspaceDetailPage() {
    const params = useParams()
    const wsId = params.id as string
    const [workspace, setWorkspace] = useState<Workspace | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/workspace/${wsId}`).then(r => r.json()).then(data => {
            setWorkspace(data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [wsId])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!workspace) {
        return <div className="p-6 text-center text-muted-foreground">Workspace không tồn tại</div>
    }

    const quickActions = [
        {
            title: 'Brand Voice',
            desc: workspace.brand ? `${workspace.brand.brandName} • ${workspace.brand.industry}` : 'Chưa thiết lập',
            icon: Palette,
            href: `/dashboard/workspace/${wsId}/brand`,
            color: 'text-pink-500',
            bg: 'bg-pink-50 dark:bg-pink-900/20',
            done: !!workspace.brand,
        },
        {
            title: 'Chiến lược phễu',
            desc: workspace.funnelConfig
                ? `${workspace.funnelConfig.awareness}/${workspace.funnelConfig.consideration}/${workspace.funnelConfig.conversion}/${workspace.funnelConfig.loyalty}/${workspace.funnelConfig.advocacy}`
                : 'Chưa cấu hình',
            icon: Target,
            href: '/dashboard/strategy',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            done: !!workspace.funnelConfig,
        },
        {
            title: 'Nội dung',
            desc: `${workspace._count.contentItems} bài viết`,
            icon: FileText,
            href: '/dashboard/content',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            done: workspace._count.contentItems > 0,
        },
    ]

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold font-heading">{workspace.name}</h1>
                {workspace.description && (
                    <p className="text-muted-foreground text-sm mt-1">{workspace.description}</p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                    <Link key={action.title} href={action.href}
                        className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 rounded-lg ${action.bg}`}>
                                <action.icon className={`w-5 h-5 ${action.color}`} />
                            </div>
                            {action.done && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600
                  dark:bg-emerald-900/20">✅ Đã thiết lập</span>
                            )}
                        </div>
                        <h3 className="font-heading font-bold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
                        <span className="flex items-center gap-1 mt-3 text-sm text-primary font-medium
              group-hover:underline">
                            {action.done ? 'Chỉnh sửa' : 'Thiết lập ngay'} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </Link>
                ))}
            </div>

            {/* Onboarding Guide */}
            {!workspace.brand && (
                <div className="p-5 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                    <h3 className="font-heading font-bold text-lg mb-2">🚀 Bắt đầu sử dụng</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Để AI tạo nội dung chất lượng, hãy hoàn thành các bước sau:
                    </p>
                    <ol className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${workspace.brand ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                1
                            </span>
                            Thiết lập Brand Voice (tên, ngành, tone)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${workspace.funnelConfig ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                2
                            </span>
                            Cấu hình phễu marketing
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                                3
                            </span>
                            Tạo content đầu tiên hoặc dùng AI tạo lịch
                        </li>
                    </ol>
                </div>
            )}
        </div>
    )
}
