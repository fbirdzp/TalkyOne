'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  User,
  LogIn,
  UserPlus,
  BookOpen,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    toast({
      title: '已退出登录',
    })
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          TalkyOne
        </Link>

        {/* 导航链接 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/teachers" className="text-sm hover:text-primary">
            找教师
          </Link>
          <Link href="/packages" className="text-sm hover:text-primary">
            课时包
          </Link>
        </nav>

        {/* 用户菜单 */}
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          ) : session ? (
            <>
              {/* 仪表盘链接 */}
              <Link href={session.user.role === 'TEACHER' ? '/dashboard/teacher' : '/dashboard/student'}>
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  个人中心
                </Button>
              </Link>

              {/* 消息链接 */}
              <Link href="/messages">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  消息
                </Button>
              </Link>

              {/* 用户头像和退出 */}
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {session.user.name}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  退出
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  登录
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  注册
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
