import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET single content item
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id } = await params
        const item = await prisma.contentItem.findUnique({ where: { id } })
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(item)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// PUT update content item
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id } = await params
        const body = await req.json()

        const updateData: Record<string, unknown> = {}
        if (body.title !== undefined) updateData.title = body.title
        if (body.body !== undefined) updateData.body = body.body
        if (body.format !== undefined) updateData.format = body.format
        if (body.funnelStage !== undefined) updateData.funnelStage = body.funnelStage
        if (body.status !== undefined) updateData.status = body.status
        if (body.platform !== undefined) updateData.platform = body.platform
        if (body.aiImagePrompt !== undefined) updateData.aiImagePrompt = body.aiImagePrompt
        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
        if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate)

        const item = await prisma.contentItem.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(item)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// DELETE content item
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id } = await params
        await prisma.contentItem.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
