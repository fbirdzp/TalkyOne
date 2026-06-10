'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setErrorMsg('邮箱或密码错误')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setErrorMsg('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <Card className="w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">欢迎回来</h1>
          <p className="text-muted-foreground">登录你的 TalkyOne 账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱/手机号</Label>
            <Input
              id="email"
              type="text"
              placeholder="输入邮箱或手机号"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && <div className="text-sm text-destructive">{errorMsg}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>

        <div className="text-center text-sm">
          还没有账号？{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            立即注册
          </Link>
        </div>
      </Card>
    </div>
  )
}
