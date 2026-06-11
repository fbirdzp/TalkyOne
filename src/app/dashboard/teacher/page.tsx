'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Users,
  Star,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalPackages: 0,
    avgRating: 0,
    pendingBookings: 0,
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
      // 获取教师信息
      const teacherRes = await fetch('/api/teachers/' + session?.user?.id)
      if (teacherRes.ok) {
        const teacherData = await teacherRes.json()
        setStats(prev => ({
          ...prev,
          totalStudents: teacherData.teacher?.totalStudents || 0,
          totalClasses: teacherData.teacher?.totalClasses || 0,
          avgRating: teacherData.teacher?.rating || 0,
        }))
      }

      // 获取课时包统计
      const packagesRes = await fetch('/api/packages?teacherId=' + session?.user?.id)
      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        setStats(prev => ({
          ...prev,
          totalPackages: packagesData.totalCount || 0,
        }))
      }

      // 获取预约统计
      const bookingsRes = await fetch('/api/bookings?role=teacher&status=PENDING')
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setStats(prev => ({
          ...prev,
          pendingBookings: bookingsData.totalCount || 0,
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
          <h1 className="text-3xl font-bold">教师中心</h1>
          <p className="mt-2 text-gray-600">管理你的课程和预约</p>
        </div>

        {/* 统计卡片 */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总学生</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
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
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-yellow-100 p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">平均评分</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-full bg-red-100 p-3">
                <MessageSquare className="h-6 w-6 text-red-600" />
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
              <CardTitle>预约管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                查看和管理学生的课程预约
                {stats.pendingBookings > 0 && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                    {stats.pendingBookings} 个待确认
                  </Badge>
                )}
              </p>
              <Link href="/bookings/teacher">
                <Button className="w-full">
                  查看预约
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>课时包管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                发布和管理你的课时包
              </p>
              <div className="flex gap-2">
                <Link href="/teacher/packages/new" className="flex-1">
                  <Button className="w-full">
                    发布新课时包
                  </Button>
                </Link>
                <Link href="/packages" className="flex-1">
                  <Button variant="outline" className="w-full">
                    查看课时包
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>消息中心</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                与和学生沟通
                {stats.unreadMessages > 0 && (
                  <Badge className="ml-2 bg-red-100 text-red-800">
                    {stats.unreadMessages} 条未读
                  </Badge>
                )}
              </p>
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
              <p className="mb-4 text-gray-600">
                编辑个人资料和修改密码
              </p>
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
