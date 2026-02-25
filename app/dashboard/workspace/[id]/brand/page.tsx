'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Save, Loader2, CheckCircle
} from 'lucide-react'

const TONES = [
    { value: 'professional', label: 'Chuyên nghiệp', emoji: '💼' },
    { value: 'friendly', label: 'Thân thiện', emoji: '😊' },
    { value: 'luxurious', label: 'Sang trọng', emoji: '✨' },
    { value: 'youthful', label: 'Trẻ trung', emoji: '🎉' },
    { value: 'educational', label: 'Giáo dục', emoji: '📚' },
    { value: 'humorous', label: 'Hài hước', emoji: '😄' },
]

export default function BrandVoicePage() {
    const params = useParams()
    const router = useRouter()
    const wsId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [step, setStep] = useState(1)

    // Form data
    const [brandName, setBrandName] = useState('')
    const [industry, setIndustry] = useState('')
    const [coreProducts, setCoreProducts] = useState('')
    const [toneStyle, setToneStyle] = useState('professional')
    const [targetAge, setTargetAge] = useState('')
    const [targetLocation, setTargetLocation] = useState('')
    const [targetInterests, setTargetInterests] = useState('')
    const [keywords, setKeywords] = useState('')
    const [negativeKeywords, setNegativeKeywords] = useState('')
    const [customPrompt, setCustomPrompt] = useState('')

    useEffect(() => {
        fetch(`/api/workspace/${wsId}/brand`).then(r => r.json()).then(data => {
            if (data && data.brandName) {
                setBrandName(data.brandName || '')
                setIndustry(data.industry || '')
                setCoreProducts(
                    (() => { try { return JSON.parse(data.coreProducts || '[]').join(', ') } catch { return '' } })()
                )
                setToneStyle(data.toneStyle || 'professional')
                setTargetAge(data.targetAge || '')
                setTargetLocation(data.targetLocation || '')
                setTargetInterests(
                    (() => { try { return JSON.parse(data.targetInterests || '[]').join(', ') } catch { return '' } })()
                )
                setKeywords(
                    (() => { try { return JSON.parse(data.keywords || '[]').join(', ') } catch { return '' } })()
                )
                setNegativeKeywords(
                    (() => { try { return JSON.parse(data.negativeKeywords || '[]').join(', ') } catch { return '' } })()
                )
                setCustomPrompt(data.customPrompt || '')
            }
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [wsId])

    const handleSave = async () => {
        if (!brandName.trim() || !industry.trim()) {
            return alert('Vui lòng nhập Tên thương hiệu và Ngành hàng')
        }
        setSaving(true)
        try {
            await fetch(`/api/workspace/${wsId}/brand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandName,
                    industry,
                    coreProducts: JSON.stringify(coreProducts.split(',').map(s => s.trim()).filter(Boolean)),
                    toneStyle,
                    targetAge,
                    targetLocation,
                    targetInterests: JSON.stringify(targetInterests.split(',').map(s => s.trim()).filter(Boolean)),
                    keywords: JSON.stringify(keywords.split(',').map(s => s.trim()).filter(Boolean)),
                    negativeKeywords: JSON.stringify(negativeKeywords.split(',').map(s => s.trim()).filter(Boolean)),
                    customPrompt,
                }),
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) {
            console.error(e)
            alert('Lỗi khi lưu!')
        } finally {
            setSaving(false)
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
        <div className="p-6 max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push(`/dashboard/workspace/${wsId}`)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading">🎨 Brand Voice</h1>
                        <p className="text-muted-foreground text-sm">Thiết lập giọng nói thương hiệu cho AI</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            gradient-brand text-white hover:opacity-90 transition-all disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Đã lưu ✅' : 'Lưu Brand Voice'}
                </button>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4].map(s => (
                    <button key={s} onClick={() => setStep(s)}
                        className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'
                            }`} />
                ))}
            </div>
            <p className="text-xs text-muted-foreground mb-6">Bước {step}/4</p>

            {/* Step 1: Brand Info */}
            {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="font-heading font-bold text-lg">Thông tin thương hiệu</h2>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Tên thương hiệu *</label>
                        <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)}
                            placeholder="VD: SOMA, Nike, Vinamilk..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Ngành hàng *</label>
                        <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                            placeholder="VD: Mỹ phẩm, Thực phẩm, Công nghệ..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Sản phẩm/Dịch vụ chính</label>
                        <input type="text" value={coreProducts} onChange={(e) => setCoreProducts(e.target.value)}
                            placeholder="Nhập cách nhau bởi dấu phẩy: Son môi, Kem dưỡng, Serum..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <button onClick={() => setStep(2)}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground
              hover:bg-brand-red-dark transition-colors">
                        Tiếp theo →
                    </button>
                </div>
            )}

            {/* Step 2: Tone & Voice */}
            {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="font-heading font-bold text-lg">Tone & Voice</h2>
                    <p className="text-sm text-muted-foreground">Chọn giọng điệu phù hợp với thương hiệu</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {TONES.map(t => (
                            <button key={t.value} onClick={() => setToneStyle(t.value)}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${toneStyle === t.value
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border hover:border-primary/30'
                                    }`}>
                                <span className="text-2xl block mb-1">{t.emoji}</span>
                                <span className="text-sm font-medium">{t.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">← Quay lại</button>
                        <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground">Tiếp theo →</button>
                    </div>
                </div>
            )}

            {/* Step 3: Target Audience */}
            {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="font-heading font-bold text-lg">Đối tượng mục tiêu</h2>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Độ tuổi</label>
                        <input type="text" value={targetAge} onChange={(e) => setTargetAge(e.target.value)}
                            placeholder="VD: 18-35, 25-45..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Vị trí</label>
                        <input type="text" value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)}
                            placeholder="VD: Hồ Chí Minh, Hà Nội, Toàn quốc..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Sở thích</label>
                        <input type="text" value={targetInterests} onChange={(e) => setTargetInterests(e.target.value)}
                            placeholder="Nhập cách nhau bởi dấu phẩy: Làm đẹp, Thời trang, Du lịch..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">← Quay lại</button>
                        <button onClick={() => setStep(4)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground">Tiếp theo →</button>
                    </div>
                </div>
            )}

            {/* Step 4: Keywords & AI */}
            {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="font-heading font-bold text-lg">Keywords & Hướng dẫn AI</h2>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Keywords chính</label>
                        <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                            placeholder="VD: skincare, serum, dưỡng da..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Keywords cấm</label>
                        <input type="text" value={negativeKeywords} onChange={(e) => setNegativeKeywords(e.target.value)}
                            placeholder="Từ khóa AI không nên dùng..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Hướng dẫn tùy chỉnh cho AI</label>
                        <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="VD: Luôn nhắc đến ưu đãi, Không dùng quá nhiều emoji, Viết câu ngắn gọn..."
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm h-24 resize-none" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">← Quay lại</button>
                        <button onClick={handleSave} disabled={saving}
                            className="px-6 py-2.5 rounded-lg text-sm font-medium gradient-brand text-white disabled:opacity-50">
                            {saving ? 'Đang lưu...' : saved ? '✅ Đã lưu!' : '💾 Lưu Brand Voice'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
