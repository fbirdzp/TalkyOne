'use client'

import * as React from 'react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Star, MapPin, Clock, Users, BookOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Teacher {
  id: string
  name: string | null
  avatar: string | null
  teacherProfile: {
    bio: string | null
    introduction: string | null
    subjects: string[]
    languages: string[]
    experience: number
    education: string | null
    certifications: string[]
    totalStudents: number
    totalClasses: number
    rating: number
    ratingCount: number
    lessonPackages: LessonPackage[]
    availabilities: Availability[]
  }
}

interface LessonPackage {
  id: string
  title: string
  description: string | null
  duration: number
  totalLessons: number
  price: number
  suitableFor: string | null
}

interface Availability {
  date: string
  startTime: string
  endTime: string
}

export default function TeacherDetailPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('packages')

  // 从 URL 获取教师 ID
  const [teacherId, setTeacherId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const matches = path.match(/\/teachers\/([^\/]+)/)
      if (matches) {
        setTeacherId(matches[1])
      }
    }
  }, [])

  useEffect(() => {
    if (teacherId) {
      fetchTeacher()
    }
  }, [teacherId])

  const fetchTeacher = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/teachers/${teacherId}`)
      const data = await response.json()
      setTeacher(data)
    } catch (error) {
      console.error('Failed to fetch teacher:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-48 rounded-lg bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">教师不存在</p>
      </div>
    )
  }

  const profile = teacher.teacherProfile

  return (
    <div className="min-h-screen bg-secondary px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <Card className="p-8">
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Avatar */}
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gray-200 md:mx-0">
              {teacher.avatar ? (
                <img
                  src={teacher.avatar}
                  alt={teacher.name || 'Teacher'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">👤</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{teacher.name || '教师'}</h1>
                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>在线授课</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{profile?.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({profile?.ratingCount} 评价)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.totalStudents} 名学生</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.totalClasses} 节课</span>
                </div>
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-2">
                {profile?.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button asChild>
                  <Link href={`/booking/${teacher.id}`}>立即预约</Link>
                </Button>
                <Button variant="outline">联系老师</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packages">课时包</TabsTrigger>
            <TabsTrigger value="schedule">可约时间</TabsTrigger>
            <TabsTrigger value="introduction">个人介绍</TabsTrigger>
            <TabsTrigger value="reviews">学员评价</TabsTrigger>
          </TabsList>

          {/* Lesson Packages */}
          <TabsContent value="packages" className="mt-6 space-y-4">
            {profile?.lessonPackages.map((pkg) => (
              <Card key={pkg.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{pkg.title}</h3>
                    {pkg.description && <p className="text-muted-foreground">{pkg.description}</p>}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>单次时长：{pkg.duration} 分钟</span>
                      <span>总课时：{pkg.totalLessons} 节</span>
                    </div>
                    {pkg.suitableFor && <p className="text-sm">适合人群：{pkg.suitableFor}</p>}
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="text-2xl font-bold text-primary">
                      ¥{(pkg.price / 100).toFixed(0)}
                    </div>
                    <Button>购买课时包</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule" className="mt-6">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">可预约时间</h3>
              <div className="space-y-2">
                {profile?.availabilities.slice(0, 10).map((avail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(avail.date).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <span className="font-medium">
                      {avail.startTime} - {avail.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Introduction */}
          <TabsContent value="introduction" className="mt-6">
            <Card className="space-y-6 p-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold">个人简介</h3>
                <p className="text-muted-foreground">{profile?.bio || '暂无简介'}</p>
              </div>

              {profile?.introduction && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold">详细介绍</h3>
                  <p className="whitespace-pre-wrap">{profile.introduction}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-lg font-semibold">教学信息</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">教学经验：</span>
                    {profile?.experience} 年
                  </div>
                  {profile?.education && (
                    <div>
                      <span className="font-medium">学历：</span>
                      {profile.education}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">教学语言：</span>
                    {profile?.languages.join(', ')}
                  </div>
                </div>
              </div>

              {profile?.certifications.length > 0 && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold">资质证书</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((cert, index) => (
                      <span key={index} className="rounded bg-muted px-3 py-1">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6">
              <p className="py-8 text-center text-muted-foreground">暂无评价</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
