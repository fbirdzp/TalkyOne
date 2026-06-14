import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'

import { authOptions } from '@/lib/auth'

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('获取用户信息错误:', error.message)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, avatar } = body

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(avatar !== undefined && { avatar }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('更新用户信息错误:', error.message)
    return NextResponse.json({ error: '更新用户信息失败' }, { status: 500 })
  }
}

// 修改密码
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { oldPassword, newPassword } = body

    // 验证必填字段
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 验证旧密码
    const bcrypt = require('bcryptjs')
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)

    if (!isOldPasswordValid) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: '密码修改成功' })
  } catch (error: any) {
    console.error('修改密码错误:', error.message)
    return NextResponse.json({ error: '修改密码失败' }, { status: 500 })
  }
}
