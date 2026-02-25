import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
    if (!json) return fallback
    try {
        return JSON.parse(json) as T
    } catch {
        return fallback
    }
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export const FUNNEL_STAGES = {
    AWARENESS: { label: 'Nhận biết', color: '#3b82f6', icon: '👁️' },
    CONSIDERATION: { label: 'Cân nhắc', color: '#f59e0b', icon: '🤔' },
    CONVERSION: { label: 'Chuyển đổi', color: '#ef4444', icon: '🎯' },
    LOYALTY: { label: 'Trung thành', color: '#10b981', icon: '💚' },
    ADVOCACY: { label: 'Lan tỏa', color: '#8b5cf6', icon: '📣' },
} as const

export const CONTENT_STATUSES = {
    DRAFT: { label: 'Bản nháp', color: '#6b7280' },
    PENDING_REVIEW: { label: 'Chờ duyệt', color: '#f59e0b' },
    APPROVED: { label: 'Đã duyệt', color: '#10b981' },
    SCHEDULED: { label: 'Đã lên lịch', color: '#3b82f6' },
    PUBLISHED: { label: 'Đã đăng', color: '#059669' },
    FAILED: { label: 'Thất bại', color: '#ef4444' },
} as const

export const CONTENT_FORMATS = {
    IMAGE_POST: { label: 'Ảnh', icon: '🖼️' },
    VIDEO: { label: 'Video', icon: '🎬' },
    CAROUSEL: { label: 'Carousel', icon: '🎠' },
    TEXT_ONLY: { label: 'Văn bản', icon: '📝' },
    STORY: { label: 'Story', icon: '📱' },
    REEL: { label: 'Reel', icon: '🎥' },
    TIKTOK: { label: 'TikTok', icon: '🎵' },
} as const
