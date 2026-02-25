import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt
    })

    const result = await model.generateContent(prompt)
    return result.response.text()
}

export async function generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
        generationConfig: {
            responseMimeType: 'application/json',
        }
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return JSON.parse(text) as T
}

export async function generateContentPlan(context: {
    brandName: string
    industry: string
    coreProducts: string[]
    toneStyle: string
    targetAudience: string
    funnel: { awareness: number; consideration: number; conversion: number; loyalty: number; advocacy: number }
    dateRange: { start: string; end: string }
    campaigns?: string[]
    holidays?: { name: string; date: string }[]
}) {
    const systemPrompt = `Bạn là chuyên gia chiến lược content marketing. 
Bạn luôn trả lời bằng tiếng Việt.
Bạn sẽ tạo lịch nội dung chi tiết dựa trên thông tin thương hiệu và phễu marketing được cung cấp.`

    const prompt = `Tạo lịch nội dung cho thương hiệu "${context.brandName}" (ngành: ${context.industry}).

## Thông tin thương hiệu:
- Sản phẩm/Dịch vụ: ${context.coreProducts.join(', ')}
- Tone & Voice: ${context.toneStyle}
- Đối tượng: ${context.targetAudience}

## Phân bổ phễu marketing:
- Nhận biết (AWARENESS): ${context.funnel.awareness}%
- Cân nhắc (CONSIDERATION): ${context.funnel.consideration}%
- Chuyển đổi (CONVERSION): ${context.funnel.conversion}%
- Trung thành (LOYALTY): ${context.funnel.loyalty}%
- Lan tỏa (ADVOCACY): ${context.funnel.advocacy}%

## Khoảng thời gian: ${context.dateRange.start} đến ${context.dateRange.end}

${context.campaigns?.length ? `## Chiến dịch đang chạy: ${context.campaigns.join(', ')}` : ''}
${context.holidays?.length ? `## Ngày lễ trong khoảng thời gian: ${context.holidays.map(h => `${h.name} (${h.date})`).join(', ')}` : ''}

Hãy tạo 1 bài viết cho MỖI NGÀY trong khoảng thời gian trên.
Phân bổ theo đúng tỷ lệ phễu đã cho.

Trả về JSON array với mỗi item có format:
{
  "title": "Tiêu đề bài viết",
  "scheduledDate": "YYYY-MM-DD",
  "funnelStage": "AWARENESS|CONSIDERATION|CONVERSION|LOYALTY|ADVOCACY",
  "format": "IMAGE_POST|VIDEO|CAROUSEL|TEXT_ONLY|STORY|REEL",
  "summary": "Mô tả ngắn nội dung bài viết (2-3 câu)",
  "hashtags": ["hashtag1", "hashtag2"]
}`

    return generateJSON<Array<{
        title: string
        scheduledDate: string
        funnelStage: string
        format: string
        summary: string
        hashtags: string[]
    }>>(prompt, systemPrompt)
}

export async function rewriteContent(text: string, action: string, brandContext: string): Promise<string> {
    const systemPrompt = `Bạn là copywriter chuyên nghiệp. Luôn viết bằng tiếng Việt. ${brandContext}`

    const actionPrompts: Record<string, string> = {
        rewrite: `Viết lại đoạn văn sau với cách diễn đạt mới, giữ nguyên ý chính:\n\n${text}`,
        expand: `Mở rộng và phát triển đoạn văn sau thành bài viết chi tiết hơn:\n\n${text}`,
        summarize: `Rút gọn đoạn văn sau thành phiên bản ngắn gọn, súc tích:\n\n${text}`,
        tiktok: `Chuyển đổi bài viết sau thành kịch bản TikTok ngắn (hook + nội dung + CTA):\n\n${text}`,
        facebook: `Chuyển đổi nội dung sau thành bài post Facebook thu hút (có emoji, hashtag):\n\n${text}`,
        instagram: `Chuyển đổi nội dung sau thành caption Instagram (ngắn gọn, aesthetic, có hashtag):\n\n${text}`,
    }

    return generateText(actionPrompts[action] || actionPrompts.rewrite, systemPrompt)
}

export async function generateImagePrompt(contentTitle: string, contentBody: string, brandName: string): Promise<string> {
    const systemPrompt = `Bạn là chuyên gia tạo prompt cho AI image generation. Trả lời bằng tiếng Anh.`

    const prompt = `Dựa trên bài viết marketing sau, tạo 1 prompt chi tiết để AI tạo hình ảnh visual đi kèm.

Brand: ${brandName}
Tiêu đề: ${contentTitle}
Nội dung: ${contentBody}

Tạo prompt bằng tiếng Anh, mô tả chi tiết: phong cách, màu sắc, bố cục, chủ thể chính.
Chỉ trả về prompt, không giải thích thêm.`

    return generateText(prompt, systemPrompt)
}

// NEW: AI Content Writer - tạo toàn bộ nội dung bài viết từ yêu cầu
export async function writeContentFromPrompt(request: {
    topic: string
    funnelStage: string
    format: string
    platform: string
    brandName?: string
    toneStyle?: string
    additionalInstructions?: string
}): Promise<{ title: string; body: string; hashtags: string[]; cta: string }> {
    const systemPrompt = `Bạn là copywriter marketing chuyên nghiệp tại Việt Nam. 
Bạn viết content sáng tạo, thu hút, phù hợp với nền tảng mạng xã hội.
Luôn viết bằng tiếng Việt, sử dụng emoji phù hợp.
${request.brandName ? `Thương hiệu: ${request.brandName}` : ''}
${request.toneStyle ? `Tone & Voice: ${request.toneStyle}` : ''}`

    const funnelGuide: Record<string, string> = {
        AWARENESS: 'Tập trung vào giới thiệu, chia sẻ kiến thức, tạo nhận biết thương hiệu. Không bán hàng quá lộ.',
        CONSIDERATION: 'So sánh, review, giáo dục - giúp người đọc hiểu sâu hơn về sản phẩm/dịch vụ.',
        CONVERSION: 'Thúc đẩy hành động mua hàng - CTA rõ ràng, ưu đãi hấp dẫn, tạo urgency.',
        LOYALTY: 'Chăm sóc khách hàng cũ, ưu đãi VIP, stories from customers.',
        ADVOCACY: 'Khuyến khích chia sẻ, minigame tag bạn bè, UGC content.',
    }

    const formatGuide: Record<string, string> = {
        IMAGE_POST: 'Viết caption cho bài post ảnh - ngắn gọn, có hook đầu bài, CTA cuối bài.',
        VIDEO: 'Viết kịch bản video ngắn - có hook 3s, storyline, closing CTA.',
        CAROUSEL: 'Viết nội dung cho carousel (5-7 slides) - mỗi slide 1 ý, từ tổng quát → chi tiết.',
        TEXT_ONLY: 'Viết bài text dùng storytelling - dài hơi, personal, có cảm xúc.',
        STORY: 'Viết content cho story - ngắn, direct, có poll/question sticker.',
        REEL: 'Viết kịch bản reel - trending hook, fast-paced, catchy.',
    }

    const prompt = `Hãy viết bài content marketing hoàn chỉnh với các yêu cầu sau:

📌 CHỦ ĐỀ: ${request.topic}
📌 PHỄU: ${funnelGuide[request.funnelStage] || 'Tùy chọn'}
📌 ĐỊNH DẠNG: ${formatGuide[request.format] || request.format}
📌 NỀN TẢNG: ${request.platform}
${request.additionalInstructions ? `📌 YÊU CẦU THÊM: ${request.additionalInstructions}` : ''}

Trả về JSON object:
{
  "title": "Tiêu đề bài viết hấp dẫn",
  "body": "Toàn bộ nội dung bài viết (dùng \\n cho xuống dòng). Bao gồm emoji phù hợp. Cho bài viết dài và chi tiết.",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "cta": "Call-to-action phù hợp"
}`

    return generateJSON<{ title: string; body: string; hashtags: string[]; cta: string }>(prompt, systemPrompt)
}

// NEW: Generate image via Gemini Imagen 
export async function generateImage(prompt: string): Promise<string | null> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const imagePrompt = `Hãy mô tả bằng tiếng Anh một concept visual đẹp cho hình ảnh sau.
Tạo mô tả chi tiết, sinh động, chuyên nghiệp, dạng marketing visual.

Yêu cầu: ${prompt}

Trả về chỉ phần mô tả hình ảnh, không giải thích thêm.`

        const result = await model.generateContent(imagePrompt)
        const description = result.response.text()

        // Return the description as image prompt (user can use with Midjourney/DALL-E)
        return description
    } catch (error) {
        console.error('Image generation error:', error)
        return null
    }
}
