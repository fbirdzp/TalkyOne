'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Booking {
  id: string
  startTime: string
  teacher: {
    id: string
    title: string
    user: {
      name: string
      avatar?: string
    }
  }
  package: {
    title: string
  }
}

export default function NewReviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCompletedBookings()
    }
  }, [session])

  const fetchCompletedBookings = async () => {
    try {
      const res = await fetch('/api/bookings?role=student&status=COMPLETED')
      if (res.ok) {
        const data = await res.json()
        // 过滤掉已评价过的预约
        const unreviewed = data.bookings.filter((b: any) => !b.review)
        setBookings(unreviewed)
      }
    } catch (error) {
      console.error('获取预约列表失败:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBooking || rating === 0 || !comment) {
      toast({
        title: '错误',
        description: '请选择预约、评分并填写评价内容',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking,
          rating,
          comment,
        }),
      })

      if (res.ok) {
        toast({
          title: '成功',
          description: '评价已发布',
        })
        router.push('/bookings/student')
      } else {
        const data = await res.json()
        toast({
          title: '错误',
          description: data.error || '发布评价失败',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('发布评价失败:', error)
      toast({
        title: '错误',
        description: '发布评价失败',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* 返回按钮 */}
        <Link
          href="/bookings/student"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          返回预约列表
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">发布评价</h1>
          <p className="mt-2 text-gray-600">分享你的学习体验</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-gray-600">暂无已完成的预约可评价</p>
              <Link href="/bookings/student" className="mt-4 inline-block">
                <Button variant="outline">查看我的预约</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>选择预约</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 预约列表 */}
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        selectedBooking === booking.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedBooking(booking.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="booking"
                          checked={selectedBooking === booking.id}
                          onChange={() => setSelectedBooking(booking.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{booking.teacher.user.name}</div>
                          <div className="text-sm text-gray-600">
                            {booking.package.title} ·{' '}
                            {new Date(booking.startTime).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 评分 */}
                <div>
                  <Label>评分</Label>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 评价内容 */}
                <div>
                  <Label htmlFor="comment">评价内容</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="分享你的学习体验，帮助其他学生了解这位老师..."
                    rows={6}
                    className="mt-2"
                  />
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? '发布中...' : '发布评价'}
                  </Button>
                  <Link href="/bookings/student">
                    <Button type="button" variant="outline">
                      取消
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}
