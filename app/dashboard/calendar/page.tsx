'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    Sparkles, ChevronLeft, ChevronRight, Plus, Loader2, Eye
} from 'lucide-react'
import { FUNNEL_STAGES } from '@/lib/utils'
import { getHolidaysForMonth, CONTENT_TYPES, CATEGORY_COLORS } from '@/lib/constants/vietnamese-holidays'
import Link from 'next/link'
import CalendarContentModal from '@/components/dashboard/CalendarContentModal'

interface ContentItem {
    id: string
    title: string
    funnelStage: string
    status: string
    format: string
    scheduledDate: string
}

const WEEKDAYS = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CN']

const FORMAT_BADGES: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    IMAGE_POST: { label: 'POST', icon: '📝', color: '#3b82f6', bg: '#eff6ff' },
    VIDEO: { label: 'VIDEO', icon: '🎬', color: '#8b5cf6', bg: '#f5f3ff' },
    CAROUSEL: { label: 'CAROUSEL', icon: '🎠', color: '#ec4899', bg: '#fdf2f8' },
    TEXT_ONLY: { label: 'POST', icon: '📝', color: '#3b82f6', bg: '#eff6ff' },
    STORY: { label: 'STORY', icon: '📱', color: '#14b8a6', bg: '#f0fdfa' },
    REEL: { label: 'REEL', icon: '🎵', color: '#a855f7', bg: '#faf5ff' },
    TIKTOK: { label: 'TIKTOK', icon: '🎵', color: '#000', bg: '#f5f5f5' },
    LIVE_STREAM: { label: 'LIVE STREAM', icon: '📡', color: '#ef4444', bg: '#fef2f2' },
    MEME: { label: 'MEME', icon: '😂', color: '#f59e0b', bg: '#fffbeb' },
    SALE: { label: 'SALE', icon: '🏷️', color: '#dc2626', bg: '#fef2f2' },
    POLL: { label: 'POLL', icon: '📊', color: '#6366f1', bg: '#eef2ff' },
    POST: { label: 'POST', icon: '📝', color: '#3b82f6', bg: '#eff6ff' },
    IMAGE: { label: 'IMAGE', icon: '🖼️', color: '#10b981', bg: '#f0fdf4' },
}

const STAGE_PILLS: Record<string, { label: string; color: string; bg: string }> = {
    AWARENESS: { label: 'Nhận biết', color: '#3b82f6', bg: '#dbeafe' },
    CONSIDERATION: { label: 'Cân nhắc', color: '#f59e0b', bg: '#fef3c7' },
    CONVERSION: { label: 'Chuyển đổi', color: '#ef4444', bg: '#fee2e2' },
    LOYALTY: { label: 'Trung thành', color: '#10b981', bg: '#d1fae5' },
    ADVOCACY: { label: 'Lan tỏa', color: '#8b5cf6', bg: '#ede9fe' },
}

