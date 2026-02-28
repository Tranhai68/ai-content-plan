'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, StickyNote, Wand2 } from 'lucide-react'
import { CONTENT_TYPES, type Holiday } from '@/lib/constants/vietnamese-holidays'

interface CalendarContentModalProps {
    date: string // YYYY-MM-DD
    holiday?: Holiday & { fullDate: string; day: number }
    onClose: () => void
    onCreated: () => void
}

const FUNNEL_STAGES = [
    { value: 'AWARENESS', label: 'Nhận biết (Awareness)', icon: '👁️' },
    { value: 'CONSIDERATION', label: 'Cân nhắc (Consideration)', icon: '🤔' },
    { value: 'CONVERSION', label: 'Chuyển đổi (Conversion)', icon: '🎯' },
    { value: 'LOYALTY', label: 'Trung thành (Loyalty)', icon: '💚' },
    { value: 'ADVOCACY', label: 'Lan tỏa (Advocacy)', icon: '📣' },
]

export default function CalendarContentModal({ date, holiday, onClose, onCreated }: CalendarContentModalProps) {
    const [activeTab, setActiveTab] = useState<'ai' | 'note'>('ai')
    const [contentType, setContentType] = useState('POST')
    const [funnelStage, setFunnelStage] = useState('AWARENESS')
    const [additionalInfo, setAdditionalInfo] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [aiResult, setAiResult] = useState('')

    const dateObj = new Date(date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('vi-VN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })

    const selectedType = CONTENT_TYPES.find(t => t.value === contentType)

    const handleGenerate = async () => {
        setLoading(true)
        setAiResult('')
        try {
            // Get workspace
            const wsRes = await fetch('/api/workspace/default')
            const ws = await wsRes.json()

            const topic = holiday
                ? `Tạo nội dung cho ngày ${holiday.name} (${formattedDate}). Gợi ý: ${holiday.contentSuggestions.join(', ')}`
                : `Tạo nội dung cho ngày ${formattedDate}`

            const res = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'write',
                    topic: additionalInfo ? `${topic}. Yêu cầu: ${additionalInfo}` : topic,
                    funnelStage,
                    format: contentType,
                    platform: 'Facebook',
                    additionalInstructions: holiday ? `Liên quan đến ${holiday.name}: ${holiday.description}` : '',
                }),
            })
            const data = await res.json()
            if (data.success && data.result) {
                // Save to DB
                const saveRes = await fetch('/api/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: data.result.title || `${holiday?.name || 'Content'} - ${formattedDate}`,
                        body: data.result.body || '',
                        format: contentType,
                        funnelStage,
                        platform: 'Facebook',
                        scheduledDate: date,
                        status: 'DRAFT',
                        workspaceId: ws.id,
                    }),
                })
                const saved = await saveRes.json()
                if (saved.id) {
                    setAiResult('✅ Nội dung đã được tạo và lưu vào lịch!')
                    setTimeout(() => {
                        onCreated()
                        onClose()
                    }, 1200)
                }
            } else {
                setAiResult('❌ Lỗi khi tạo nội dung. Hãy kiểm tra cấu hình Workspace.')
            }
        } catch {
            setAiResult('❌ Lỗi kết nối. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-card rounded-2xl w-[520px] max-h-[90vh] overflow-auto shadow-2xl animate-scale-in border border-border">
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-border">
                    <div className="flex items-start justify-between">
                        <div>
                            {holiday && (
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold text-white"
                                        style={{
                                            backgroundColor: holiday.category === 'shopping' ? '#dc2626'
                                                : holiday.category === 'holiday' ? '#2563eb'
                                                    : '#16a34a'
                                        }}>
                                        {holiday.icon} {holiday.category === 'shopping' ? 'SALE' : holiday.category.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
                                </div>
                            )}
                            <h2 className="text-xl font-bold font-heading">
                                {holiday ? (
                                    <>
                                        <span className="text-primary">[{holiday.name}]</span>{' '}
                                        {holiday.description}
                                    </>
                                ) : (
                                    <>📅 Tạo nội dung - {formattedDate}</>
                                )}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button onClick={() => setActiveTab('ai')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'ai'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}>
                        <Sparkles className="w-4 h-4" /> Nội dung AI
                    </button>
                    <button onClick={() => setActiveTab('note')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'note'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}>
                        <StickyNote className="w-4 h-4" /> Ghi chú & Reminder
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'ai' ? (
                        <div className="space-y-4">
                            {/* Content Type */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                                    Loại Content
                                </label>
                                <select value={contentType} onChange={(e) => setContentType(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                                    {CONTENT_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Brand Profile Info */}
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <span className="text-lg">🏢</span>
                                <div>
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                        Áp dụng Hồ Sơ Thương Hiệu
                                    </p>
                                    <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">
                                        Nội dung sẽ được cá nhân hóa theo giọng văn và khách hàng mục tiêu.
                                    </p>
                                </div>
                            </div>

                            {/* Funnel Stage */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                                    Giai đoạn Phễu Marketing
                                </label>
                                <select value={funnelStage} onChange={(e) => setFunnelStage(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                                    {FUNNEL_STAGES.map(s => (
                                        <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Holiday Content Suggestions */}
                            {holiday && holiday.contentSuggestions.length > 0 && (
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                                        💡 Gợi ý content cho {holiday.name}
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {holiday.contentSuggestions.map((sug, i) => (
                                            <button key={i} onClick={() => setAdditionalInfo(prev => prev ? `${prev}, ${sug}` : sug)}
                                                className="px-2.5 py-1 rounded-full text-xs border border-border hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors">
                                                {sug}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Info */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                                    Thông tin bổ sung / Yêu cầu cụ thể <span className="text-muted-foreground/50">(Tùy chọn)</span>
                                </label>
                                <textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)}
                                    placeholder="Nhập tên sản phẩm, chương trình khuyến mãi, hoặc thông tin cụ thể bạn muốn AI thêm vào bài viết..."
                                    className="w-full h-24 text-sm px-3 py-2.5 rounded-lg border border-border bg-background resize-none
                                    focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <p className="text-[10px] text-muted-foreground/50 text-right mt-1">Tự động lưu nhập mỗi 5s</p>
                            </div>

                            {/* AI Result */}
                            {aiResult && (
                                <div className={`p-3 rounded-lg text-sm ${aiResult.startsWith('✅')
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    }`}>
                                    {aiResult}
                                </div>
                            )}

                            {/* CTA Button */}
                            <button onClick={handleGenerate} disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                                gradient-brand text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-red-200 dark:shadow-red-900/20">
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo nội dung...</>
                                ) : (
                                    <><Wand2 className="w-4 h-4" /> ✨ Tạo nội dung {selectedType?.label} ngay</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                                    📝 Ghi chú cho ngày {dateObj.toLocaleDateString('vi-VN')}
                                </label>
                                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                                    placeholder="Viết ghi chú, ý tưởng, hoặc nhắc nhở cho ngày này..."
                                    className="w-full h-40 text-sm px-3 py-2.5 rounded-lg border border-border bg-background resize-none
                                    focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            {holiday && (
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                                        {holiday.icon} Ngày lễ: {holiday.name}
                                    </p>
                                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                                        {holiday.description}
                                    </p>
                                </div>
                            )}

                            <button className="w-full py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors">
                                💾 Lưu ghi chú
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
