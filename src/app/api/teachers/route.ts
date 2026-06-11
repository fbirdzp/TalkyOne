import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const subject = searchParams.get('subject') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : null
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : null
    const sortBy = searchParams.get('sortBy') || 'rating'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {
      approvalStatus: 'APPROVED',
      isActive: true,
      user: {
        role: 'TEACHER',
      },
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { subjects: { contains: search } },
        { title: { contains: search } },
      ]
    }

    if (subject) {
      where.subjects = {
        contains: subject,
      }
    }

    if (location) {
      where.location = {
        contains: location,
      }
    }

    if (minPrice !== null || maxPrice !== null) {
      where.packages = {
        some: {
          isActive: true,
          ...(minPrice !== null && { price: { gte: minPrice } }),
          ...(maxPrice !== null && { price: { lte: maxPrice } }),
        },
      }
    }

    if (minRating !== null) {
      where.rating = {
        gte: minRating,
      }
    }

    // 构建排序
    let orderBy: any = {}
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'students':
        orderBy = { totalStudents: 'desc' }
        break
      case 'price_asc':
        orderBy = {
          packages: {
            _min: {
              price: 'asc',
            },
          },
        }
        break
      case 'price_desc':
        orderBy = {
          packages: {
            _max: {
              price: 'desc',
            },
          },
        }
        break
      case 'experience':
        orderBy = { experience: 'desc' }
        break
      case 'classes':
        orderBy = { totalClasses: 'desc' }
        break
      default:
        orderBy = { rating: 'desc' }
    }

    // 查询教师
    const teachers = await prisma.teacher.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        packages: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            price: true,
            totalHours: true,
          },
          orderBy: { price: 'asc' },
        },
      },
    })

    // 获取总数
    const total = await prisma.teacher.count({ where })

    // 获取所有教师总数（用于统计）
    const totalTeachers = await prisma.teacher.count({
      where: {
        approvalStatus: 'APPROVED',
        isActive: true,
      },
    })

    return NextResponse.json({
      teachers: teachers.map((t) => ({
        id: t.id,
        userId: t.userId,
        user: {
          id: t.user.id,
          name: t.user.name,
          avatar: t.user.avatar,
        },
        title: t.title,
        subjects: JSON.parse(t.subjects || '[]'),
        location: t.location,
        hourlyRate: t.hourlyRate,
        totalStudents: t.totalStudents,
        totalClasses: t.totalClasses,
        rating: t.rating,
        ratingCount: t.reviewCount,
        isVerified: t.isVerified,
        packages: t.packages.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          totalHours: p.totalHours,
        })),
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total: total,
      totalTeachers,
    })
  } catch (error: any) {
    console.error('Fetch teachers error:', error.message, error.stack)
    return NextResponse.json(
      { message: '获取教师列表失败', error: error.message },
      { status: 500 }
    )
  }
}
