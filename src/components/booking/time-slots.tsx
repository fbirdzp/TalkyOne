'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  available: boolean
  booked: boolean
}

interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedSlotId: string | null
  onSelectSlot: (slotId: string) => void
  date: string
}

export function TimeSlots({ slots, selectedSlotId, onSelectSlot, date }: TimeSlotsProps) {
  const morningSlots = slots.filter((slot) => {
    const hour = parseInt(slot.startTime.split(':')[0])
    return hour < 12
  })

  const afternoonSlots = slots.filter((slot) => {
    const hour = parseInt(slot.startTime.split(':')[0])
    return hour >= 12 && hour < 18
  })

  const eveningSlots = slots.filter((slot) => {
    const hour = parseInt(slot.startTime.split(':')[0])
    return hour >= 18
  })

  const renderSlot = (slot: TimeSlot) => {
    const isSelected = selectedSlotId === slot.id
    const isDisabled = !slot.available || slot.booked

    return (
      <button
        key={slot.id}
        onClick={() => !isDisabled && onSelectSlot(slot.id)}
        disabled={isDisabled}
        className={cn(
          'w-full rounded-lg border p-3 text-sm transition-colors',
          isSelected && 'border-blue-600 bg-blue-50 text-blue-700',
          !isSelected && !isDisabled && 'border-gray-200 hover:border-blue-300 hover:bg-blue-50',
          isDisabled && 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
        )}
      >
        <div className="font-medium">
          {slot.startTime} - {slot.endTime}
        </div>
        <div className="mt-1 text-xs">
          {slot.booked ? '已约满' : slot.available ? '可预约' : '不可用'}
        </div>
      </button>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[date.getDay()]
    return `${month}月${day}日 ${weekDay}`
  }

  return (
    <div className="w-full">
      <h3 className="mb-4 text-lg font-semibold">{formatDate(date)}</h3>

      {slots.length === 0 ? (
        <div className="py-8 text-center text-gray-500">当天没有可预约的时间段</div>
      ) : (
        <div className="space-y-6">
          {morningSlots.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-500">上午</h4>
              <div className="grid grid-cols-2 gap-2">{morningSlots.map(renderSlot)}</div>
            </div>
          )}

          {afternoonSlots.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-500">下午</h4>
              <div className="grid grid-cols-2 gap-2">{afternoonSlots.map(renderSlot)}</div>
            </div>
          )}

          {eveningSlots.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-500">晚上</h4>
              <div className="grid grid-cols-2 gap-2">{eveningSlots.map(renderSlot)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 生成时间段的辅助函数
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number
): Omit<TimeSlot, 'id' | 'available' | 'booked'>[] {
  const slots = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  let currentHour = startHour
  let currentMinute = startMinute

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    let nextHour = currentHour
    let nextMinute = currentMinute + duration
    if (nextMinute >= 60) {
      nextHour += Math.floor(nextMinute / 60)
      nextMinute = nextMinute % 60
    }

    if (nextHour > endHour || (nextHour === endHour && nextMinute > endMinute)) {
      break
    }

    const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
    })

    currentHour = nextHour
    currentMinute = nextMinute
  }

  return slots
}
