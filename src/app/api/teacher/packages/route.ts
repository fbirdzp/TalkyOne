import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

// 创建课时包
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      subject,
      duration,
      totalHours,
      price,
      discountPrice,
      validDays,
      maxStudents,
      level,
      tags,
    } = body

    // 验证必填字段
    if (!title || !description || !subject || !duration || !totalHours || !price || !validDays) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 获取教师信息
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: '教师信息不存在' }, { status: 404 })
    }

    // 创建课时包
    const packageData = await prisma.package.create({
      data: {
        title,
        description,
        subject,
        duration: parseInt(duration),
        totalHours: parseInt(totalHours),
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        validDays: parseInt(validDays),
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        level: level || 'all',
        tags: tags || [],
        teacherId: teacher.id,
        status: 'active',
      },
    })

    return NextResponse.json(packageData, { status: 201 })
  } catch (error) {
    console.error('创建课时包错误:', error)
    return NextResponse.json({ error: '创建课时包失败' }, { status: 500 })
  }
}
