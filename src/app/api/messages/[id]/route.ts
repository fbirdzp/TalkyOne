import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

// 获取单个消息详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
      include: {
        sender: {
          select: {
            name: true,
            avatar: true,
            email: true,
          },
        },
        receiver: {
          select: {
            name: true,
            avatar: true,
            email: true,
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: '消息不存在' }, { status: 404 })
    }

    // 检查权限：只有发送者或接收者可以查看
    if (
      message.senderId !== session.user.id &&
      message.receiverId !== session.user.id
    ) {
      return NextResponse.json({ error: '无权查看此消息' }, { status: 403 })
    }

    // 如果当前用户是接收者且消息未读，标记为已读
    if (!message.isRead && message.receiverId === session.user.id) {
      await prisma.message.update({
        where: { id: params.id },
        data: { isRead: true },
      })
    }

    return NextResponse.json(message)
  } catch (error: any) {
    console.error('获取消息详情错误:', error.message)
    return NextResponse.json({ error: '获取消息详情失败' }, { status: 500 })
  }
}

// 删除消息
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    })

    if (!message) {
      return NextResponse.json({ error: '消息不存在' }, { status: 404 })
    }

    // 检查权限：只有发送者或接收者可以删除
    if (
      message.senderId !== session.user.id &&
      message.receiverId !== session.user.id
    ) {
      return NextResponse.json({ error: '无权删除此消息' }, { status: 403 })
    }

    // 删除消息
    await prisma.message.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '消息已删除' })
  } catch (error: any) {
    console.error('删除消息错误:', error.message)
    return NextResponse.json({ error: '删除消息失败' }, { status: 500 })
  }
}

// 标记消息为已读
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    })

    if (!message) {
      return NextResponse.json({ error: '消息不存在' }, { status: 404 })
    }

    // 检查权限：只有接收者可以标记已读
    if (message.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: '只有接收者可以标记已读' },
        { status: 403 }
      )
    }

    // 标记为已读
    const updatedMessage = await prisma.message.update({
      where: { id: params.id },
      data: { isRead: true },
    })

    return NextResponse.json(updatedMessage)
  } catch (error: any) {
    console.error('标记已读错误:', error.message)
    return NextResponse.json({ error: '标记已读失败' }, { status: 500 })
  }
}
