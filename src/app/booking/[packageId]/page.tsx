'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/booking/calendar'
import { TimeSlots, generateTimeSlots } from '@/components/booking/time-slots'

interface Package {
  id: string
  title: string
  duration: number
  price: number
  discountPrice: number | null
  teacher: {
    id: string
    user: {
      name: string
      avatar: string | null
    }
  }
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  available: boolean
  booked: boolean
}

export default function BookingPage({ params }: { params: { packageId: string } }) {
  const router = useRouter()
  const [pkg, setPackage] = useState<Package | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetchPackage()
  }, [params.packageId])

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchPackage = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/packages/${params.packageId}`)
      if (!response.ok) throw new Error('获取课时包失败')

      const data = await response.json()
      setPackage(data)
    } catch (error) {
      toast.error('获取课时包失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeSlots = async (date: string) => {
    try {
      const response = await fetch(`/api/teachers/${pkg?.teacher.id}/schedule?date=${date}`)
      if (!response.ok) throw new Error('获取时间段失败')

      const data = await response.json()
      setTimeSlots(data.slots || [])
    } catch (error) {
      toast.error('获取时间段失败')
      setTimeSlots([])
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlotId(null)
  }

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlotId) {
      toast.error('请选择日期和时间')
      return
    }

    setBooking(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: params.packageId,
          date: selectedDate,
          timeSlotId: selectedSlotId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '预约失败')
      }

      const booking = await response.json()
      toast.success('预约成功！')

      // 跳转到预约详情或支付页面
      router.push(`/bookings/${booking.id}`)
    } catch (error: any) {
      toast.error(error.message || '预约失败')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-96 rounded bg-gray-200"></div>
              <div className="h-96 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">课时包不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">预约课程</h1>
          <p className="mt-2 text-gray-600">{pkg.title}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左侧：日历 */}
          <Card>
            <CardHeader>
              <CardTitle>选择日期</CardTitle>
              <CardDescription>选择您想上课的日期</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                selectedDates={selectedDate ? [selectedDate] : []}
                onSelectDate={handleDateSelect}
                minDate={new Date()}
              />
            </CardContent>
          </Card>

          {/* 右侧：时间段选择 */}
          <Card>
            <CardHeader>
              <CardTitle>选择时间</CardTitle>
              <CardDescription>{selectedDate ? '选择上课时间段' : '请先选择日期'}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <TimeSlots
                  slots={timeSlots}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={handleSlotSelect}
                  date={selectedDate}
                />
              ) : (
                <div className="py-12 text-center text-gray-400">请在左侧日历中选择日期</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 预约按钮 */}
        {selectedDate && selectedSlotId && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">预约信息</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    日期：{selectedDate} | 时间：
                    {timeSlots.find((s) => s.id === selectedSlotId)?.startTime} -
                    {timeSlots.find((s) => s.id === selectedSlotId)?.endTime}
                  </p>
                </div>
                <Button size="lg" onClick={handleBooking} disabled={booking}>
                  {booking ? '预约中...' : '确认预约'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
