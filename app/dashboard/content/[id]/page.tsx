'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
    Quote, Undo, Redo, Sparkles, RefreshCw, Expand, Minimize2,
    Smartphone, Wand2, Save, ArrowLeft, CheckCircle, Send,
    ImageIcon, Loader2, Copy, Download, PenTool
} from 'lucide-react'

export default function ContentEditorPage() {
    const params = useParams()
    const router = useRouter()
    const contentId = params.id as string
    const isNew = contentId === 'new'

    const [title, setTitle] = useState('')
    const [format, setFormat] = useState('IMAGE_POST')
    const [funnelStage, setFunnelStage] = useState('AWARENESS')
    const [platform, setPlatform] = useState('Facebook')
    const [scheduledDate, setScheduledDate] = useState(
        new Date().toISOString().split('T')[0]
    )
    const [status, setStatus] = useState('DRAFT')
    const [saving, setSaving] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiResult, setAiResult] = useState('')
    const [aiTab, setAiTab] = useState<'write' | 'rewrite' | 'image'>('write')
    const [aiTopic, setAiTopic] = useState('')
    const [aiInstructions, setAiInstructions] = useState('')
    const [imagePrompt, setImagePrompt] = useState('')
    const [imageDescription, setImageDescription] = useState('')
    const [generatingImage, setGeneratingImage] = useState(false)
    const [workspaceId, setWorkspaceId] = useState('')
    const [loaded, setLoaded] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Bắt đầu viết nội dung... hoặc dùng AI để tạo nội dung tự động.',
            }),
        ],
        immediatelyRender: false,
        content: '',
    })

    // Load content from DB if editing
    useEffect(() => {
        if (isNew) {
            // Get default workspace
            fetch('/api/workspace/default').then(r => r.json()).then(data => {
                if (data.id) setWorkspaceId(data.id)
            }).catch(() => { })
            setLoaded(true)
            return
        }
        fetch(`/api/content/${contentId}`).then(r => r.json()).then(data => {
            if (data) {
                setTitle(data.title || '')
                setFormat(data.format || 'IMAGE_POST')
                setFunnelStage(data.funnelStage || 'AWARENESS')
                setPlatform(data.platform || 'Facebook')
                setStatus(data.status || 'DRAFT')
                setWorkspaceId(data.workspaceId || '')
                if (data.scheduledDate) {
                    setScheduledDate(new Date(data.scheduledDate).toISOString().split('T')[0])
                }
                if (data.body && editor) {
                    editor.commands.setContent(data.body)
                }
                if (data.aiImagePrompt) setImagePrompt(data.aiImagePrompt)
            }
            setLoaded(true)
        }).catch(() => setLoaded(true))
    }, [contentId, isNew, editor])

    // Save content
    const handleSave = useCallback(async () => {
        if (!title.trim()) return alert('Vui lòng nhập tiêu đề')
        setSaving(true)
        try {
            const body = editor?.getHTML() || ''
            const url = isNew ? '/api/content' : `/api/content/${contentId}`
            const method = isNew ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, body, format, funnelStage, platform, scheduledDate,
                    status, workspaceId, aiImagePrompt: imagePrompt,
                }),
            })
            const data = await res.json()
            if (isNew && data.id) {
                router.replace(`/dashboard/content/${data.id}`)
            }
        } catch (e) {
            console.error(e)
            alert('Lỗi khi lưu!')
        } finally {
            setSaving(false)
        }
    }, [title, editor, format, funnelStage, platform, scheduledDate, status, workspaceId, imagePrompt, contentId, isNew, router])

    // AI: Write content from scratch
    const handleAiWrite = async () => {
        if (!aiTopic.trim()) return
        setAiLoading(true)
        setAiResult('')
        try {
            const res = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'write',
                    topic: aiTopic,
                    funnelStage,
                    format,
                    platform,
                    additionalInstructions: aiInstructions,
                }),
            })
            const data = await res.json()
            if (data.success && data.result) {
                const r = data.result
                if (r.title) setTitle(r.title)
                const bodyHtml = r.body.replace(/\n/g, '<br/>')
                const fullContent = bodyHtml + (r.hashtags?.length
                    ? `<br/><br/><p>${r.hashtags.map((h: string) => `#${h}`).join(' ')}</p>`
                    : '') + (r.cta ? `<br/><p><strong>${r.cta}</strong></p>` : '')
                editor?.commands.setContent(fullContent)
                setAiResult('✅ Nội dung đã được tạo thành công!')
            }
        } catch {
            setAiResult('❌ Lỗi khi tạo nội dung. Vui lòng thử lại.')
        } finally {
            setAiLoading(false)
        }
    }

    // AI: Rewrite/transform existing content
    const handleAiAction = async (action: string) => {
        const text = editor?.getText() || ''
        if (!text.trim()) return alert('Vui lòng viết nội dung trước')
        setAiLoading(true)
        setAiResult('')
        try {
            const res = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, text }),
            })
            const data = await res.json()
            if (data.success) {
                setAiResult(data.result)
            }
        } catch {
            setAiResult('❌ Lỗi. Vui lòng thử lại.')
        } finally {
            setAiLoading(false)
        }
    }

    // AI: Generate image prompt/description
    const handleGenerateImagePrompt = async () => {
        const text = editor?.getText() || ''
        if (!text.trim() && !title.trim()) return
        setGeneratingImage(true)
        try {
            const res = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'imagePrompt',
                    text: text || title,
                    contentTitle: title,
                    brandName: '',
                }),
            })
            const data = await res.json()
            if (data.success) {
                setImagePrompt(data.prompt)
                // Now generate a detailed description
                const res2 = await fetch('/api/ai/generate-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'generateImageDescription',
                        prompt: data.prompt,
                    }),
                })
                const data2 = await res2.json()
                if (data2.success) {
                    setImageDescription(data2.description)
                }
            }
        } catch {
            // ignore
        } finally {
            setGeneratingImage(false)
        }
    }

    // Apply AI result to editor
    const applyAiResult = () => {
        if (aiResult && !aiResult.startsWith('✅') && !aiResult.startsWith('❌')) {
            editor?.commands.setContent(aiResult.replace(/\n/g, '<br/>'))
            setAiResult('')
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    if (!loaded) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const formats = [
        { value: 'IMAGE_POST', label: '🖼️ Image Post' },
        { value: 'VIDEO', label: '🎬 Video' },
        { value: 'CAROUSEL', label: '📸 Carousel' },
        { value: 'TEXT_ONLY', label: '📝 Text Only' },
        { value: 'STORY', label: '📱 Story' },
        { value: 'REEL', label: '🎵 Reel' },
    ]

    const funnelStages = [
        { value: 'AWARENESS', label: '👁️ Nhận biết', color: 'bg-blue-500' },
        { value: 'CONSIDERATION', label: '🤔 Cân nhắc', color: 'bg-amber-500' },
        { value: 'CONVERSION', label: '🎯 Chuyển đổi', color: 'bg-red-500' },
        { value: 'LOYALTY', label: '💚 Trung thành', color: 'bg-emerald-500' },
        { value: 'ADVOCACY', label: '📣 Lan tỏa', color: 'bg-violet-500' },
    ]

    const platforms = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Threads']

    return (
        <div className="flex flex-col h-full gap-0 animate-fade-in">
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard/content')}
                        className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold font-heading">
                            {isNew ? 'Tạo nội dung mới' : 'Chỉnh sửa nội dung'}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {isNew ? 'Dùng AI để viết nội dung tự động' : `ID: ${contentId}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status */}
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background">
                        <option value="DRAFT">📝 Nháp</option>
                        <option value="PENDING_REVIEW">⏳ Chờ duyệt</option>
                        <option value="APPROVED">✅ Đã duyệt</option>
                        <option value="SCHEDULED">📅 Đã lên lịch</option>
                        <option value="PUBLISHED">🚀 Đã đăng</option>
                    </select>

                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium
              bg-primary text-primary-foreground hover:bg-brand-red-dark transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Lưu
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 flex flex-col overflow-auto">
                    {/* Title */}
                    <div className="px-6 pt-4">
                        <input type="text" placeholder="Tiêu đề bài viết..."
                            value={title} onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-2xl font-bold font-heading bg-transparent border-none outline-none
                placeholder:text-muted-foreground/40"
                        />
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 px-6 py-3 border-b border-border flex-wrap">
                        <select value={format} onChange={(e) => setFormat(e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background">
                            {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <select value={funnelStage} onChange={(e) => setFunnelStage(e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background">
                            {funnelStages.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background">
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background"
                        />
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-muted/30">
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()}
                            active={editor?.isActive('bold')} icon={<Bold className="w-4 h-4" />} />
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()}
                            active={editor?.isActive('italic')} icon={<Italic className="w-4 h-4" />} />
                        <span className="w-px h-5 bg-border mx-1" />
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                            active={editor?.isActive('heading', { level: 1 })} icon={<Heading1 className="w-4 h-4" />} />
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                            active={editor?.isActive('heading', { level: 2 })} icon={<Heading2 className="w-4 h-4" />} />
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                            active={editor?.isActive('heading', { level: 3 })} icon={<Heading3 className="w-4 h-4" />} />
                        <span className="w-px h-5 bg-border mx-1" />
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            active={editor?.isActive('bulletList')} icon={<List className="w-4 h-4" />} />
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            active={editor?.isActive('orderedList')} icon={<ListOrdered className="w-4 h-4" />} />
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                            active={editor?.isActive('blockquote')} icon={<Quote className="w-4 h-4" />} />
                        <span className="w-px h-5 bg-border mx-1" />
                        <ToolbarButton onClick={() => editor?.chain().focus().undo().run()}
                            icon={<Undo className="w-4 h-4" />} />
                        <ToolbarButton onClick={() => editor?.chain().focus().redo().run()}
                            icon={<Redo className="w-4 h-4" />} />
                    </div>

                    {/* Editor */}
                    <div className="flex-1 overflow-auto px-6 py-4">
                        <EditorContent editor={editor} className="prose prose-sm max-w-none min-h-[400px]" />
                    </div>
                </div>

                {/* AI Sidebar */}
                <div className="w-[380px] border-l border-border bg-card flex flex-col overflow-hidden">
                    {/* AI Tabs */}
                    <div className="flex border-b border-border">
                        <button onClick={() => setAiTab('write')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors
                ${aiTab === 'write' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                            <PenTool className="w-3.5 h-3.5" /> Viết AI
                        </button>
                        <button onClick={() => setAiTab('rewrite')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors
                ${aiTab === 'rewrite' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                            <RefreshCw className="w-3.5 h-3.5" /> Chỉnh sửa AI
                        </button>
                        <button onClick={() => setAiTab('image')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors
                ${aiTab === 'image' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                            <ImageIcon className="w-3.5 h-3.5" /> Tạo ảnh
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        {/* Tab: AI Write Content */}
                        {aiTab === 'write' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                        ✨ Chủ đề / Yêu cầu
                                    </label>
                                    <textarea
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="VD: Giới thiệu bộ sưu tập mới mùa xuân, nhấn mạnh công nghệ chống nắng..."
                                        className="w-full h-24 text-sm px-3 py-2 rounded-lg border border-border bg-background
                      resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                        📝 Hướng dẫn thêm (tuỳ chọn)
                                    </label>
                                    <textarea
                                        value={aiInstructions}
                                        onChange={(e) => setAiInstructions(e.target.value)}
                                        placeholder="VD: Viết dưới dạng story, thêm emoji, tone vui vẻ..."
                                        className="w-full h-16 text-sm px-3 py-2 rounded-lg border border-border bg-background
                      resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <label className="text-muted-foreground mb-1 block">Phễu</label>
                                        <select value={funnelStage} onChange={(e) => setFunnelStage(e.target.value)}
                                            className="w-full px-2 py-1.5 rounded border border-border bg-background">
                                            {funnelStages.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-muted-foreground mb-1 block">Nền tảng</label>
                                        <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                                            className="w-full px-2 py-1.5 rounded border border-border bg-background">
                                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button onClick={handleAiWrite} disabled={aiLoading || !aiTopic.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium
                    gradient-brand text-white hover:opacity-90 transition-all disabled:opacity-50">
                                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    {aiLoading ? 'Đang viết...' : 'Tạo nội dung bằng AI ✨'}
                                </button>

                                {aiResult && (
                                    <div className={`p-3 rounded-lg text-sm ${aiResult.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : aiResult.startsWith('❌') ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                : 'bg-muted'
                                        }`}>
                                        {aiResult}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: AI Rewrite/Transform */}
                        {aiTab === 'rewrite' && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground mb-3">
                                    Chọn hành động để AI xử lý nội dung hiện tại trong editor:
                                </p>

                                <button onClick={() => handleAiAction('rewrite')} disabled={aiLoading}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition text-sm">
                                    <RefreshCw className="w-4 h-4 text-blue-500" /> Viết lại (Rewrite)
                                </button>
                                <button onClick={() => handleAiAction('expand')} disabled={aiLoading}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition text-sm">
                                    <Expand className="w-4 h-4 text-emerald-500" /> Mở rộng (Expand)
                                </button>
                                <button onClick={() => handleAiAction('summarize')} disabled={aiLoading}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition text-sm">
                                    <Minimize2 className="w-4 h-4 text-amber-500" /> Rút gọn (Summarize)
                                </button>

                                <div className="border-t border-border pt-2 mt-2" />
                                <p className="text-xs text-muted-foreground">Chuyển đổi định dạng:</p>

                                <button onClick={() => handleAiAction('facebook')} disabled={aiLoading}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition text-sm">
                                    <Send className="w-4 h-4 text-blue-600" /> Chuyển thành Facebook Post
                                </button>
                                <button onClick={() => handleAiAction('instagram')} disabled={aiLoading}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition text-sm">
                                    <Smartphone className="w-4 h-4 text-pink-500" /> Chuyển thành Instagram Caption
                                </button>
                                <button onClick={() => handleAiAction('tiktok')} disabled={aiLoading}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition text-sm">
                                    <Sparkles className="w-4 h-4 text-violet-500" /> Chuyển thành TikTok Script
                                </button>

                                {aiLoading && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        <span className="ml-2 text-sm text-muted-foreground">AI đang xử lý...</span>
                                    </div>
                                )}

                                {aiResult && !aiResult.startsWith('✅') && !aiResult.startsWith('❌') && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">Kết quả AI:</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => copyToClipboard(aiResult)}
                                                    className="p-1 rounded hover:bg-muted" title="Copy">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={applyAiResult}
                                                    className="p-1 rounded hover:bg-muted text-primary" title="Áp dụng vào editor">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted text-sm max-h-60 overflow-auto whitespace-pre-wrap">
                                            {aiResult}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: AI Image */}
                        {aiTab === 'image' && (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    AI sẽ tạo image prompt dựa trên nội dung bài viết, để bạn dùng với Midjourney/DALL-E/Canva AI.
                                </p>

                                <button onClick={handleGenerateImagePrompt} disabled={generatingImage}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium
                    gradient-brand text-white hover:opacity-90 transition-all disabled:opacity-50">
                                    {generatingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                    {generatingImage ? 'Đang tạo...' : 'Tạo Image Prompt từ nội dung'}
                                </button>

                                {imagePrompt && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">🎨 Image Prompt:</span>
                                            <button onClick={() => copyToClipboard(imagePrompt)}
                                                className="p-1 rounded hover:bg-muted" title="Copy prompt">
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="p-3 rounded-lg bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20
                      text-sm border border-violet-200 dark:border-violet-800">
                                            {imagePrompt}
                                        </div>
                                    </div>
                                )}

                                {imageDescription && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">📋 Mô tả visual:</span>
                                            <button onClick={() => copyToClipboard(imageDescription)}
                                                className="p-1 rounded hover:bg-muted" title="Copy">
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted text-sm max-h-40 overflow-auto">
                                            {imageDescription}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-border pt-3 mt-3">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Hoặc viết prompt thủ công:
                                    </p>
                                    <textarea
                                        value={imagePrompt}
                                        onChange={(e) => setImagePrompt(e.target.value)}
                                        placeholder="Describe the image you want..."
                                        className="w-full h-20 text-sm px-3 py-2 rounded-lg border border-border bg-background resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ToolbarButton({ onClick, active, icon }: {
    onClick: () => void; active?: boolean; icon: React.ReactNode
}) {
    return (
        <button onClick={onClick}
            className={`p-1.5 rounded-md transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
            {icon}
        </button>
    )
}
