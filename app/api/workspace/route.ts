import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET all workspaces
export async function GET() {
    try {
        const { prisma } = await import('@/lib/prisma')
        const workspaces = await prisma.workspace.findMany({
            include: {
                brand: { select: { industry: true, brandName: true } },
                _count: { select: { members: true, contentItems: true, campaigns: true } },
            },
            orderBy: { updatedAt: 'desc' },
        })
        return NextResponse.json(workspaces)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// POST create workspace
export async function POST(req: NextRequest) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const body = await req.json()

        const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-') + '-' + Date.now().toString(36)

        const workspace = await prisma.workspace.create({
            data: {
                name: body.name,
                slug,
                description: body.description || '',
            },
        })

        // Create default funnel
        await prisma.funnelConfig.create({
            data: {
                workspaceId: workspace.id,
                awareness: 40,
                consideration: 30,
                conversion: 15,
                loyalty: 10,
                advocacy: 5,
            },
        })

        return NextResponse.json(workspace)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
