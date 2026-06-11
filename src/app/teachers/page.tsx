'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Star, MapPin, Clock, Filter } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Teacher {
  id: string
  user: {
    name: string | null
    avatar: string | null
  }
  title: string | null
  subjects: string[]
  location: string | null
  hourlyRate: number
  totalStudents: number
  totalClasses: number
  rating: number
  ratingCount: number
  isVerified: boolean
  packages: {
    id: string
    title: string
    price: number
    totalHours: number
  }[]
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('rating')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (subject) params.set('subject', subject)
      if (location) params.set('location', location)
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
      if (priceRange[1] < 500) params.set('maxPrice', priceRange[1].toString())
      if (minRating > 0) params.set('minRating', minRating.toString())
      if (sortBy) params.set('sortBy', sortBy)
      params.set('page', page.toString())
      params.set('limit', '20')

      const response = await fetch(`/api/teachers?${params.toString()}`)
      const data = await response.json()

      setTeachers(data.teachers || [])
      setTotalPages(data.totalPages || 1)
      setTotalTeachers(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    } finally {
      setLoading(false)
    }
  }, [search, subject, location, priceRange, minRating, sortBy, page])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTeachers()
  }

  const clearFilters = () => {
    setSearch('')
    setSubject('')
    setLocation('')
    setPriceRange([0, 500])
    setMinRating(0)
    setSortBy('rating')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Stats */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">找到你的专属私教</h1>
            <p className="text-lg text-gray-600">
              探索我们的专业教师团队，开启个性化学习之旅
            </p>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{totalTeachers}+</div>
                <div className="text-sm text-gray-600">专业教师</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8</div>
                <div className="text-sm text-gray-600">平均评分</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-gray-600">满意保障</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="hidden w-64 flex-shrink-0 lg:block">
            <div className="space-y-6">
              {/* Search */}
              <Card className="p-4">
                <form onSubmit={handleSearch} className="space-y-3">
                  <Input
                    placeholder="搜索教师或科目..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit" className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    搜索
                  </Button>
                </form>
              </Card>

              {/* Subject Filter */}
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">科目</h3>
                <Select
                  value={subject}
                  onValueChange={(value) => {
                    setSubject(value)
                    setPage(1)
                  }}
                >
                  <option value="">全部科目</option>
                  <option value="英语">英语</option>
                  <option value="法语">法语</option>
                  <option value="对外汉语">对外汉语</option>
                  <option value="法律咨询">法律咨询</option>
                  <option value="日语">日语</option>
                  <option value="西班牙语">西班牙语</option>
                </Select>
              </Card>

              {/* Location Filter */}
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">地点</h3>
                <Select value={location} onValueChange={(value) => {
                  setLocation(value)
                  setPage(1)
                }}>
                  <option value="">全部地点</option>
                  <option value="北京">北京</option>
                  <option value="上海">上海</option>
                  <option value="广州">广州</option>
                  <option value="深圳">深圳</option>
                  <option value="成都">成都</option>
                  <option value="在线">在线</option>
                </Select>
              </Card>

              {/* Price Range Filter */}
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">价格范围 (¥/小时)</h3>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={500}
                    step={10}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>¥{priceRange[0]}</span>
                    <span>¥{priceRange[1]}</span>
                  </div>
                </div>
              </Card>

              {/* Rating Filter */}
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">最低评分</h3>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        setMinRating(rating)
                        setPage(1)
                      }}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                        minRating === rating ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
                      }`}
                    >
                      {rating > 0 ? (
                        <>
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{rating}+ 及以上</span>
                        </>
                      ) : (
                        <span>全部评分</span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Clear Filters */}
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                清除筛选
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                筛选条件
              </Button>
            </div>

            {/* Sort and Results Count */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共找到 <span className="font-semibold text-gray-900">{totalTeachers}</span> 位教师
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <option value="rating">评分最高</option>
                <option value="students">学生最多</option>
                <option value="price_asc">价格从低到高</option>
                <option value="price_desc">价格从高到低</option>
                <option value="experience">教龄最长</option>
                <option value="classes">课时最多</option>
              </Select>
            </div>

            {/* Teachers List - Card Style */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex gap-6">
                      <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
                        <div className="flex gap-2">
                          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : teachers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-600">没有找到符合条件的教师</p>
                <p className="mt-2 text-sm text-gray-500">尝试调整筛选条件或搜索关键词</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  清除所有筛选
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                      <div className="p-6">
                        <div className="flex gap-6">
                          {/* Avatar */}
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                            {teacher.user.avatar ? (
                              <img
                                src={teacher.user.avatar}
                                alt={teacher.user.name || 'Teacher'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-3xl">
                                👤
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {teacher.user.name || '教师'}
                                </h3>
                                {teacher.isVerified && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    已认证
                                  </Badge>
                                )}
                              </div>
                              {teacher.title && (
                                <p className="mt-1 text-sm text-gray-600">{teacher.title}</p>
                              )}
                            </div>

                            {/* Subjects */}
                            <div className="flex flex-wrap gap-1">
                              {teacher.subjects.map((sub) => (
                                <span
                                  key={sub}
                                  className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="font-semibold text-gray-900">
                                  {teacher.rating.toFixed(1)}
                                </span>
                                <span>({teacher.ratingCount})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{teacher.totalClasses} 节课</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{teacher.location || '在线'}</span>
                              </div>
                            </div>

                            {/* Bio Preview */}
                            {teacher.packages.length > 0 && (
                              <div className="flex items-center justify-between pt-2">
                                <div className="text-sm text-gray-600">
                                  {teacher.packages.length} 个课程包可选
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary">
                                    ¥{Math.min(...teacher.packages.map(p => p.price))}
                                    <span className="text-sm font-normal text-gray-600">/起</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
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
      </div>
    </div>
  )
}
