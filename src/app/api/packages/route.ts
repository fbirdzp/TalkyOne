import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const subject = searchParams.get('subject') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {
      status: 'active',
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (subject) {
      where.subject = subject
    }

    // 构建排序条件
    let orderBy: any = {}
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { orders: { _count: 'desc' } }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // 查询课时包
    const [packages, totalCount] = await Promise.all([
      prisma.package.findMany({
        where,
        orderBy,
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
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.package.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      packages,
      totalCount,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error('获取课时包列表错误:', error)
    return NextResponse.json({ error: '获取课时包列表失败' }, { status: 500 })
  }
}
