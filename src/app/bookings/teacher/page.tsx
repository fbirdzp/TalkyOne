'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
} from 'lucide-react'

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  notes?: string
  createdAt: string
  student: {
    id: string
    name: string
    avatar?: string
  }
  package: {
    id: string
    title: string
    price: number
  }
}

const statusConfig = {
  PENDING: { label: '待确认', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  CONFIRMED: { label: '已确认', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

export default function TeacherBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchBookings()
    }
  }, [session, filterStatus])

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams()
      params.append('role', 'teacher')
      if (filterStatus) params.append('status', filterStatus)

      const res = await fetch(`/api/bookings?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('获取预约列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        alert('状态更新成功')
        fetchBookings()
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      alert('更新状态失败')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">预约管理</h1>
          <p className="mt-2 text-gray-600">管理学生的课程预约</p>
        </div>

        {/* 筛选条件 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filterStatus === '' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('')}
              >
                全部
              </Button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={filterStatus === key ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 预约列表 */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-lg text-gray-600">暂无预约</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig].icon

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* 状态标签 */}
                        <div className="mb-3 flex items-center gap-2">
                          <Badge className={statusConfig[booking.status as keyof typeof statusConfig].color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[booking.status as keyof typeof statusConfig].label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString('zh-CN')} 创建
                          </span>
                        </div>

                        {/* 学生信息 */}
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                            {booking.student.avatar ? (
                              <img
                                src={booking.student.avatar}
                                alt={booking.student.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-full w-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.student.name}</h3>
                            <p className="text-sm text-gray-600">学生</p>
                          </div>
                        </div>

                        {/* 时间信息 */}
                        <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.startTime).toLocaleDateString('zh-CN')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.startTime).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(booking.endTime).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {/* 课时包信息 */}
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">课时包:</span> {booking.package.title}
                        </div>

                        {/* 备注 */}
                        {booking.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">备注:</span> {booking.notes}
                          </div>
                        )}
                      </div>

                      {/* 操作按钮 */}
                      <div className="ml-4 flex flex-col gap-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              确认预约
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                            >
                              拒绝
                            </Button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                          >
                            标记完成
                          </Button>
                        )}
                        <Link href={`/teachers/${booking.student.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            查看学生
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