export default function CalendarPage() {
    const [items, setItems] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [modalDate, setModalDate] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const loadItems = () => {
        fetch('/api/content').then(r => r.json()).then(data => {
            setItems(Array.isArray(data) ? data : [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { loadItems() }, [])

    // Calendar grid computation
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)
        const daysInMonth = lastDay.getDate()

        // Monday = 0, Sunday = 6
        let startWeekday = firstDay.getDay() - 1
        if (startWeekday < 0) startWeekday = 6

        const days: Array<{ day: number; date: string; isCurrentMonth: boolean }> = []

        // Previous month days
        const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
        for (let i = startWeekday - 1; i >= 0; i--) {
            const d = prevMonthLastDay - i
            const m = month - 1 < 1 ? 12 : month - 1
            const y = month - 1 < 1 ? year - 1 : year
            days.push({
                day: d,
                date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                isCurrentMonth: false,
            })
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({
                day: d,
                date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                isCurrentMonth: true,
            })
        }

        // Next month days to fill grid
        const remaining = 7 - (days.length % 7)
        if (remaining < 7) {
            for (let d = 1; d <= remaining; d++) {
                const m = month + 1 > 12 ? 1 : month + 1
                const y = month + 1 > 12 ? year + 1 : year
                days.push({
                    day: d,
                    date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    isCurrentMonth: false,
                })
            }
        }

        return days
    }, [year, month])

    // Holidays for current month
    const monthHolidays = useMemo(() => getHolidaysForMonth(year, month), [year, month])

    // Group content by date
    const contentByDate = useMemo(() => {
        const map: Record<string, ContentItem[]> = {}
        items.forEach(item => {
            const d = item.scheduledDate?.split('T')[0]
            if (d) {
                if (!map[d]) map[d] = []
                map[d].push(item)
            }
        })
        return map
    }, [items])

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1))
    }
    const nextMonth = () => {
        setCurrentDate(new Date(year, month, 1))
    }

    const today = new Date().toISOString().split('T')[0]

    const monthNames = [
        'THÁNG 1', 'THÁNG 2', 'THÁNG 3', 'THÁNG 4', 'THÁNG 5', 'THÁNG 6',
        'THÁNG 7', 'THÁNG 8', 'THÁNG 9', 'THÁNG 10', 'THÁNG 11', 'THÁNG 12'
    ]

    // Get holiday modal data
    const modalHoliday = modalDate
        ? monthHolidays.find(h => h.fullDate === modalDate)
        : undefined

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                        <span className="text-primary">📅</span> Lịch Nội Dung
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Quản lý và lên lịch nội dung marketing</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/content/new"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border
                        hover:bg-muted transition-colors">
                        <Plus className="w-4 h-4" /> Thêm bài
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        gradient-brand text-white hover:opacity-90 transition-all">
                        <Sparkles className="w-4 h-4" /> Sync
                    </button>
                    {/* Month Navigator */}
                    <div className="flex items-center gap-1 ml-2">
                        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold min-w-[140px] text-center">
                            {monthNames[month - 1]} / {year}
                        </span>
                        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
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
                <span className="text-muted-foreground">|</span>
                <span className="flex items-center gap-1 text-red-500">🎉 Ngày lễ</span>
                <span className="flex items-center gap-1 text-orange-500">🛍️ Mua sắm</span>
                <span className="flex items-center gap-1 text-green-500">🌿 Văn hóa</span>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    {WEEKDAYS.map((day, i) => (
                        <div key={day} className={`px-2 py-2.5 text-center text-xs font-bold tracking-wider
                            ${i < 6 ? 'border-r border-white/10' : ''}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, idx) => {
                        const dayContent = contentByDate[dayInfo.date] || []
                        const dayHolidays = monthHolidays.filter(h => h.day === dayInfo.day && dayInfo.isCurrentMonth)
                        const isToday = dayInfo.date === today
                        const hasHoliday = dayHolidays.length > 0
                        const hasSaleHoliday = dayHolidays.some(h => h.category === 'shopping')

                        return (
                            <div key={idx}
                                onClick={() => dayInfo.isCurrentMonth && setModalDate(dayInfo.date)}
                                className={`min-h-[120px] border-b border-r border-border p-1.5 cursor-pointer
                                    transition-colors hover:bg-muted/30 relative group
                                    ${!dayInfo.isCurrentMonth ? 'bg-muted/20 opacity-40' : ''}
                                    ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}
                                    ${hasSaleHoliday ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}
                                `}>
                                {/* Date Number */}
                                <div className="flex items-start justify-between mb-1">
                                    <span className={`text-sm font-bold leading-none
                                        ${isToday ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                                        ${!dayInfo.isCurrentMonth ? 'text-muted-foreground' : ''}
                                    `}>
                                        {dayInfo.day}
                                    </span>
                                    {dayContent.length > 0 && (
                                        <span className="text-[9px] text-muted-foreground">
                                            {dayContent.length}📄
                                        </span>
                                    )}
                                </div>

                                {/* Holiday badges */}
                                {dayHolidays.map((h, i) => {
                                    const cat = CATEGORY_COLORS[h.category] || CATEGORY_COLORS.cultural
                                    return (
                                        <div key={i} className="mb-1 px-1 py-0.5 rounded text-[9px] font-bold truncate"
                                            style={{ backgroundColor: cat.bg, color: cat.text }}
                                            title={h.description}>
                                            {h.icon} {h.name}
                                        </div>
                                    )
                                })}

                                {/* Content items */}
                                {dayContent.slice(0, 3).map((item) => {
                                    const badge = FORMAT_BADGES[item.format] || FORMAT_BADGES.POST
                                    const stage = STAGE_PILLS[item.funnelStage]
                                    return (
                                        <div key={item.id}
                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item) }}
                                            className="mb-1 rounded transition-all hover:shadow-sm cursor-pointer">
                                            {/* Format badge */}
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <span className="text-[8px] px-1 py-px rounded font-bold uppercase"
                                                    style={{ backgroundColor: badge.bg, color: badge.color }}>
                                                    {badge.icon} {badge.label}
                                                </span>
                                                {stage && (
                                                    <span className="text-[8px] px-1 py-px rounded"
                                                        style={{ backgroundColor: stage.bg, color: stage.color }}>
                                                        {stage.label}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Title */}
                                            <p className="text-[10px] leading-tight line-clamp-2 text-foreground/80">
                                                {item.title}
                                            </p>
                                        </div>
                                    )
                                })}
                                {dayContent.length > 3 && (
                                    <p className="text-[9px] text-muted-foreground text-center">
                                        +{dayContent.length - 3} bài nữa
                                    </p>
                                )}

                                {/* Hover add button */}
                                {dayInfo.isCurrentMonth && dayContent.length === 0 && !hasHoliday && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-5 h-5 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Upcoming Holidays Sidebar */}
            <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-heading font-bold text-sm mb-3">🎉 Ngày lễ tháng {month}/{year}</h3>
                {monthHolidays.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Không có ngày lễ đặc biệt trong tháng này</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {monthHolidays.map((h, i) => {
                            const cat = CATEGORY_COLORS[h.category] || CATEGORY_COLORS.cultural
                            return (
                                <div key={i}
                                    onClick={() => setModalDate(h.fullDate)}
                                    className="p-2.5 rounded-lg border border-border hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-base">{h.icon}</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                                            style={{ backgroundColor: cat.bg, color: cat.text }}>
                                            {cat.label}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold mb-0.5">{h.name}</p>
                                    <p className="text-[10px] text-muted-foreground">Ngày {h.day}/{month}</p>
                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles className="w-3 h-3" /> Tạo content
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Content Detail Sidebar */}
            {selectedItem && (
                <div className="fixed inset-y-0 right-0 w-[380px] bg-card border-l border-border shadow-2xl z-50 animate-slide-in-right overflow-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading font-bold text-lg">Chi tiết nội dung</h3>
                            <button onClick={() => setSelectedItem(null)} className="p-1.5 rounded-lg hover:bg-muted">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Format & Stage */}
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const badge = FORMAT_BADGES[selectedItem.format] || FORMAT_BADGES.POST
                                    return (
                                        <span className="text-xs px-2 py-1 rounded font-bold"
                                            style={{ backgroundColor: badge.bg, color: badge.color }}>
                                            {badge.icon} {badge.label}
                                        </span>
                                    )
                                })()}
                                {(() => {
                                    const stage = STAGE_PILLS[selectedItem.funnelStage]
                                    return stage ? (
                                        <span className="text-xs px-2 py-1 rounded font-medium"
                                            style={{ backgroundColor: stage.bg, color: stage.color }}>
                                            {stage.label}
                                        </span>
                                    ) : null
                                })()}
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Tiêu đề</p>
                                <p className="font-medium text-sm">{selectedItem.title}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Ngày đăng</p>
                                <p className="text-sm">{new Date(selectedItem.scheduledDate).toLocaleDateString('vi-VN', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })}</p>
                            </div>

                            <Link href={`/dashboard/content/${selectedItem.id}`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium
                                gradient-brand text-white hover:opacity-90 transition-all">
                                <Eye className="w-4 h-4" /> Mở trong Editor
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Content Modal */}
            {modalDate && (
                <CalendarContentModal
                    date={modalDate}
                    holiday={modalHoliday}
                    onClose={() => setModalDate(null)}
                    onCreated={loadItems}
                />
            )}
        </div>
    )
}
