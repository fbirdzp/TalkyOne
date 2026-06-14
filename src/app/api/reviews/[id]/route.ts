import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

// 获取单个评价详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            name: true,
            avatar: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        booking: true,
      },
    })

    if (!review) {
      return NextResponse.json({ error: '评价不存在' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error: any) {
    console.error('获取评价详情错误:', error.message)
    return NextResponse.json({ error: '获取评价详情失败' }, { status: 500 })
  }
}

// 删除评价
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: '评价不存在' }, { status: 404 })
    }

    // 检查权限：只有学生本人或管理员可以删除
    if (review.studentId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权删除此评价' }, { status: 403 })
    }

    // 删除评价
    await prisma.review.delete({
      where: { id: params.id },
    })

    // 更新教师的评分统计
    const teacherReviews = await prisma.review.findMany({
      where: { teacherId: review.teacherId },
    })

    if (teacherReviews.length > 0) {
      const totalRating = teacherReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = totalRating / teacherReviews.length

      await prisma.teacher.update({
        where: { id: review.teacherId },
        data: {
          rating: avgRating,
          reviewCount: teacherReviews.length,
        },
      })
    } else {
      await prisma.teacher.update({
        where: { id: review.teacherId },
        data: {
          rating: 0,
          reviewCount: 0,
        },
      })
    }

    return NextResponse.json({ message: '评价已删除' })
  } catch (error: any) {
    console.error('删除评价错误:', error.message)
    return NextResponse.json({ error: '删除评价失败' }, { status: 500 })
  }
}
