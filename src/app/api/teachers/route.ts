import { NextRequest, NextResponse } from 'next/server'
import { UserRole, ApprovalStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const subject = searchParams.get('subject') || ''
    const sortBy = searchParams.get('sortBy') || 'rating'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {
      role: UserRole.TEACHER,
      status: 'ACTIVE',
      teacherProfile: {
        isNot: null,
        approvalStatus: ApprovalStatus.APPROVED,
      },
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { teacherProfile: { subjects: { has: search } } },
      ]
    }

    if (subject) {
      where.teacherProfile.subjects = {
        has: subject,
      }
    }

    // 构建排序
    let orderBy: any = {}
    switch (sortBy) {
      case 'rating':
        orderBy = { teacherProfile: { rating: 'desc' } }
        break
      case 'students':
        orderBy = { teacherProfile: { totalStudents: 'desc' } }
        break
      case 'price_asc':
        orderBy = { teacherProfile: { lessonPackages: { some: { price: 'asc' } } } }
        break
      case 'price_desc':
        orderBy = { teacherProfile: { lessonPackages: { some: { price: 'desc' } } } }
        break
      case 'experience':
        orderBy = { teacherProfile: { experience: 'desc' } }
        break
      default:
        orderBy = { teacherProfile: { rating: 'desc' } }
    }

    // 查询教师
    const teachers = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        teacherProfile: {
          select: {
            subjects: true,
            totalStudents: true,
            totalClasses: true,
            rating: true,
            ratingCount: true,
            lessonPackages: {
              select: {
                id: true,
                price: true,
              },
              take: 1,
              orderBy: { price: 'asc' },
            },
          },
        },
      },
    })

    // 获取总数
    const total = await prisma.user.count({ where })

    return NextResponse.json({
      teachers: teachers.map((t) => ({
        id: t.id,
        user: {
          name: t.name,
          avatar: t.avatar,
        },
        subjects: t.teacherProfile?.subjects || [],
        totalStudents: t.teacherProfile?.totalStudents || 0,
        totalClasses: t.teacherProfile?.totalClasses || 0,
        rating: t.teacherProfile?.rating || 0,
        ratingCount: t.teacherProfile?.ratingCount || 0,
        lessonPackages: t.teacherProfile?.lessonPackages || [],
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('Fetch teachers error:', error)
    return NextResponse.json({ message: '获取教师列表失败' }, { status: 500 })
  }
}
