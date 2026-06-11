import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

// 获取消息列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 获取当前用户的消息
    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.message.count({
        where: {
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
        },
      }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      messages,
      totalCount,
      totalPages,
      currentPage: page,
    })
  } catch (error: any) {
    console.error('获取消息列表错误:', error.message)
    return NextResponse.json({ error: '获取消息列表失败' }, { status: 500 })
  }
}

// 发送消息
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, content } = body

    // 验证必填字段
    if (!receiverId || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 不能给自己发消息
    if (receiverId === session.user.id) {
      return NextResponse.json({ error: '不能给自己发消息' }, { status: 400 })
    }

    // 检查接收者是否存在
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    })

    if (!receiver) {
      return NextResponse.json({ error: '接收者不存在' }, { status: 404 })
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error: any) {
    console.error('发送消息错误:', error.message)
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 })
  }
}
