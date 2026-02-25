import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { prisma } = await import('@/lib/prisma')

        let workspace = await prisma.workspace.findFirst({
            orderBy: { createdAt: 'asc' },
        })

        if (!workspace) {
            workspace = await prisma.workspace.create({
                data: {
                    name: 'Workspace mặc định',
                    slug: 'default-workspace',
                    description: 'Workspace mặc định để bắt đầu sử dụng',
                },
            })
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
        }

        return NextResponse.json(workspace)
    } catch (error) {
        console.error('Default workspace error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
