import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET campaigns for workspace
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id: workspaceId } = await params
        const campaigns = await prisma.campaign.findMany({
            where: { workspaceId },
            orderBy: { startDate: 'asc' },
        })
        return NextResponse.json(campaigns)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// POST create campaign
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id: workspaceId } = await params
        const body = await req.json()

        const campaign = await prisma.campaign.create({
            data: {
                workspaceId,
                name: body.name,
                description: body.description || '',
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                status: body.status || 'PLANNED',
            },
        })

        return NextResponse.json(campaign)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
