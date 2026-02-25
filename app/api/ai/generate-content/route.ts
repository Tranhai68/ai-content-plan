import { NextRequest, NextResponse } from 'next/server'
import { rewriteContent, generateImagePrompt, writeContentFromPrompt, generateImage } from '@/lib/ai/gemini'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, text, brandContext, contentTitle, brandName } = body

        if (action === 'write') {
            // AI viết content mới từ yêu cầu
            const result = await writeContentFromPrompt({
                topic: body.topic,
                funnelStage: body.funnelStage || 'AWARENESS',
                format: body.format || 'IMAGE_POST',
                platform: body.platform || 'Facebook',
                brandName: body.brandName,
                toneStyle: body.toneStyle,
                additionalInstructions: body.additionalInstructions,
            })
            return NextResponse.json({ success: true, result })
        }

        if (action === 'imagePrompt') {
            const prompt = await generateImagePrompt(contentTitle, text, brandName)
            return NextResponse.json({ success: true, prompt })
        }

        if (action === 'generateImageDescription') {
            const description = await generateImage(body.prompt)
            return NextResponse.json({ success: true, description })
        }

        // Default: rewrite/expand/summarize/format
        const result = await rewriteContent(text, action, brandContext || '')
        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error('AI Content Error:', error)
        return NextResponse.json(
            { error: 'Không thể tạo nội dung. Vui lòng thử lại.' },
            { status: 500 }
        )
    }
}
