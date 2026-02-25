'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Plus, Building2, FileText, Users, Trash2, Loader2, ArrowRight
} from 'lucide-react'

interface Workspace {
    id: string
    name: string
    slug: string
    description: string | null
    createdAt: string
    brand: { industry: string; brandName: string } | null
    _count: { members: number; contentItems: number; campaigns: number }
}

export default function WorkspaceListPage() {
    const router = useRouter()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const loadWorkspaces = () => {
        fetch('/api/workspace').then(r => r.json()).then(data => {
            setWorkspaces(Array.isArray(data) ? data : [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { loadWorkspaces() }, [])

    const handleCreate = async () => {
        if (!name.trim()) return
        setCreating(true)
        try {
            const res = await fetch('/api/workspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            })
            const ws = await res.json()
            setName('')
            setDescription('')
            setShowForm(false)
            loadWorkspaces()
            if (ws.id) router.push(`/dashboard/workspace/${ws.id}`)
        } catch (e) {
            console.error(e)
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa workspace này?')) return
        await fetch(`/api/workspace/${id}`, { method: 'DELETE' })
        loadWorkspaces()
    }

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
                    <h1 className="text-2xl font-bold font-heading">Workspace</h1>
                    <p className="text-muted-foreground text-sm mt-1">Quản lý workspace và thương hiệu</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            gradient-brand text-white hover:opacity-90 transition-all">
                    <Plus className="w-4 h-4" /> Tạo Workspace
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="p-5 rounded-xl border border-border bg-card animate-scale-in">
                    <h3 className="font-heading font-bold mb-3">Tạo Workspace mới</h3>
                    <div className="space-y-3">
                        <input type="text" placeholder="Tên workspace..." value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm
                focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        <textarea placeholder="Mô tả (tùy chọn)..." value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm h-20 resize-none" />
                        <div className="flex gap-2">
                            <button onClick={handleCreate} disabled={creating || !name.trim()}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground
                  hover:bg-brand-red-dark disabled:opacity-50 transition-colors">
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo'}
                            </button>
                            <button onClick={() => setShowForm(false)}
                                className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workspace Grid */}
            {workspaces.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p className="font-medium text-lg">Chưa có workspace nào</p>
                    <p className="text-sm mt-1">Tạo workspace đầu tiên để bắt đầu!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((ws) => (
                        <div key={ws.id}
                            className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <button onClick={() => handleDelete(ws.id)}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400
                    hover:text-red-600 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="font-heading font-bold text-lg">{ws.name}</h3>
                            {ws.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ws.description}</p>
                            )}
                            {ws.brand && (
                                <p className="text-xs text-muted-foreground mt-2">🏢 {ws.brand.brandName} • {ws.brand.industry}</p>
                            )}
                            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {ws._count.contentItems} bài</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ws._count.members} member</span>
                            </div>
                            <Link href={`/dashboard/workspace/${ws.id}`}
                                className="flex items-center gap-1 mt-4 text-sm text-primary hover:underline font-medium">
                                Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
