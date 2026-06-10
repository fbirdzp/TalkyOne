import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, role } = body

    // 验证必填字段
    if (!name || !email || !password) {
      return NextResponse.json({ message: '姓名、邮箱和密码为必填项' }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email || undefined }, { phone: phone || undefined }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: '邮箱或手机号已被注册' }, { status: 400 })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: role as UserRole,
        status: 'PENDING', // 需要审核
      },
    })

    // 如果是教师，创建教师资料
    if (role === 'TEACHER') {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          approvalStatus: 'PENDING',
        },
      })
    }

    // 创建学生资料
    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({ message: '注册成功', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: '注册失败，请稍后重试' }, { status: 500 })
  }
}
