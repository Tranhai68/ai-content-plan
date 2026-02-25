import { NextRequest, NextResponse } from 'next/server'
import { generateContentPlan } from '@/lib/ai/gemini'
import { getHolidaysInRange } from '@/lib/constants/vietnamese-holidays'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    try {
        // Lazy import Prisma to avoid build-time initialization
        const { prisma } = await import('@/lib/prisma')

        const body = await req.json()
        const { workspaceId, startDate, endDate, postsPerDay = 1 } = body

        // Get workspace data
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                brand: true,
                funnelConfig: true,
                campaigns: {
                    where: {
                        startDate: { lte: new Date(endDate) },
                        endDate: { gte: new Date(startDate) },
                    },
                },
            },
        })

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
        }

        const brand = workspace.brand
        const funnel = workspace.funnelConfig

        if (!brand || !funnel) {
            return NextResponse.json(
                { error: 'Please setup Brand Voice and Funnel Config first' },
                { status: 400 }
            )
        }

        // Get holidays in range
        const holidays = getHolidaysInRange(new Date(startDate), new Date(endDate))

        // Generate content plan via Gemini AI
        const plan = await generateContentPlan({
            brandName: brand.brandName,
            industry: brand.industry,
            coreProducts: JSON.parse(brand.coreProducts || '[]'),
            toneStyle: brand.toneStyle,
            targetAudience: [
                brand.targetAge && `Độ tuổi: ${brand.targetAge}`,
                brand.targetLocation && `Vị trí: ${brand.targetLocation}`,
                brand.targetInterests && `Sở thích: ${brand.targetInterests}`,
            ].filter(Boolean).join(', ') || 'Đa dạng',
            funnel: {
                awareness: funnel.awareness,
                consideration: funnel.consideration,
                conversion: funnel.conversion,
                loyalty: funnel.loyalty,
                advocacy: funnel.advocacy,
            },
            dateRange: { start: startDate, end: endDate },
            campaigns: workspace.campaigns.map((c: { name: string }) => c.name),
            holidays: holidays.map((h) => ({ name: h.name, date: h.date })),
        })

        // Save generated content items to database
        const createdItems = await Promise.all(
            plan.map((item: { title: string; summary: string; format: string; funnelStage: string; scheduledDate: string; hashtags: string[] }) =>
                prisma.contentItem.create({
                    data: {
                        workspaceId,
                        title: item.title,
                        body: item.summary,
                        format: item.format,
                        funnelStage: item.funnelStage,
                        scheduledDate: new Date(item.scheduledDate),
                        status: 'DRAFT',
                        metadata: JSON.stringify({ hashtags: item.hashtags }),
                    },
                })
            )
        )

        return NextResponse.json({
            success: true,
            count: createdItems.length,
            items: createdItems,
        })
    } catch (error) {
        console.error('AI Plan Generation Error:', error)
        return NextResponse.json(
            { error: 'Failed to generate content plan' },
            { status: 500 }
        )
    }
}
