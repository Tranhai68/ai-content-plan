'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Save, Loader2, CheckCircle, Palette, Type, MessageSquare,
    Target, ShieldCheck, ShieldX, Sparkles, ImageIcon, BookOpen
} from 'lucide-react'

const TONES = [
    { value: 'professional', label: 'Chuyên nghiệp', emoji: '💼', desc: 'Ngôn ngữ trang trọng, đáng tin cậy' },
    { value: 'friendly', label: 'Thân thiện', emoji: '😊', desc: 'Gần gũi, dễ tiếp cận' },
    { value: 'luxurious', label: 'Sang trọng', emoji: '✨', desc: 'Cao cấp, tinh tế' },
    { value: 'youthful', label: 'Trẻ trung', emoji: '🎉', desc: 'Năng động, vui vẻ' },
    { value: 'educational', label: 'Giáo dục', emoji: '📚', desc: 'Chia sẻ kiến thức, hướng dẫn' },
    { value: 'humorous', label: 'Hài hước', emoji: '😄', desc: 'Vui nhộn, sáng tạo' },
    { value: 'inspiring', label: 'Truyền cảm hứng', emoji: '🔥', desc: 'Tạo động lực, phấn khích' },
    { value: 'minimalist', label: 'Tối giản', emoji: '🎯', desc: 'Ngắn gọn, súc tích' },
]

const INDUSTRIES = [
    'Mỹ phẩm & Làm đẹp', 'Thời trang', 'Thực phẩm & Đồ uống', 'Công nghệ',
    'Giáo dục', 'Bất động sản', 'Y tế & Sức khỏe', 'Du lịch',
    'Tài chính', 'Thương mại điện tử', 'F&B / Nhà hàng', 'Khác'
]

const DEFAULT_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#000000'
]

interface BrandData {
    brandName: string
    industry: string
    coreProducts: string
    toneStyle: string
    targetAge: string
    targetLocation: string
    targetInterests: string
    keywords: string
    negativeKeywords: string
    customPrompt: string
    // New Brand Guideline fields
    slogan: string
    brandMission: string
    brandStory: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontPrimary: string
    fontSecondary: string
    socialVoiceExample: string
    dos: string
    donts: string
    hashtagStrategy: string
    competitorBrands: string
}

