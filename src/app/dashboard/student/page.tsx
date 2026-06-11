'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  BookOpen,
  MessageSquare,
  Star,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function StudentDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [stats, setStats] = useState({
    totalBookings: 0,
    completedClasses: 0,
    totalReviews: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      // 获取预约统计
      const bookingsRes = await fetch('/api/bookings?role=student')
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setStats(prev => ({
          ...prev,
          totalBookings: bookingsData.totalCount,
        }))
      }

      // 获取评价统计
      const reviewsRes = await fetch('/api/reviews?studentId=' + session?.user?.id)
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setStats(prev => ({
          ...prev,
          totalReviews: reviewsData.totalCount,
        }))
      }

      // 获取消息统计
      const messagesRes = await fetch('/api/messages')
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        const unread = messagesData.messages.filter(
          (msg: any) => !msg.isRead && msg.receiverId === session?.user?.id
        ).length
        setStats(prev => ({
          ...prev,
          unreadMessages: unread,
        }))
      }

      // 计算已完成课程数
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        const completed = bookingsData.bookings.filter(
          (b: any) => b.status === 'COMPLETED'
        ).length
        setStats(prev => ({
          ...prev,
          completedClasses: completed,
        }))
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold">学生中心</h1>
          <p className="mt-2 text-gray-600">管理你的学习和预约</p>
        </div>

        {/* 统计卡片 */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总预约</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-green-100 p-3">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">已完成课程</p>
                <p className="text-2xl font-bold">{stats.completedClasses}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-yellow-100 p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">我的评价</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-purple-100 p-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">未读消息</p>
                <p className="text-2xl font-bold">{stats.unreadMessages}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快捷操作 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>我的课程</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">查看和管理你的预约课程</p>
              <Link href="/bookings/student">
                <Button className="w-full">
                  查看预约
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>我的评价</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">查看和发布教师评价</p>
              <Link href="/reviews/new">
                <Button className="w-full" variant="outline">
                  发布评价
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>消息中心</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">与教师和学生沟通</p>
              <Link href="/messages">
                <Button className="w-full" variant="outline">
                  查看消息
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>个人设置</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">编辑个人资料和修改密码</p>
              <Link href="/profile">
                <Button className="w-full" variant="outline">
                  编辑资料
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
