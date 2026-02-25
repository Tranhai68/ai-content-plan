'use client'

import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import {
    Sparkles, X, Loader2, Plus, ChevronRight
} from 'lucide-react'
import { FUNNEL_STAGES } from '@/lib/utils'
import { VIETNAMESE_HOLIDAYS } from '@/lib/constants/vietnamese-holidays'
import Link from 'next/link'

interface ContentItem {
    id: string
    title: string
    funnelStage: string
    status: string
    format: string
    scheduledDate: string
}

const STAGE_COLORS: Record<string, string> = {
    AWARENESS: '#3b82f6',
    CONSIDERATION: '#f59e0b',
    CONVERSION: '#ef4444',
    LOYALTY: '#10b981',
    ADVOCACY: '#8b5cf6',
}

export default function CalendarPage() {
    const [items, setItems] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
    const [showAiModal, setShowAiModal] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiDays, setAiDays] = useState(7)
    const calRef = useRef<FullCalendar>(null)

    const loadItems = () => {
        fetch('/api/content').then(r => r.json()).then(data => {
            setItems(Array.isArray(data) ? data : [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { loadItems() }, [])

    // Calendar events from DB
    const contentEvents = items.map(item => ({
        id: item.id,
        title: item.title,
        start: item.scheduledDate,
        backgroundColor: STAGE_COLORS[item.funnelStage] || '#6b7280',
        borderColor: 'transparent',
        extendedProps: { ...item },
    }))

    // Holiday events
    const holidayEvents = VIETNAMESE_HOLIDAYS.map(h => ({
        id: `holiday-${h.name}`,
        title: `🎉 ${h.name}`,
        start: h.date,
        backgroundColor: '#fef2f2',
        textColor: '#dc2626',
        borderColor: '#fecaca',
        display: 'background' as const,
    }))

    const allEvents = [...contentEvents, ...holidayEvents]

    // AI Generate Plan
    const handleAiGenerate = async () => {
        setAiLoading(true)
        try {
            // Get workspace
            const wsRes = await fetch('/api/workspace/default')
            const ws = await wsRes.json()

            const start = new Date().toISOString().split('T')[0]
            const end = new Date(Date.now() + aiDays * 86400000).toISOString().split('T')[0]

            const res = await fetch('/api/ai/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: ws.id,
                    startDate: start,
                    endDate: end,
                }),
            })

            const data = await res.json()
            if (data.success) {
                setShowAiModal(false)
                loadItems() // Reload calendar
            } else {
                alert(data.error || 'Lỗi khi tạo kế hoạch. Hãy thiết lập Brand Voice và Funnel trước.')
            }
        } catch (e) {
            console.error(e)
            alert('Lỗi khi tạo kế hoạch AI. Kiểm tra API Key và Brand Voice.')
        } finally {
            setAiLoading(false)
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
        <div className="p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading">📅 Lịch Nội Dung</h1>
                    <p className="text-muted-foreground text-sm mt-1">Quản lý và lên lịch nội dung marketing</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/content/new"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border
              hover:bg-muted transition-colors">
                        <Plus className="w-4 h-4" /> Thêm bài
                    </Link>
                    <button onClick={() => setShowAiModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              gradient-brand text-white hover:opacity-90 transition-all animate-pulse-glow">
                        <Sparkles className="w-4 h-4" /> Tạo lịch AI
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
                {Object.entries(FUNNEL_STAGES).map(([key, stage]) => (
                    <span key={key} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        {stage.label}
                    </span>
                ))}
            </div>

            {/* Calendar */}
            <div className="rounded-xl border border-border bg-card p-4">
                <FullCalendar
                    ref={calRef}
                    plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale="vi"
                    events={allEvents}
                    editable={false}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek,listWeek',
                    }}
                    buttonText={{
                        today: 'Hôm nay',
                        month: 'Tháng',
                        week: 'Tuần',
                        list: 'Danh sách',
                    }}
                    eventClick={(info) => {
                        if (info.event.id.startsWith('holiday-')) return
                        const item = items.find(i => i.id === info.event.id)
                        if (item) setSelectedItem(item)
                    }}
                    height="auto"
                />
            </div>

            {/* Event Detail Panel */}
            {selectedItem && (
                <div className="fixed inset-y-0 right-0 w-[360px] bg-card border-l border-border shadow-xl z-50
          animate-slide-in-right p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-bold text-lg">Chi tiết</h3>
                        <button onClick={() => setSelectedItem(null)} className="p-1 rounded hover:bg-muted">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Tiêu đề</p>
                            <p className="font-medium">{selectedItem.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Phễu</p>
                            <span className="text-sm px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: (STAGE_COLORS[selectedItem.funnelStage] || '#6b7280') + '20',
                                    color: STAGE_COLORS[selectedItem.funnelStage] || '#6b7280',
                                }}>
                                {FUNNEL_STAGES[selectedItem.funnelStage as keyof typeof FUNNEL_STAGES]?.icon}{' '}
                                {FUNNEL_STAGES[selectedItem.funnelStage as keyof typeof FUNNEL_STAGES]?.label || selectedItem.funnelStage}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Ngày</p>
                            <p className="text-sm">{new Date(selectedItem.scheduledDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Định dạng</p>
                            <p className="text-sm">{selectedItem.format}</p>
                        </div>

                        <Link href={`/dashboard/content/${selectedItem.id}`}
                            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                            Mở trong Editor <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* AI Generate Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-2xl p-6 w-[440px] shadow-2xl animate-scale-in">
                        <h3 className="font-heading font-bold text-xl mb-2">✨ Tạo lịch nội dung AI</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            AI sẽ tự động tạo lịch nội dung dựa trên phễu marketing và Brand Voice đã thiết lập.
                        </p>

                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Số ngày</label>
                                <select value={aiDays} onChange={(e) => setAiDays(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                                    <option value={3}>3 ngày</option>
                                    <option value={7}>7 ngày (1 tuần)</option>
                                    <option value={14}>14 ngày (2 tuần)</option>
                                    <option value={30}>30 ngày (1 tháng)</option>
                                </select>
                            </div>

                            <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-xs dark:bg-amber-900/20 dark:text-amber-400">
                                ⚠️ Cần thiết lập Brand Voice và Funnel Config trước khi sử dụng tính năng này.
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handleAiGenerate} disabled={aiLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium
                  gradient-brand text-white disabled:opacity-50">
                                {aiLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Tạo kế hoạch</>
                                )}
                            </button>
                            <button onClick={() => setShowAiModal(false)} disabled={aiLoading}
                                className="px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-muted disabled:opacity-50">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