export default function BrandProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [activeTab, setActiveTab] = useState<'identity' | 'voice' | 'audience' | 'guidelines' | 'social'>('identity')
    const [wsId, setWsId] = useState('')

    const [data, setData] = useState<BrandData>({
        brandName: '', industry: '', coreProducts: '', toneStyle: 'professional',
        targetAge: '', targetLocation: '', targetInterests: '',
        keywords: '', negativeKeywords: '', customPrompt: '',
        slogan: '', brandMission: '', brandStory: '',
        primaryColor: '#ef4444', secondaryColor: '#3b82f6', accentColor: '#eab308',
        fontPrimary: '', fontSecondary: '',
        socialVoiceExample: '', dos: '', donts: '',
        hashtagStrategy: '', competitorBrands: '',
    })

    useEffect(() => {
        // Get default workspace then load brand
        fetch('/api/workspace/default')
            .then(r => r.json())
            .then(ws => {
                if (ws?.id) {
                    setWsId(ws.id)
                    return fetch(`/api/workspace/${ws.id}/brand`)
                }
                throw new Error('No workspace')
            })
            .then(r => r.json())
            .then(brand => {
                if (brand && brand.brandName) {
                    setData(prev => ({
                        ...prev,
                        brandName: brand.brandName || '',
                        industry: brand.industry || '',
                        coreProducts: safeParseArr(brand.coreProducts),
                        toneStyle: brand.toneStyle || 'professional',
                        targetAge: brand.targetAge || '',
                        targetLocation: brand.targetLocation || '',
                        targetInterests: safeParseArr(brand.targetInterests),
                        keywords: safeParseArr(brand.keywords),
                        negativeKeywords: safeParseArr(brand.negativeKeywords),
                        customPrompt: brand.customPrompt || '',
                        // Load extended fields from customPrompt JSON if available
                        ...safeParseExtended(brand.customPrompt),
                    }))
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const safeParseArr = (val: string) => {
        try { return JSON.parse(val || '[]').join(', ') } catch { return val || '' }
    }

    const safeParseExtended = (val: string): Partial<BrandData> => {
        if (!val) return {}
        try {
            const parsed = JSON.parse(val)
            if (typeof parsed === 'object' && parsed.extended) return parsed.extended
        } catch { /* not JSON, it's a plain string */ }
        return {}
    }

    const updateField = (key: keyof BrandData, value: string) => {
        setData(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        if (!data.brandName.trim()) return alert('Vui lòng nhập Tên thương hiệu')
        if (!wsId) return alert('Workspace chưa sẵn sàng')
        setSaving(true)
        try {
            const extendedData = {
                slogan: data.slogan, brandMission: data.brandMission, brandStory: data.brandStory,
                primaryColor: data.primaryColor, secondaryColor: data.secondaryColor, accentColor: data.accentColor,
                fontPrimary: data.fontPrimary, fontSecondary: data.fontSecondary,
                socialVoiceExample: data.socialVoiceExample, dos: data.dos, donts: data.donts,
                hashtagStrategy: data.hashtagStrategy, competitorBrands: data.competitorBrands,
            }

            await fetch(`/api/workspace/${wsId}/brand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandName: data.brandName,
                    industry: data.industry,
                    coreProducts: JSON.stringify(data.coreProducts.split(',').map(s => s.trim()).filter(Boolean)),
                    toneStyle: data.toneStyle,
                    targetAge: data.targetAge,
                    targetLocation: data.targetLocation,
                    targetInterests: JSON.stringify(data.targetInterests.split(',').map(s => s.trim()).filter(Boolean)),
                    keywords: JSON.stringify(data.keywords.split(',').map(s => s.trim()).filter(Boolean)),
                    negativeKeywords: JSON.stringify(data.negativeKeywords.split(',').map(s => s.trim()).filter(Boolean)),
                    customPrompt: JSON.stringify({ text: data.customPrompt || '', extended: extendedData }),
                }),
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch {
            alert('Lỗi khi lưu!')
        } finally {
            setSaving(false)
        }
    }

    const completionPct = (() => {
        const fields = [data.brandName, data.industry, data.toneStyle, data.targetAge, data.slogan, data.brandMission]
        const filled = fields.filter(f => f && f.trim().length > 0).length
        return Math.round((filled / fields.length) * 100)
    })()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const tabs = [
        { key: 'identity' as const, label: 'Thông tin', icon: BookOpen, emoji: '🏢' },
        { key: 'voice' as const, label: 'Tone & Voice', icon: MessageSquare, emoji: '🎤' },
        { key: 'audience' as const, label: 'Đối tượng', icon: Target, emoji: '🎯' },
        { key: 'guidelines' as const, label: 'Brand Guidelines', icon: Palette, emoji: '🎨' },
        { key: 'social' as const, label: 'Social & AI', icon: Sparkles, emoji: '✨' },
    ]

    return (
        <div className="p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                        <Palette className="w-6 h-6 text-violet-500" /> Brand Profile
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Thiết lập hồ sơ thương hiệu để AI tạo nội dung cá nhân hoá
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Completion */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                        <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${completionPct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{completionPct}%</span>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                        bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Đã lưu ✅' : 'Lưu Brand Profile'}
                    </button>
                </div>
            </div>

            {/* Brand Preview Card */}
            {data.brandName && (
                <div className="mb-6 p-4 rounded-xl border border-border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                        style={{ backgroundColor: data.primaryColor || '#6366f1' }}>
                        {data.brandName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-heading font-bold">{data.brandName}</h3>
                        {data.slogan && <p className="text-xs text-muted-foreground italic">&ldquo;{data.slogan}&rdquo;</p>}
                        <div className="flex items-center gap-2 mt-1">
                            {data.industry && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                                    {data.industry}
                                </span>
                            )}
                            {data.toneStyle && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 font-medium">
                                    {TONES.find(t => t.value === data.toneStyle)?.emoji} {TONES.find(t => t.value === data.toneStyle)?.label}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Color swatches */}
                    <div className="flex gap-1.5">
                        {[data.primaryColor, data.secondaryColor, data.accentColor].filter(Boolean).map((c, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/30 border border-border">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.key
                            ? 'bg-card shadow-sm text-foreground border border-border'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}>
                        <span>{tab.emoji}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-5 animate-fade-in max-w-4xl">
                {/* ============ TAB 1: Identity ============ */}
                {activeTab === 'identity' && (
                    <>
                        <SectionCard title="Thông tin cơ bản" icon="🏢">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Tên thương hiệu *" value={data.brandName}
                                    onChange={v => updateField('brandName', v)} placeholder="VD: SOMA, Nike, Vinamilk..." />
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Ngành hàng *</label>
                                    <select value={data.industry} onChange={e => updateField('industry', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                                        <option value="">Chọn ngành hàng</option>
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                            <InputField label="Sản phẩm / Dịch vụ chính" value={data.coreProducts}
                                onChange={v => updateField('coreProducts', v)} placeholder="Nhập cách nhau bởi dấu phẩy: Son môi, Kem dưỡng, Serum..." />
                        </SectionCard>

                        <SectionCard title="Thương hiệu & Sứ mệnh" icon="💎">
                            <InputField label="Slogan / Tagline" value={data.slogan}
                                onChange={v => updateField('slogan', v)} placeholder="VD: Just Do It, Think Different..." />
                            <InputField label="Sứ mệnh thương hiệu (Brand Mission)" value={data.brandMission}
                                onChange={v => updateField('brandMission', v)} placeholder="Mô tả ngắn gọn sứ mệnh và giá trị cốt lõi..." textarea />
                            <InputField label="Câu chuyện thương hiệu (Brand Story)" value={data.brandStory}
                                onChange={v => updateField('brandStory', v)} placeholder="Kể câu chuyện về nguồn gốc, tầm nhìn, và hành trình phát triển..." textarea rows={4} />
                        </SectionCard>
                    </>
                )}

                {/* ============ TAB 2: Voice ============ */}
                {activeTab === 'voice' && (
                    <>
                        <SectionCard title="Giọng điệu thương hiệu" icon="🎤">
                            <p className="text-xs text-muted-foreground mb-3">Chọn tone phù hợp — AI sẽ viết nội dung theo giọng văn này</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {TONES.map(t => (
                                    <button key={t.value} onClick={() => updateField('toneStyle', t.value)}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${data.toneStyle === t.value
                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md'
                                            : 'border-border hover:border-violet-300'
                                            }`}>
                                        <span className="text-xl block mb-0.5">{t.emoji}</span>
                                        <span className="text-xs font-bold block">{t.label}</span>
                                        <span className="text-[9px] text-muted-foreground">{t.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="Ví dụ giọng văn Social" icon="💬">
                            <InputField label="Ví dụ bài viết mẫu" value={data.socialVoiceExample}
                                onChange={v => updateField('socialVoiceExample', v)}
                                placeholder="Paste 1-2 bài viết mẫu mà bạn muốn AI học theo giọng văn..." textarea rows={5} />
                            <p className="text-[10px] text-muted-foreground">
                                💡 Tip: Paste bài viết Facebook/Instagram mà bạn thấy đúng tone nhất. AI sẽ phân tích và bắt chước giọng văn này.
                            </p>
                        </SectionCard>
                    </>
                )}

                {/* ============ TAB 3: Audience ============ */}
                {activeTab === 'audience' && (
                    <>
                        <SectionCard title="Khách hàng mục tiêu" icon="🎯">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Độ tuổi" value={data.targetAge}
                                    onChange={v => updateField('targetAge', v)} placeholder="VD: 18-35, 25-45..." />
                                <InputField label="Vị trí địa lý" value={data.targetLocation}
                                    onChange={v => updateField('targetLocation', v)} placeholder="VD: HCM, Hà Nội, Toàn quốc..." />
                            </div>
                            <InputField label="Sở thích & Hành vi" value={data.targetInterests}
                                onChange={v => updateField('targetInterests', v)} placeholder="VD: Làm đẹp, Thời trang, Skincare, Gym..." />
                            <InputField label="Đối thủ cạnh tranh" value={data.competitorBrands}
                                onChange={v => updateField('competitorBrands', v)} placeholder="VD: L'Oréal, Innisfree, The Ordinary..." />
                        </SectionCard>
                    </>
                )}

                {/* ============ TAB 4: Brand Guidelines ============ */}
                {activeTab === 'guidelines' && (
                    <>
                        <SectionCard title="Bảng màu thương hiệu" icon="🎨">
                            <div className="grid grid-cols-3 gap-4">
                                <ColorPicker label="Màu chính (Primary)" value={data.primaryColor}
                                    onChange={v => updateField('primaryColor', v)} />
                                <ColorPicker label="Màu phụ (Secondary)" value={data.secondaryColor}
                                    onChange={v => updateField('secondaryColor', v)} />
                                <ColorPicker label="Màu nhấn (Accent)" value={data.accentColor}
                                    onChange={v => updateField('accentColor', v)} />
                            </div>
                            {/* Quick color palette */}
                            <div className="mt-3">
                                <p className="text-[10px] text-muted-foreground mb-1.5">Gợi ý màu phổ biến:</p>
                                <div className="flex gap-1.5">
                                    {DEFAULT_COLORS.map(c => (
                                        <button key={c} onClick={() => updateField('primaryColor', c)}
                                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                            style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Typography" icon="🔤">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Font chính (Heading)" value={data.fontPrimary}
                                    onChange={v => updateField('fontPrimary', v)} placeholder="VD: Montserrat, Roboto, Open Sans..." />
                                <InputField label="Font phụ (Body)" value={data.fontSecondary}
                                    onChange={v => updateField('fontSecondary', v)} placeholder="VD: Inter, Lato, Source Sans Pro..." />
                            </div>
                        </SectionCard>

                        <SectionCard title="Do's & Don'ts" icon="📋">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-emerald-600 mb-1.5 block flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> NÊN LÀM (Do&apos;s)
                                    </label>
                                    <textarea value={data.dos} onChange={e => updateField('dos', e.target.value)}
                                        placeholder="- Dùng emoji vừa phải&#10;- Kết thúc bằng CTA rõ ràng&#10;- Sử dụng tiếng Việt tự nhiên"
                                        className="w-full px-3 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 text-sm h-32 resize-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-red-600 mb-1.5 block flex items-center gap-1">
                                        <ShieldX className="w-3.5 h-3.5" /> KHÔNG NÊN (Don&apos;ts)
                                    </label>
                                    <textarea value={data.donts} onChange={e => updateField('donts', e.target.value)}
                                        placeholder="- Không dùng tiếng lóng&#10;- Không copy content đối thủ&#10;- Không spam hashtag"
                                        className="w-full px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10 text-sm h-32 resize-none focus:ring-2 focus:ring-red-500/20 transition-all" />
                                </div>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ============ TAB 5: Social & AI ============ */}
                {activeTab === 'social' && (
                    <>
                        <SectionCard title="Keywords & SEO" icon="🔍">
                            <InputField label="Keywords chính" value={data.keywords}
                                onChange={v => updateField('keywords', v)} placeholder="VD: skincare, serum, dưỡng da, làm đẹp..." />
                            <InputField label="Keywords cấm (AI không nên dùng)" value={data.negativeKeywords}
                                onChange={v => updateField('negativeKeywords', v)} placeholder="Từ khóa AI tuyệt đối không dùng..." />
                            <InputField label="Chiến lược Hashtag" value={data.hashtagStrategy}
                                onChange={v => updateField('hashtagStrategy', v)}
                                placeholder="VD: #TenThuongHieu #SanPham #NganhHang — mỗi bài 5-10 hashtags" textarea />
                        </SectionCard>

                        <SectionCard title="Hướng dẫn AI tùy chỉnh" icon="🤖">
                            <InputField label="Prompt tùy chỉnh cho AI" value={data.customPrompt}
                                onChange={v => updateField('customPrompt', v)}
                                placeholder="VD: Luôn nhắc đến ưu đãi, không dùng quá nhiều emoji, viết câu ngắn gọn, kết thúc bằng câu hỏi tương tác..." textarea rows={4} />
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    💡 <strong>Tip:</strong> AI sẽ sử dụng TẤT CẢ thông tin trong Brand Profile để tạo content phù hợp với thương hiệu.
                                    Càng điền chi tiết, content AI tạo ra sẽ càng chính xác và đúng tone.
                                </p>
                            </div>
                        </SectionCard>
                    </>
                )}
            </div>
        </div>
    )
}

// ===== Reusable Components =====

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-heading font-bold text-sm flex items-center gap-2">
                <span className="text-lg">{icon}</span> {title}
            </h3>
            {children}
        </div>
    )
}

function InputField({ label, value, onChange, placeholder, textarea, rows }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; textarea?: boolean; rows?: number
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">{label}</label>
            {textarea ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    rows={rows || 3}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm resize-none
                    focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
            ) : (
                <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm
                    focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
            )}
        </div>
    )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <input type="color" value={value} onChange={e => onChange(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border" />
                </div>
                <input type="text" value={value} onChange={e => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono uppercase"
                    maxLength={7} />
            </div>
        </div>
    )
}
