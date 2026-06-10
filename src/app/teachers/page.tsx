'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

interface Teacher {
  id: string
  user: {
    name: string | null
    avatar: string | null
  }
  subjects: string[]
  totalStudents: number
  totalClasses: number
  rating: number
  ratingCount: number
  lessonPackages: {
    id: string
    price: number
  }[]
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (subject) params.set('subject', subject)
      if (sortBy) params.set('sortBy', sortBy)
      params.set('page', page.toString())
      params.set('limit', '12')

      const response = await fetch(`/api/teachers?${params.toString()}`)
      const data = await response.json()

      setTeachers(data.teachers || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    } finally {
      setLoading(false)
    }
  }, [search, subject, sortBy, page])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTeachers()
  }

  return (
    <div className="min-h-screen bg-secondary px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">找老师</h1>
          <p className="text-muted-foreground">浏览我们的专业教师团队，找到最适合你的私教</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索教师姓名或科目..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>科目筛选</Label>
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
              </div>

              <div className="flex-1">
                <Label>排序方式</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <option value="rating">评分最高</option>
                  <option value="students">学生最多</option>
                  <option value="price_asc">价格从低到高</option>
                  <option value="price_desc">价格从高到低</option>
                  <option value="experience">教龄最长</option>
                </Select>
              </div>
            </div>
          </form>
        </Card>

        {/* Teachers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="space-y-4 p-6">
                <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 animate-pulse rounded bg-muted" />
                  <div className="mx-auto h-3 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              </Card>
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">没有找到符合条件的教师</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <Link key={teacher.id} href={`/teachers/${teacher.id}`} className="card-hover">
                <Card className="space-y-4 p-6 text-center">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                    {teacher.user.avatar ? (
                      <img
                        src={teacher.user.avatar}
                        alt={teacher.user.name || 'Teacher'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold">{teacher.user.name || '教师'}</h3>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {teacher.subjects.slice(0, 2).map((sub) => (
                        <span
                          key={sub}
                          className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{teacher.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({teacher.ratingCount})</span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {teacher.totalStudents} 名学生 · {teacher.totalClasses} 节课
                  </div>

                  {teacher.lessonPackages.length > 0 && (
                    <div className="text-lg font-bold text-primary">
                      ¥{(teacher.lessonPackages[0].price / 100).toFixed(0)}
                      <span className="text-sm font-normal">/课时</span>
                    </div>
                  )}

                  <Button variant="outline" className="w-full">
                    查看详情
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
              上一页
            </Button>
            <span className="flex items-center px-4">
              {page} / {totalPages}
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

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-sm font-medium">{children}</div>
}
