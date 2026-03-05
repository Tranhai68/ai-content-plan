import { PrismaClient } from '../app/generated/prisma'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function main() {
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
    const authToken = process.env.TURSO_AUTH_TOKEN

    const adapter = new PrismaLibSql({ url, authToken })
    const prisma = new PrismaClient({ adapter })

    console.log('🌱 Seeding database...')

    // 1. Create default user
    const user = await prisma.user.upsert({
        where: { email: 'admin@contentautomation.vn' },
        update: {},
        create: {
            email: 'admin@contentautomation.vn',
            name: 'Admin',
            password: '$2a$10$dummyhashforseeding',
        },
    })
    console.log(`✅ User: ${user.email}`)

    // 2. Create default workspace
    const workspace = await prisma.workspace.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
            name: 'Workspace Mặc Định',
            slug: 'default',
            description: 'Workspace mặc định cho Content Automation',
            members: {
                create: {
                    userId: user.id,
                    role: 'OWNER',
                },
            },
        },
    })
    console.log(`✅ Workspace: ${workspace.name}`)

    // 3. Create default brand voice
    await prisma.brandVoice.upsert({
        where: { workspaceId: workspace.id },
        update: {},
        create: {
            workspaceId: workspace.id,
            brandName: 'Content Automation',
            industry: 'Digital Marketing',
            coreProducts: JSON.stringify(['Content Marketing', 'Social Media Management', 'AI Content Generation']),
            toneStyle: 'professional',
            targetAge: '25-45',
            targetInterests: JSON.stringify(['Marketing', 'Content Creation', 'AI Tools']),
            targetLocation: 'Việt Nam',
            keywords: JSON.stringify(['content marketing', 'AI', 'social media', 'automation']),
        },
    })
    console.log('✅ Brand Voice created')

    // 4. Create default funnel config
    await prisma.funnelConfig.upsert({
        where: { workspaceId: workspace.id },
        update: {},
        create: {
            workspaceId: workspace.id,
            awareness: 40,
            consideration: 30,
            conversion: 15,
            loyalty: 10,
            advocacy: 5,
        },
    })
    console.log('✅ Funnel Config created')

    // 5. Create sample content items
    const sampleContent = [
        {
            title: '5 Xu Hướng Content Marketing 2026',
            funnelStage: 'AWARENESS',
            format: 'CAROUSEL',
            status: 'PUBLISHED',
            scheduledDate: new Date('2026-03-01'),
            platform: 'facebook',
        },
        {
            title: 'Hướng Dẫn Sử Dụng AI Viết Content',
            funnelStage: 'CONSIDERATION',
            format: 'VIDEO',
            status: 'SCHEDULED',
            scheduledDate: new Date('2026-03-05'),
            platform: 'tiktok',
        },
        {
            title: 'Ưu Đãi Đặc Biệt - Gói Content Pro',
            funnelStage: 'CONVERSION',
            format: 'IMAGE_POST',
            status: 'DRAFT',
            scheduledDate: new Date('2026-03-08'),
            platform: 'instagram',
        },
        {
            title: 'Cảm Ơn 1000 Khách Hàng Đầu Tiên!',
            funnelStage: 'LOYALTY',
            format: 'TEXT_ONLY',
            status: 'DRAFT',
            scheduledDate: new Date('2026-03-10'),
            platform: 'facebook',
        },
        {
            title: 'Minigame: Tag Bạn Bè Nhận Quà',
            funnelStage: 'ADVOCACY',
            format: 'STORY',
            status: 'PLANNED',
            scheduledDate: new Date('2026-03-15'),
            platform: 'instagram',
        },
    ]

    for (const content of sampleContent) {
        await prisma.contentItem.create({
            data: {
                workspaceId: workspace.id,
                ...content,
            },
        })
    }
    console.log(`✅ ${sampleContent.length} sample content items created`)

    // 6. Create Vietnamese calendar events
    const events = [
        { name: 'Tết Nguyên Đán', date: '01-01', isLunar: true, category: 'holiday', description: 'Tết cổ truyền Việt Nam' },
        { name: 'Valentine', date: '02-14', isLunar: false, category: 'shopping', description: 'Ngày lễ tình nhân' },
        { name: 'Quốc tế Phụ nữ', date: '03-08', isLunar: false, category: 'holiday', description: 'Ngày Quốc tế Phụ nữ 8/3' },
        { name: 'Ngày Giỗ Tổ Hùng Vương', date: '03-10', isLunar: true, category: 'holiday', description: 'Giỗ Tổ Hùng Vương 10/3 Âm lịch' },
        { name: 'Ngày Giải phóng miền Nam', date: '04-30', isLunar: false, category: 'holiday', description: 'Ngày Giải phóng miền Nam 30/4' },
        { name: 'Quốc tế Lao động', date: '05-01', isLunar: false, category: 'holiday', description: 'Ngày Quốc tế Lao động 1/5' },
        { name: 'Ngày của Mẹ', date: '05-12', isLunar: false, category: 'shopping', description: "Mother's Day" },
        { name: 'Ngày của Cha', date: '06-16', isLunar: false, category: 'shopping', description: "Father's Day" },
        { name: 'Ngày Quốc khánh', date: '09-02', isLunar: false, category: 'holiday', description: 'Quốc khánh Việt Nam 2/9' },
        { name: 'Trung Thu', date: '08-15', isLunar: true, category: 'cultural', description: 'Tết Trung Thu' },
        { name: 'Phụ nữ Việt Nam', date: '10-20', isLunar: false, category: 'holiday', description: 'Ngày Phụ nữ Việt Nam 20/10' },
        { name: 'Halloween', date: '10-31', isLunar: false, category: 'cultural', description: 'Lễ hội Halloween' },
        { name: 'Ngày Nhà giáo', date: '11-20', isLunar: false, category: 'holiday', description: 'Ngày Nhà giáo Việt Nam 20/11' },
        { name: 'Black Friday', date: '11-29', isLunar: false, category: 'shopping', description: 'Ngày hội mua sắm Black Friday' },
        { name: '12.12 Sale', date: '12-12', isLunar: false, category: 'shopping', description: 'Ngày hội sale 12/12' },
        { name: 'Giáng Sinh', date: '12-25', isLunar: false, category: 'holiday', description: 'Lễ Giáng Sinh' },
    ]

    for (const event of events) {
        await prisma.calendarEvent.create({
            data: event,
        })
    }
    console.log(`✅ ${events.length} calendar events created`)

    console.log('\n🎉 Seeding complete!')
    await prisma.$disconnect()
}

main().catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
})
