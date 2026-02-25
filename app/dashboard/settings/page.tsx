'use client'

import { Settings, User, Bell, Palette, Shield, Key, Globe } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')
    const [geminiKey, setGeminiKey] = useState('')

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-7 h-7 text-brand-red" />
                    Cài đặt
                </h1>
                <p className="text-muted-foreground mt-1">Quản lý tài khoản và cấu hình hệ thống</p>
            </div>

            <div className="flex gap-6">
                {/* Tab nav */}
                <div className="w-48 flex-shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                                activeTab === tab.id
                                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 bg-card rounded-xl border border-border p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="font-heading font-semibold text-foreground text-lg">Hồ sơ cá nhân</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                                    A
                                </div>
                                <div>
                                    <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
                                        Thay ảnh đại diện
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Họ tên</label>
                                    <input type="text" defaultValue="Admin" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                                    <input type="email" defaultValue="admin@example.com" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                            </div>
                            <button className="px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium">Cập nhật hồ sơ</button>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="font-heading font-semibold text-foreground text-lg flex items-center gap-2">
                                <Key className="w-5 h-5 text-brand-red" />
                                API Keys
                            </h2>
                            <p className="text-sm text-muted-foreground">Cấu hình API keys cho các dịch vụ AI</p>

                            <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-sm font-semibold text-foreground">Google Gemini API</h3>
                                </div>
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Nhập Gemini API Key..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lấy API key miễn phí tại{' '}
                                    <a href="https://aistudio.google.com/apikey" target="_blank" className="text-brand-red hover:underline">
                                        Google AI Studio →
                                    </a>
                                </p>
                            </div>

                            <button className="px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium">Lưu API Keys</button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="font-heading font-semibold text-foreground text-lg">Thông báo</h2>
                            {[
                                { label: 'Email khi bài viết được duyệt', enabled: true },
                                { label: 'Nhắc nhở khi đến giờ đăng bài', enabled: true },
                                { label: 'Cảnh báo AI Audit hàng tuần', enabled: false },
                                { label: 'Thông báo khi có thành viên mới', enabled: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <span className="text-sm text-foreground">{item.label}</span>
                                    <button className={cn(
                                        'relative w-10 h-6 rounded-full transition-colors',
                                        item.enabled ? 'bg-brand-red' : 'bg-muted'
                                    )}>
                                        <div className={cn(
                                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                                            item.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                                        )} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="font-heading font-semibold text-foreground text-lg">Giao diện</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 rounded-xl border-2 border-brand-red bg-white text-center">
                                    <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                        <span className="text-gray-800 text-sm font-medium">Light</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">Sáng</p>
                                </button>
                                <button className="p-4 rounded-xl border-2 border-border bg-gray-900 text-center">
                                    <div className="w-full h-20 bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">Dark</span>
                                    </div>
                                    <p className="text-sm font-medium text-white">Tối</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
