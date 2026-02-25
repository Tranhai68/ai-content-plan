import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET all content items
export async function GET() {
    try {
        const { prisma } = await import('@/lib/prisma')
        const items = await prisma.contentItem.findMany({
            orderBy: { scheduledDate: 'desc' },
        })
        return NextResponse.json(items)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// POST create new content item
export async function POST(req: NextRequest) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const body = await req.json()

        // Ensure workspace exists
        let wsId = body.workspaceId
        if (!wsId) {
            let ws = await prisma.workspace.findFirst()
            if (!ws) {
                ws = await prisma.workspace.create({
                    data: { name: 'Workspace mặc định', slug: 'default-workspace' },
                })
            }
            wsId = ws.id
        }

        const item = await prisma.contentItem.create({
            data: {
                workspaceId: wsId,
                title: body.title,
                body: body.body || '',
                format: body.format || 'IMAGE_POST',
                funnelStage: body.funnelStage || 'AWARENESS',
                scheduledDate: new Date(body.scheduledDate || new Date()),
                platform: body.platform,
                status: body.status || 'DRAFT',
                aiImagePrompt: body.aiImagePrompt,
            },
        })

        return NextResponse.json(item)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
    }
}
