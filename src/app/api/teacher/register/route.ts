import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 验证用户已登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '请先登录' }, { status: 401 })
    }

    const formData = await request.formData()

    // 解析表单数据
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const bio = formData.get('bio') as string
    const subjects = JSON.parse(formData.get('subjects') as string)
    const languages = JSON.parse(formData.get('languages') as string)
    const experience = parseInt(formData.get('experience') as string)
    const education = formData.get('education') as string
    const introduction = formData.get('introduction') as string

    // 更新用户信息
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        phone,
      },
    })

    // 更新或创建教师资料
    const teacherProfile = await prisma.teacherProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        subjects,
        languages,
        experience,
        education,
        introduction,
        approvalStatus: 'PENDING',
      },
      create: {
        userId: session.user.id,
        bio,
        subjects,
        languages,
        experience,
        education,
        introduction,
        approvalStatus: 'PENDING',
      },
    })

    // 处理资质证书文件
    const certFiles = formData.getAll('certifications')
    if (certFiles.length > 0) {
      const uploadDir = join(
        process.cwd(),
        'public',
        'uploads',
        'certifications',
        teacherProfile.id
      )
      await mkdir(uploadDir, { recursive: true })

      for (const file of certFiles) {
        if (file instanceof File) {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const filePath = join(uploadDir, file.name)
          await writeFile(filePath, buffer)
        }
      }
    }

    // 处理视频文件
    const videoFile = formData.get('video') as File | null
    if (videoFile) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'videos', teacherProfile.id)
      await mkdir(uploadDir, { recursive: true })
      const bytes = await videoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filePath = join(uploadDir, videoFile.name)
      await writeFile(filePath, buffer)

      // 更新数据库中的视频路径
      await prisma.teacherProfile.update({
        where: { id: teacherProfile.id },
        data: {
          videoUrl: `/uploads/videos/${teacherProfile.id}/${videoFile.name}`,
        },
      })
    }

    return NextResponse.json({ message: '提交成功', teacherId: teacherProfile.id }, { status: 201 })
  } catch (error) {
    console.error('Teacher registration error:', error)
    return NextResponse.json({ message: '提交失败，请稍后重试' }, { status: 500 })
  }
}
