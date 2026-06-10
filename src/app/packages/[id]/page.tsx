'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { Badge } from '@/components/ui/badge'

interface Package {
  id: string
  title: string
  description: string
  subject: string
  duration: number
  totalHours: number
  price: number
  discountPrice: number | null
  validDays: number
  maxStudents: number | null
  level: string
  tags: string[]
  teacher: {
    id: string
    bio: string
    education: string
    experience: number
    user: {
      name: string
      avatar: string | null
      email: string
    }
  }
  _count: {
    orders: number
  }
}

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [pkg, setPackage] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetchPackage()
  }, [params.id])

  const fetchPackage = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/packages/${params.id}`)
      if (!response.ok) throw new Error('获取课时包详情失败')

      const data = await response.json()
      setPackage(data)
    } catch (error) {
      toast.error('获取课时包详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: params.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '购买失败')
      }

      const order = await response.json()

      // 跳转到支付页面
      router.push(`/payment/${order.id}`)
    } catch (error: any) {
      toast.error(error.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }

  const getSubjectLabel = (value: string) => {
    const subjects: Record<string, string> = {
      english: '英语',
      japanese: '日语',
      korean: '韩语',
      french: '法语',
      german: '德语',
      spanish: '西班牙语',
      music: '音乐',
      art: '美术',
      sports: '体育',
      other: '其他',
    }
    return subjects[value] || value
  }

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      all: '全部级别',
      beginner: '入门',
      intermediate: '初级',
      advanced: '中级',
      expert: '高级',
    }
    return levels[level] || level
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="mb-8 h-4 w-2/3 rounded bg-gray-200"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 h-64 rounded bg-gray-200"></div>
              <div className="h-64 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">课时包不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左侧：课时包详情 */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center space-x-2">
                  <Badge variant="secondary">{getSubjectLabel(pkg.subject)}</Badge>
                  <Badge variant="outline">{getLevelLabel(pkg.level)}</Badge>
                </div>
                <CardTitle className="text-3xl">{pkg.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center space-x-2">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    {pkg.teacher.user.avatar ? (
                      <Image
                        src={pkg.teacher.user.avatar}
                        alt={pkg.teacher.user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-300">
                        {pkg.teacher.user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-base">{pkg.teacher.user.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3 className="mb-2 text-lg font-semibold">课程描述</h3>
                  <p className="whitespace-pre-wrap text-gray-600">{pkg.description}</p>
                </div>

                {pkg.tags && pkg.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-lg font-semibold">课程标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {pkg.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                <div>
                  <h3 className="mb-4 text-lg font-semibold">教师信息</h3>
                  <div className="flex items-start space-x-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full">
                      {pkg.teacher.user.avatar ? (
                        <Image
                          src={pkg.teacher.user.avatar}
                          alt={pkg.teacher.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-300 text-xl">
                          {pkg.teacher.user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{pkg.teacher.user.name}</h4>
                      <p className="text-sm text-gray-500">{pkg.teacher.education}</p>
                      <p className="mt-2 text-sm text-gray-600">{pkg.teacher.bio}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>{pkg.teacher.experience} 年教学经验</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：购买卡片 */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>购买课时包</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">单次课时长</span>
                    <span>{pkg.duration} 分钟</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">总课时</span>
                    <span>{pkg.totalHours} 课时</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">有效期</span>
                    <span>{pkg.validDays} 天</span>
                  </div>
                  {pkg.maxStudents && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">剩余名额</span>
                      <span>{pkg.maxStudents - pkg._count.orders} 个</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">已售</span>
                    <span>{pkg._count.orders} 份</span>
                  </div>
                </div>

                <Separator />

                <div>
                  {pkg.discountPrice ? (
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-500">优惠价</span>
                        <span className="text-3xl font-bold text-red-600">
                          ¥{pkg.discountPrice}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-sm text-gray-500">原价</span>
                        <span className="text-lg text-gray-400 line-through">¥{pkg.price}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-gray-500">价格</span>
                      <span className="text-3xl font-bold text-gray-900">¥{pkg.price}</span>
                    </div>
                  )}
                </div>

                <Button className="w-full" size="lg" onClick={handlePurchase} disabled={purchasing}>
                  {purchasing ? '处理中...' : '立即购买'}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  购买后请在 {pkg.validDays} 天内完成所有课时
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
