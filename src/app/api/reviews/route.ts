import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

// 创建评价
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, rating, comment } = body

    // 验证必填字段
    if (!bookingId || !rating || !comment) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: '评分必须在 1-5 之间' }, { status: 400 })
    }

    // 获取预约信息
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { teacher: true },
    })

    if (!booking) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 })
    }

    // 检查权限：只有学生本人可以评价
    if (booking.studentId !== session.user.id) {
      return NextResponse.json({ error: '无权评价此预约' }, { status: 403 })
    }

    // 检查预约状态：只有已完成的预约可以评价
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: '只有已完成的预约可以评价' }, { status: 400 })
    }

    // 检查是否已经评价过
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    })

    if (existingReview) {
      return NextResponse.json({ error: '此预约已经评价过' }, { status: 400 })
    }

    // 创建评价
    const review = await prisma.review.create({
      data: {
        bookingId,
        studentId: session.user.id,
        teacherId: booking.teacherId,
        rating,
        comment,
      },
      include: {
        student: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    })

    // 更新教师的评分统计
    const teacherReviews = await prisma.review.findMany({
      where: { teacherId: booking.teacherId },
    })

    const totalRating = teacherReviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / teacherReviews.length

    await prisma.teacher.update({
      where: { id: booking.teacherId },
      data: {
        rating: avgRating,
        reviewCount: teacherReviews.length,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('创建评价错误:', error.message)
    return NextResponse.json({ error: '创建评价失败' }, { status: 500 })
  }
}

// 获取评价列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (teacherId) {
      where.teacherId = teacherId
    }

    if (studentId) {
      where.studentId = studentId
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          student: {
            select: {
              name: true,
              avatar: true,
            },
          },
          teacher: {
            select: {
              title: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      reviews,
      totalCount,
      totalPages,
      currentPage: page,
    })
  } catch (error: any) {
    console.error('获取评价列表错误:', error.message)
    return NextResponse.json({ error: '获取评价列表失败' }, { status: 500 })
  }
}
