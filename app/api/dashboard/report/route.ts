import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get all content items
        const allContent = await prisma.contentItem.findMany({
            orderBy: { scheduledDate: 'asc' },
        })

        const total = allContent.length

        // Funnel distribution
        const funnelCounts: Record<string, number> = {}
        const formatCounts: Record<string, number> = {}
        const statusCounts: Record<string, number> = { DRAFT: 0, PENDING_REVIEW: 0, APPROVED: 0, SCHEDULED: 0, PUBLISHED: 0 }
        const topicCounts: Record<string, number> = {}

        allContent.forEach(item => {
            // Funnel
            funnelCounts[item.funnelStage] = (funnelCounts[item.funnelStage] || 0) + 1
            // Format
            formatCounts[item.format] = (formatCounts[item.format] || 0) + 1
            // Status
            if (item.status in statusCounts) {
                statusCounts[item.status]++
            }
            // Topic (use funnelStage as proxy for topic category)
            const topicMap: Record<string, string> = {
                AWARENESS: 'Inspiring (Truyền cảm hứng)',
                CONSIDERATION: 'Trust Building (Xây dựng lòng tin)',
                CONVERSION: 'Promotional (Khuyến mãi)',
                LOYALTY: 'Trust Building (Xây dựng lòng tin)',
                ADVOCACY: 'Inspiring (Truyền cảm hứng)',
            }
            const topic = topicMap[item.funnelStage] || 'Other'
            topicCounts[topic] = (topicCounts[topic] || 0) + 1
        })

        // Calculate funnel percentages
        const funnelPercentages: Record<string, number> = {}
        Object.entries(funnelCounts).forEach(([key, count]) => {
            funnelPercentages[key] = total > 0 ? Math.round((count / total) * 100) : 0
        })

        // ToFu, MoFu, BoFu
        const tofu = (funnelCounts['AWARENESS'] || 0) + (funnelCounts['ADVOCACY'] || 0)
        const mofu = funnelCounts['CONSIDERATION'] || 0
        const bofu = (funnelCounts['CONVERSION'] || 0) + (funnelCounts['LOYALTY'] || 0)
        const tofuPct = total > 0 ? Math.round((tofu / total) * 100) : 0
        const mofuPct = total > 0 ? Math.round((mofu / total) * 100) : 0
        const bofuPct = total > 0 ? Math.round((bofu / total) * 100) : 0

        return NextResponse.json({
            total,
            funnelCounts,
            funnelPercentages,
            formatCounts,
            statusCounts,
            topicCounts,
            tofu: { count: tofu, percentage: tofuPct },
            mofu: { count: mofu, percentage: mofuPct },
            bofu: { count: bofu, percentage: bofuPct },
        })
    } catch (error) {
        console.error('Report error:', error)
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
}
