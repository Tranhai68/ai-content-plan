import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST save/update brand voice
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id: workspaceId } = await params
        const body = await req.json()

        const result = await prisma.brandVoice.upsert({
            where: { workspaceId },
            create: {
                workspaceId,
                brandName: body.brandName || '',
                industry: body.industry || '',
                coreProducts: body.coreProducts || '[]',
                toneStyle: body.toneStyle || 'professional',
                targetAge: body.targetAge,
                targetInterests: body.targetInterests || '[]',
                targetLocation: body.targetLocation,
                keywords: body.keywords || '[]',
                negativeKeywords: body.negativeKeywords || '[]',
                customPrompt: body.customPrompt,
            },
            update: {
                brandName: body.brandName,
                industry: body.industry,
                coreProducts: body.coreProducts,
                toneStyle: body.toneStyle,
                targetAge: body.targetAge,
                targetInterests: body.targetInterests,
                targetLocation: body.targetLocation,
                keywords: body.keywords,
                negativeKeywords: body.negativeKeywords,
                customPrompt: body.customPrompt,
            },
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// GET brand voice
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { id: workspaceId } = await params
        const brand = await prisma.brandVoice.findUnique({ where: { workspaceId } })
        return NextResponse.json(brand || {})
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
