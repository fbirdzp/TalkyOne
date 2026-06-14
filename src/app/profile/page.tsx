'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { FileUpload } from '@/components/ui/file-upload'
import { ArrowLeft, User } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status: sessionStatus, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      // 这里应该从 API 获取完整的用户信息
      // 暂时使用 session 中的数据
      setName(session?.user?.name || '')
      setEmail(session?.user?.email || '')
      setAvatar('')
    } catch (error) {
      console.error('获取个人资料失败:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) {
      toast({
        title: '错误',
        description: '姓名和邮箱为必填项',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // 这里应该调用 API 更新用户信息
      // 暂时只显示成功消息
      toast({
        title: '成功',
        description: '个人资料已更新',
      })
    } catch (error) {
      console.error('更新个人资料失败:', error)
      toast({
        title: '错误',
        description: '更新个人资料失败',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (sessionStatus === 'loading' || fetching) {
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
          href="/dashboard/student"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          返回个人中心
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">个人资料</h1>
          <p className="mt-2 text-gray-600">编辑你的个人信息</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像 */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <FileUpload
                    onUpload={(url) => setAvatar(url)}
                    onRemove={() => setAvatar('')}
                    accept="image/*"
                    maxSize={5}
                    value={avatar}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    建议上传正方形图片，大小不超过 5MB
                  </p>
                </div>
              </div>

              {/* 姓名 */}
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入姓名"
                  className="mt-2"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="mt-2"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? '保存中...' : '保存资料'}
                </Button>
                <Link href="/dashboard/student">
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* 修改密码 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="old-password">当前密码</Label>
              <Input
                id="old-password"
                type="password"
                placeholder="请输入当前密码"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="请输入新密码"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="请再次输入新密码"
                className="mt-2"
              />
            </div>

            <Button>修改密码</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
