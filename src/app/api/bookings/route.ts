import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { packageId, date, timeSlotId, startTime, endTime } = body

    // 验证必填字段
    if (!packageId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 获取课时包信息
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { teacher: true },
    })

    if (!pkg) {
      return NextResponse.json({ error: '课时包不存在' }, { status: 404 })
    }

    if (pkg.status !== 'active') {
      return NextResponse.json({ error: '课时包已下架' }, { status: 400 })
    }

    // 检查学生是否已有该课时包的订单
    const existingOrder = await prisma.order.findFirst({
      where: {
        studentId: session.user.id,
        packageId: packageId,
        status: 'paid',
      },
    })

    // 如果没有已支付的订单，需要先创建订单
    if (!existingOrder) {
      return NextResponse.json({ error: '请先购买课时包' }, { status: 400 })
    }

    // 检查学生的课时包剩余课时
    const completedBookings = await prisma.booking.count({
      where: {
        orderId: existingOrder.id,
        status: 'completed',
      },
    })

    if (completedBookings >= pkg.totalHours) {
      return NextResponse.json({ error: '课时包课时已用完，请购买新的课时包' }, { status: 400 })
    }

    // 检查时间冲突
    const existingBooking = await prisma.booking.findFirst({
      where: {
        studentId: session.user.id,
        date: new Date(date),
        startTime,
        status: {
          in: ['pending', 'confirmed'],
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: '该时间段已有预约' }, { status: 400 })
    }

    // 创建预约
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        status: 'pending',
        studentId: session.user.id,
        teacherId: pkg.teacherId,
        packageId: pkg.id,
        orderId: existingOrder.id,
      },
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
        package: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('创建预约错误:', error)
    return NextResponse.json({ error: '创建预约失败' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'student'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (role === 'student') {
      where.studentId = session.user.id
    } else if (role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      })
      if (teacher) {
        where.teacherId = teacher.id
      }
    }

    if (status) {
      where.status = status
    }

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { date: 'asc' },
        skip,
        take: limit,
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
      }),
      prisma.booking.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      bookings,
      totalCount,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error('获取预约列表错误:', error)
    return NextResponse.json({ error: '获取预约列表失败' }, { status: 500 })
  }
}
