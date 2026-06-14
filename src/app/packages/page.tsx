'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  level: string
  tags: string[]
  teacher: {
    id: string
    user: {
      name: string
      avatar: string | null
    }
  }
  _count: {
    orders: number
  }
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const subjects = [
    { value: '', label: '全部科目' },
    { value: 'english', label: '英语' },
    { value: 'japanese', label: '日语' },
    { value: 'korean', label: '韩语' },
    { value: 'french', label: '法语' },
    { value: 'german', label: '德语' },
    { value: 'spanish', label: '西班牙语' },
    { value: 'music', label: '音乐' },
    { value: 'art', label: '美术' },
    { value: 'sports', label: '体育' },
    { value: 'other', label: '其他' },
  ]

  useEffect(() => {
    fetchPackages()
  }, [search, subject, sortBy, page])

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(subject && { subject }),
        sortBy,
        page: page.toString(),
        limit: '12',
      })

      const response = await fetch(`/api/packages?${params}`)
      if (!response.ok) throw new Error('获取课时包失败')

      const data = await response.json()
      setPackages(data.packages)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('获取课时包失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPackages()
  }

  const getSubjectLabel = (value: string) => {
    const subject = subjects.find((s) => s.value === value)
    return subject ? subject.label : value
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">浏览课时包</h1>
          <p className="mt-2 text-gray-600">找到适合您的课程套餐</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="搜索课时包..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">搜索</Button>
          </form>

          <div className="flex gap-4">
            <Select
              value={subject}
              onValueChange={(value) => {
                setSubject(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择科目" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新发布</SelectItem>
                <SelectItem value="price_asc">价格从低到高</SelectItem>
                <SelectItem value="price_desc">价格从高到低</SelectItem>
                <SelectItem value="popular">最受欢迎</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 课时包列表 */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="mb-2 h-3 w-full rounded bg-gray-200"></div>
                  <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">暂无课时包</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="secondary">{getSubjectLabel(pkg.subject)}</Badge>
                    <Badge variant="outline">{getLevelLabel(pkg.level)}</Badge>
                  </div>
                  <CardTitle className="text-xl">{pkg.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <div className="relative h-6 w-6 overflow-hidden rounded-full">
                      {pkg.teacher.user.avatar ? (
                        <Image
                          src={pkg.teacher.user.avatar}
                          alt={pkg.teacher.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-300 text-xs">
                          {pkg.teacher.user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span>{pkg.teacher.user.name}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">{pkg.description}</p>

                  <div className="mb-4 space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>单次课时长</span>
                      <span>{pkg.duration} 分钟</span>
                    </div>
                    <div className="flex justify-between">
                      <span>总课时</span>
                      <span>{pkg.totalHours} 课时</span>
                    </div>
                    <div className="flex justify-between">
                      <span>有效期</span>
                      <span>{pkg.validDays} 天</span>
                    </div>
                    <div className="flex justify-between">
                      <span>已售</span>
                      <span>{pkg._count.orders} 份</span>
                    </div>
                  </div>

                  {pkg.tags && pkg.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {pkg.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      {pkg.discountPrice ? (
                        <div>
                          <span className="text-2xl font-bold text-red-600">
                            ¥{pkg.discountPrice}
                          </span>
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ¥{pkg.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">¥{pkg.price}</span>
                      )}
                    </div>
                    <Button onClick={() => (window.location.href = `/packages/${pkg.id}`)}>
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
              上一页
            </Button>
            <span className="flex items-center px-4">
              第 {page} 页 / 共 {totalPages} 页
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
