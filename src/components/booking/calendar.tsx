'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CalendarProps {
  selectedDates: string[]
  onSelectDate: (date: string) => void
  availableDates?: string[]
  bookedDates?: string[]
  minDate?: Date
  maxDate?: Date
}

export function Calendar({
  selectedDates,
  onSelectDate,
  availableDates = [],
  bookedDates = [],
  minDate = new Date(),
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // 获取当月第一天是星期几
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  // 调整为周一开始（0=周一，6=周日）
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // 获取当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 获取上个月的最后几天
  const prevMonthDays = new Date(year, month, 0).getDate()

  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isDateDisabled = (date: Date) => {
    if (date < today) return true
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isDateAvailable = (date: string) => {
    return availableDates.includes(date)
  }

  const isDateBooked = (date: string) => {
    return bookedDates.includes(date)
  }

  const isDateSelected = (date: string) => {
    return selectedDates.includes(date)
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]

    if (!isDateDisabled(date)) {
      onSelectDate(dateStr)
    }
  }

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const renderCalendarDays = () => {
    const days = []

    // 上个月的日期
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      days.push(
        <div key={`prev-${day}`} className="flex h-10 items-center justify-center text-gray-300">
          {day}
        </div>
      )
    }

    // 当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const disabled = isDateDisabled(date)
      const available = isDateAvailable(dateStr)
      const booked = isDateBooked(dateStr)
      const selected = isDateSelected(dateStr)

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={disabled}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-colors',
            disabled && 'cursor-not-allowed text-gray-300',
            !disabled && !selected && 'hover:bg-gray-100',
            selected && 'bg-blue-600 text-white hover:bg-blue-700',
            available && !selected && 'bg-green-50 text-green-700',
            booked && !selected && 'bg-red-50 text-red-700 line-through'
          )}
        >
          {day}
        </button>
      )
    }

    // 下个月的日期
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7
    const remainingCells = totalCells - (startDay + daysInMonth)
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="flex h-10 items-center justify-center text-gray-300">
          {i}
        </div>
      )
    }

    return days
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {year}年{month + 1}月
        </h3>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="flex h-10 items-center justify-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="h-4 w-4 rounded border border-green-200 bg-green-50"></div>
          <span>可预约</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-4 w-4 rounded border border-red-200 bg-red-50"></div>
          <span>已约满</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-4 w-4 rounded bg-blue-600"></div>
          <span>已选择</span>
        </div>
      </div>
    </div>
  )
}
