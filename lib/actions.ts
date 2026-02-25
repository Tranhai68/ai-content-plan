'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ===== WORKSPACE =====
export async function getWorkspaces() {
    return prisma.workspace.findMany({
        include: {
            _count: { select: { members: true, contentItems: true } },
            brand: { select: { industry: true } },
        },
        orderBy: { updatedAt: 'desc' },
    })
}

export async function getWorkspace(id: string) {
    return prisma.workspace.findUnique({
        where: { id },
        include: {
            brand: true,
            funnelConfig: true,
            _count: { select: { members: true, contentItems: true, campaigns: true } },
        },
    })
}

export async function createWorkspace(data: { name: string; description?: string }) {
    const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now().toString(36)

    const workspace = await prisma.workspace.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
        },
    })

    // Create default funnel config
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

    revalidatePath('/dashboard/workspace')
    return workspace
}

export async function deleteWorkspace(id: string) {
    await prisma.workspace.delete({ where: { id } })
    revalidatePath('/dashboard/workspace')
}

// ===== BRAND VOICE =====
export async function saveBrandVoice(workspaceId: string, data: {
    brandName: string
    industry: string
    coreProducts: string
    toneStyle: string
    targetAge?: string
    targetInterests?: string
    targetLocation?: string
    keywords?: string
    negativeKeywords?: string
    customPrompt?: string
}) {
    const result = await prisma.brandVoice.upsert({
        where: { workspaceId },
        create: { workspaceId, ...data },
        update: data,
    })
    revalidatePath(`/dashboard/workspace/${workspaceId}`)
    return result
}

export async function getBrandVoice(workspaceId: string) {
    return prisma.brandVoice.findUnique({ where: { workspaceId } })
}

// ===== FUNNEL CONFIG =====
export async function saveFunnelConfig(workspaceId: string, data: {
    awareness: number
    consideration: number
    conversion: number
    loyalty: number
    advocacy: number
}) {
    const result = await prisma.funnelConfig.upsert({
        where: { workspaceId },
        create: { workspaceId, ...data },
        update: data,
    })
    revalidatePath('/dashboard/strategy')
    return result
}

export async function getFunnelConfig(workspaceId: string) {
    return prisma.funnelConfig.findUnique({ where: { workspaceId } })
}

// ===== CAMPAIGNS =====
export async function getCampaigns(workspaceId: string) {
    return prisma.campaign.findMany({
        where: { workspaceId },
        orderBy: { startDate: 'asc' },
    })
}

export async function createCampaign(workspaceId: string, data: {
    name: string
    description?: string
    startDate: string
    endDate: string
}) {
    const campaign = await prisma.campaign.create({
        data: {
            workspaceId,
            name: data.name,
            description: data.description,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        },
    })
    revalidatePath('/dashboard/strategy')
    return campaign
}

export async function deleteCampaign(id: string) {
    await prisma.campaign.delete({ where: { id } })
    revalidatePath('/dashboard/strategy')
}

// ===== CONTENT ITEMS =====
export async function getContentItems(workspaceId?: string) {
    return prisma.contentItem.findMany({
        where: workspaceId ? { workspaceId } : {},
        orderBy: { scheduledDate: 'asc' },
    })
}

export async function getContentItem(id: string) {
    return prisma.contentItem.findUnique({ where: { id } })
}

export async function createContentItem(data: {
    workspaceId: string
    title: string
    body?: string
    format?: string
    funnelStage: string
    scheduledDate: string
    platform?: string
}) {
    const item = await prisma.contentItem.create({
        data: {
            workspaceId: data.workspaceId,
            title: data.title,
            body: data.body,
            format: data.format || 'IMAGE_POST',
            funnelStage: data.funnelStage,
            scheduledDate: new Date(data.scheduledDate),
            platform: data.platform,
        },
    })
    revalidatePath('/dashboard/content')
    revalidatePath('/dashboard/calendar')
    return item
}

export async function updateContentItem(id: string, data: {
    title?: string
    body?: string
    format?: string
    funnelStage?: string
    scheduledDate?: string
    status?: string
    platform?: string
    aiImagePrompt?: string
    imageUrl?: string
}) {
    const updateData: Record<string, unknown> = { ...data }
    if (data.scheduledDate) {
        updateData.scheduledDate = new Date(data.scheduledDate)
    }

    const item = await prisma.contentItem.update({
        where: { id },
        data: updateData,
    })
    revalidatePath('/dashboard/content')
    revalidatePath('/dashboard/calendar')
    return item
}

export async function deleteContentItem(id: string) {
    await prisma.contentItem.delete({ where: { id } })
    revalidatePath('/dashboard/content')
    revalidatePath('/dashboard/calendar')
}

// ===== DASHBOARD STATS =====
export async function getDashboardStats() {
    const [totalContent, scheduled, published, drafts] = await Promise.all([
        prisma.contentItem.count(),
        prisma.contentItem.count({ where: { status: 'SCHEDULED' } }),
        prisma.contentItem.count({ where: { status: 'PUBLISHED' } }),
        prisma.contentItem.count({ where: { status: 'DRAFT' } }),
    ])

    const funnelDist = await prisma.contentItem.groupBy({
        by: ['funnelStage'],
        _count: true,
    })

    const recentItems = await prisma.contentItem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
    })

    return {
        totalContent,
        scheduled,
        published,
        drafts,
        funnelDistribution: funnelDist,
        recentItems,
    }
}

// ===== SEED DEFAULT WORKSPACE =====
export async function ensureDefaultWorkspace() {
    const existing = await prisma.workspace.findFirst()
    if (existing) return existing

    const ws = await prisma.workspace.create({
        data: {
            name: 'Workspace mặc định',
            slug: 'default-workspace',
            description: 'Workspace mặc định để bắt đầu sử dụng',
        },
    })

    await prisma.funnelConfig.create({
        data: {
            workspaceId: ws.id,
            awareness: 40,
            consideration: 30,
            conversion: 15,
            loyalty: 10,
            advocacy: 5,
        },
    })

    return ws
}
