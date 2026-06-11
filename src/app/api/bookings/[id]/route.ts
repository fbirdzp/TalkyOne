import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

// 获取单个预约详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            name: true,
            avatar: true,
            email: true,
          },
        },
        package: true,
        review: true,
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 })
    }

    // 检查权限：只有学生本人、教师本人或管理员可以查看
    if (
      booking.studentId !== session.user.id &&
      booking.teacher?.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: '无权查看此预约' }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error: any) {
    console.error('获取预约详情错误:', error.message)
    return NextResponse.json({ error: '获取预约详情失败' }, { status: 500 })
  }
}

// 更新预约状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes } = body

    // 获取预约
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    })

    if (!booking) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 })
    }

    // 检查权限
    const isStudent = booking.studentId === session.user.id
    const isTeacher = booking.teacher?.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isStudent && !isTeacher && !isAdmin) {
      return NextResponse.json({ error: '无权修改此预约' }, { status: 403 })
    }

    // 验证状态转换
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    }

    if (status && !validTransitions[booking.status]?.includes(status)) {
      return NextResponse.json(
        { error: `无法从 ${booking.status} 状态转换为 ${status}` },
        { status: 400 }
      )
    }

    // 只有教师和管理员可以确认预约
    if (status === 'CONFIRMED' && !isTeacher && !isAdmin) {
      return NextResponse.json(
        { error: '只有教师或管理员可以确认预约' },
        { status: 403 }
      )
    }

    // 只有教师和管理员可以标记完成
    if (status === 'COMPLETED' && !isTeacher && !isAdmin) {
      return NextResponse.json(
        { error: '只有教师或管理员可以标记预约完成' },
        { status: 403 }
      )
    }

    // 更新预约
    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    updateData.updatedAt = new Date()

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        student: {
          select: {
            name: true,
            avatar: true,
          },
        },
        package: true,
      },
    })

    // 如果预约完成，更新教师的课时统计
    if (status === 'COMPLETED') {
      await prisma.teacher.update({
        where: { id: booking.teacherId },
        data: {
          totalClasses: { increment: 1 },
        },
      })
    }

    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    console.error('更新预约错误:', error.message)
    return NextResponse.json({ error: '更新预约失败' }, { status: 500 })
  }
}

// 取消预约
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // 获取预约
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 })
    }

    // 检查权限：只有学生本人或管理员可以取消预约
    if (booking.studentId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权取消此预约' }, { status: 403 })
    }

    // 只能取消未完成的预约
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: '无法取消已完成的预约' },
        { status: 400 }
      )
    }

    // 更新预约状态为取消
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: '预约已取消' })
  } catch (error: any) {
    console.error('取消预约错误:', error.message)
    return NextResponse.json({ error: '取消预约失败' }, { status: 500 })
  }
}
