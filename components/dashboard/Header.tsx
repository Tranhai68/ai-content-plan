'use client'

import { Bell, Search, Moon, Sun, User } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
    const [darkMode, setDarkMode] = useState(false)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        document.documentElement.classList.toggle('dark')
    }

    return (
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
            {/* Search */}
            <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Tìm kiếm nội dung, chiến dịch..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Chuyển đổi giao diện"
                >
                    {darkMode ? (
                        <Sun className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <Moon className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full"></span>
                </button>

                {/* User */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors ml-2">
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Admin</span>
                </button>
            </div>
        </header>
    )
}
