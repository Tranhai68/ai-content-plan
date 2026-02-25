import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { prisma } = await import('@/lib/prisma')

        const [totalContent, scheduled, published, drafts, pending] = await Promise.all([
            prisma.contentItem.count(),
            prisma.contentItem.count({ where: { status: 'SCHEDULED' } }),
            prisma.contentItem.count({ where: { status: 'PUBLISHED' } }),
            prisma.contentItem.count({ where: { status: 'DRAFT' } }),
            prisma.contentItem.count({ where: { status: 'PENDING_REVIEW' } }),
        ])

        const funnelDist = await prisma.contentItem.groupBy({
            by: ['funnelStage'],
            _count: true,
        })

        const recentItems = await prisma.contentItem.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' },
        })

        const workspaceCount = await prisma.workspace.count()

        return NextResponse.json({
            totalContent,
            scheduled,
            published,
            drafts,
            pending,
            workspaceCount,
            funnelDistribution: funnelDist,
            recentItems,
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            totalContent: 0, scheduled: 0, published: 0, drafts: 0, pending: 0,
            workspaceCount: 0, funnelDistribution: [], recentItems: [],
        })
    }
}
