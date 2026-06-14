import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail, generateBookingConfirmationEmail } from '@/lib/email'

// 创建预约
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { packageId, startTime, endTime, notes } = body

    // 验证必填字段
    if (!packageId || !startTime || !endTime) {
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

    if (!pkg.isActive) {
      return NextResponse.json({ error: '课时包已下架' }, { status: 400 })
    }

    // 检查时间冲突
    const existingBooking = await prisma.booking.findFirst({
      where: {
        OR: [
          {
            studentId: session.user.id,
            startTime: {
              gte: new Date(startTime),
              lt: new Date(endTime),
            },
          },
          {
            teacherId: pkg.teacherId,
            startTime: {
              gte: new Date(startTime),
              lt: new Date(endTime),
            },
          },
        ],
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: '该时间段已有预约' }, { status: 400 })
    }

    // 创建预约
    const booking = await prisma.booking.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'PENDING',
        notes,
        studentId: session.user.id,
        teacherId: pkg.teacherId,
        packageId: pkg.id,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        package: true,
      },
    })

    // 发送预约确认邮件
    try {
      const studentEmail = booking.student.user.email
      const teacherEmail = booking.teacher.user.email

      if (studentEmail) {
        const emailHtml = generateBookingConfirmationEmail({
          id: booking.id,
          studentName: booking.student.user.name || '学生',
          teacherName: booking.teacher.user.name || '教师',
          packageTitle: booking.package.title,
          date: new Date(startTime).toLocaleDateString('zh-CN'),
          startTime: new Date(startTime).toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          endTime: new Date(endTime).toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          amount: booking.package.price,
        })

        await sendEmail({
          to: studentEmail,
          subject: `课程预约确认 - ${booking.package.title}`,
          html: emailHtml,
        })
        console.log('预约确认邮件已发送给学生:', studentEmail)
      }

      // 可选：发送通知邮件给教师
      if (teacherEmail) {
        // 这里可以发送新预约通知给教师
        console.log('教师邮箱:', teacherEmail)
      }
    } catch (emailError) {
      console.error('发送邮件失败:', emailError)
      // 邮件发送失败不影响预约创建
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error('创建预约错误:', error.message)
    return NextResponse.json({ error: '创建预约失败' }, { status: 500 })
  }
}

// 获取预约列表
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
        orderBy: { startTime: 'asc' },
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
  } catch (error: any) {
    console.error('获取预约列表错误:', error.message)
    return NextResponse.json({ error: '获取预约列表失败' }, { status: 500 })
  }
}
