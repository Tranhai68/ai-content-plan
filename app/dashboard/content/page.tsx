'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Plus, Search, Filter, Trash2, Edit, Loader2, FileText
} from 'lucide-react'
import { FUNNEL_STAGES, CONTENT_STATUSES } from '@/lib/utils'

interface ContentItem {
    id: string
    title: string
    funnelStage: string
    status: string
    format: string
    platform: string | null
    scheduledDate: string
    createdAt: string
}

export default function ContentListPage() {
    const [items, setItems] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStage, setFilterStage] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    const loadItems = () => {
        fetch('/api/content').then(r => r.json()).then(data => {
            setItems(Array.isArray(data) ? data : [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { loadItems() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa bài viết này?')) return
        await fetch(`/api/content/${id}`, { method: 'DELETE' })
        loadItems()
    }

    // Filter items
    const filtered = items.filter(item => {
        if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false
        if (filterStage && item.funnelStage !== filterStage) return false
        if (filterStatus && item.status !== filterStatus) return false
        return true
    })

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
                    <h1 className="text-2xl font-bold font-heading">Content Studio</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Quản lý tất cả nội dung marketing ({items.length} bài)
                    </p>
                </div>
                <Link href="/dashboard/content/new"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            gradient-brand text-white hover:opacity-90 transition-all">
                    <Plus className="w-4 h-4" /> Tạo Content mới
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Tìm kiếm bài viết..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm" />
                </div>
                <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-border bg-background">
                    <option value="">Tất cả phễu</option>
                    {Object.entries(FUNNEL_STAGES).map(([k, v]) => (
                        <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-border bg-background">
                    <option value="">Tất cả trạng thái</option>
                    {Object.entries(CONTENT_STATUSES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
            </div>

            {/* Content Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p className="font-medium text-lg">
                        {items.length === 0 ? 'Chưa có nội dung nào' : 'Không tìm thấy kết quả'}
                    </p>
                    <p className="text-sm mt-1">
                        {items.length === 0 ? 'Bắt đầu tạo content với AI!' : 'Thử thay đổi bộ lọc'}
                    </p>
                    {items.length === 0 && (
                        <Link href="/dashboard/content/new"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium
                gradient-brand text-white">
                            <Plus className="w-4 h-4" /> Tạo Content mới
                        </Link>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tiêu đề</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phễu</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Định dạng</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nền tảng</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((item) => {
                                const stageKey = item.funnelStage as keyof typeof FUNNEL_STAGES
                                const statusKey = item.status as keyof typeof CONTENT_STATUSES
                                const stage = FUNNEL_STAGES[stageKey]
                                const statusInfo = CONTENT_STATUSES[statusKey]

                                return (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={`/dashboard/content/${item.id}`}
                                                className="font-medium text-sm hover:text-primary transition-colors">
                                                {item.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded-full font-medium"
                                                style={{ backgroundColor: stage?.color + '20', color: stage?.color }}>
                                                {stage?.icon} {stage?.label || item.funnelStage}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.format}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.platform || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {new Date(item.scheduledDate).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                                style={{ backgroundColor: statusInfo?.color + '20', color: statusInfo?.color }}>
                                                {statusInfo?.label || item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Link href={`/dashboard/content/${item.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Chỉnh sửa">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                                    title="Xóa">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
