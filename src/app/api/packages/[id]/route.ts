import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const packageData = await prisma.package.findUnique({
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
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!packageData) {
      return NextResponse.json({ error: '课时包不存在' }, { status: 404 })
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('获取课时包详情错误:', error)
    return NextResponse.json({ error: '获取课时包详情失败' }, { status: 500 })
  }
}

// 更新课时包（教师端）
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()

    // 验证课时包是否属于当前教师
    const existingPackage = await prisma.package.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: '课时包不存在' }, { status: 404 })
    }

    if (existingPackage.teacher.userId !== session.user.id) {
      return NextResponse.json({ error: '无权修改此课时包' }, { status: 403 })
    }

    // 更新课时包
    const updatedPackage = await prisma.package.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('更新课时包错误:', error)
    return NextResponse.json({ error: '更新课时包失败' }, { status: 500 })
  }
}

// 删除课时包（教师端）
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 验证课时包是否属于当前教师
    const existingPackage = await prisma.package.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: '课时包不存在' }, { status: 404 })
    }

    if (existingPackage.teacher.userId !== session.user.id) {
      return NextResponse.json({ error: '无权删除此课时包' }, { status: 403 })
    }

    // 删除课时包（软删除，更新状态为 inactive）
    await prisma.package.update({
      where: { id: params.id },
      data: { status: 'inactive' },
    })

    return NextResponse.json({ message: '课时包已删除' })
  } catch (error) {
    console.error('删除课时包错误:', error)
    return NextResponse.json({ error: '删除课时包失败' }, { status: 500 })
  }
}
