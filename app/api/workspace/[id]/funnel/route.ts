import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST save funnel config
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id: workspaceId } = await params
        const body = await req.json()

        const result = await prisma.funnelConfig.upsert({
            where: { workspaceId },
            create: {
                workspaceId,
                awareness: body.awareness ?? 40,
                consideration: body.consideration ?? 30,
                conversion: body.conversion ?? 15,
                loyalty: body.loyalty ?? 10,
                advocacy: body.advocacy ?? 5,
            },
            update: {
                awareness: body.awareness,
                consideration: body.consideration,
                conversion: body.conversion,
                loyalty: body.loyalty,
                advocacy: body.advocacy,
            },
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// GET funnel config
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id: workspaceId } = await params
        const config = await prisma.funnelConfig.findUnique({ where: { workspaceId } })
        return NextResponse.json(config || { awareness: 40, consideration: 30, conversion: 15, loyalty: 10, advocacy: 5 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
