'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Calendar,
    FileText,
    BarChart3,
    Settings,
    Layers,
    Target,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Building2
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
    {
        label: 'Tổng quan',
        href: '/dashboard',
        icon: Layers,
    },
    {
        label: 'Workspace',
        href: '/dashboard/workspace',
        icon: Building2,
    },
    {
        label: 'Chiến lược',
        href: '/dashboard/strategy',
        icon: Target,
    },
    {
        label: 'Lịch nội dung',
        href: '/dashboard/calendar',
        icon: Calendar,
    },
    {
        label: 'Content Studio',
        href: '/dashboard/content',
        icon: FileText,
    },
    {
        label: 'AI Audit',
        href: '/dashboard/audit',
        icon: BarChart3,
    },
]

const bottomItems = [
    {
        label: 'Cài đặt',
        href: '/dashboard/settings',
        icon: Settings,
    },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen bg-sidebar-bg text-sidebar-fg transition-all duration-300 flex flex-col',
                collapsed ? 'w-[68px]' : 'w-[260px]'
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="font-heading text-base font-bold text-white tracking-tight">
                            AI Plan 465
                        </h1>
                        <p className="text-[10px] text-sidebar-fg/50 uppercase tracking-widest">
                            Content Strategy
                        </p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-sidebar-active text-white shadow-lg shadow-brand-red/20'
                                    : 'text-sidebar-fg/70 hover:text-white hover:bg-sidebar-hover'
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'drop-shadow-lg')} />
                            {!collapsed && (
                                <span className="animate-fade-in whitespace-nowrap">{item.label}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-white/10 py-3 px-3 space-y-1">
                {bottomItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-sidebar-active text-white'
                                    : 'text-sidebar-fg/70 hover:text-white hover:bg-sidebar-hover'
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="animate-fade-in">{item.label}</span>}
                        </Link>
                    )
                })}

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-fg/50 hover:text-white hover:bg-sidebar-hover transition-all w-full"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                            <span className="animate-fade-in">Thu gọn</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    )
}
