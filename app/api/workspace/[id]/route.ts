import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET workspace detail
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id } = await params
        const workspace = await prisma.workspace.findUnique({
            where: { id },
            include: {
                brand: true,
                funnelConfig: true,
                campaigns: { orderBy: { startDate: 'asc' } },
                _count: { select: { members: true, contentItems: true } },
            },
        })
        if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(workspace)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// DELETE workspace
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id } = await params
        await prisma.workspace.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
