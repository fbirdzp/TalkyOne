import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: '缺少日期参数' }, { status: 400 })
    }

    // 获取教师信息
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: '教师不存在' }, { status: 404 })
    }

    // 获取教师的可用时间段设置
    // 这里简化为生成默认时间段，实际应该从数据库读取教师的可用时间设置
    const dayOfWeek = new Date(date).getDay() // 0=周日, 1=周一...
    const timeSlots = generateTimeSlotsForDay(dayOfWeek, teacher)

    // 获取已预约的时间段
    const bookings = await prisma.booking.findMany({
      where: {
        teacherId: params.id,
        date: new Date(date),
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    // 标记已预约的时间段
    const bookedTimes = bookings.map((b) => ({
      start: b.startTime,
      end: b.endTime,
    }))

    const slots = timeSlots.map((slot, index) => ({
      id: `slot-${index}`,
      startTime: slot.start,
      endTime: slot.end,
      available: true,
      booked: bookedTimes.some((booked) => booked.start === slot.start && booked.end === slot.end),
    }))

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('获取教师时间表错误:', error)
    return NextResponse.json({ error: '获取教师时间表失败' }, { status: 500 })
  }
}

// 根据星期几生成时间段
function generateTimeSlotsForDay(dayOfWeek: number, teacher: any) {
  // 周末可能不工作
  if (dayOfWeek === 0) {
    // 周日
    return []
  }

  // 默认工作时间：9:00 - 21:00，每45分钟一个时间段
  const slots = []
  const startHour = 9
  const endHour = 21
  const duration = teacher.duration || 45 // 默认45分钟

  let currentHour = startHour
  let currentMinute = 0

  while (currentHour < endHour) {
    const start = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    let nextHour = currentHour
    let nextMinute = currentMinute + duration
    if (nextMinute >= 60) {
      nextHour += Math.floor(nextMinute / 60)
      nextMinute = nextMinute % 60
    }

    if (nextHour > endHour) {
      break
    }

    const end = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`

    slots.push({ start, end })

    currentHour = nextHour
    currentMinute = nextMinute
  }

  return slots
}
