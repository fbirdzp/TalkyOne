import { NextRequest, NextResponse } from 'next/server'
import { ApprovalStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacherId = params.id

    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        avatar: true,
        teacherProfile: {
          select: {
            bio: true,
            introduction: true,
            subjects: true,
            languages: true,
            experience: true,
            education: true,
            certifications: true,
            totalStudents: true,
            totalClasses: true,
            rating: true,
            ratingCount: true,
            lessonPackages: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                totalLessons: true,
                price: true,
                suitableFor: true,
              },
            },
            availabilities: {
              where: {
                date: { gte: new Date() },
                isBooked: false,
              },
              orderBy: { date: 'asc' },
              take: 20,
            },
          },
        },
      },
    })

    if (!user || !user.teacherProfile) {
      return NextResponse.json({ message: '教师不存在' }, { status: 404 })
    }

    // 检查教师是否已通过审核
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: teacherId },
    })

    if (profile?.approvalStatus !== ApprovalStatus.APPROVED) {
      return NextResponse.json({ message: '教师审核中或已被拒绝' }, { status: 403 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Fetch teacher error:', error)
    return NextResponse.json({ message: '获取教师信息失败' }, { status: 500 })
  }
}
