'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CreatePackagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: '',
    totalHours: '',
    price: '',
    discountPrice: '',
    validDays: '',
    maxStudents: '',
    level: 'all',
    tags: '',
  })

  const subjects = [
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

  const levels = [
    { value: 'all', label: '全部级别' },
    { value: 'beginner', label: '入门' },
    { value: 'intermediate', label: '初级' },
    { value: 'advanced', label: '中级' },
    { value: 'expert', label: '高级' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/teacher/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          totalHours: parseInt(formData.totalHours),
          price: parseFloat(formData.price),
          discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
          validDays: parseInt(formData.validDays),
          maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : null,
          tags: formData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '创建失败')
      }

      toast.success('课时包创建成功！')
      router.push('/teacher/dashboard')
    } catch (error: any) {
      toast.error(error.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">发布课时包</h1>
          <p className="mt-2 text-gray-600">创建您的课程套餐，吸引更多学生</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>填写课时包的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">课时包名称 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="例如：零基础英语口语速成班"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">课程描述 *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="详细描述您的课程内容、教学目标、适合人群等"
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">科目 *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => handleChange('subject', value)}
                    >
                      <SelectTrigger>
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
                  </div>

                  <div>
                    <Label htmlFor="level">适合级别</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => handleChange('level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择级别" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">标签</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="用逗号分隔，例如：口语,雅思,商务英语"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 课时设置 */}
            <Card>
              <CardHeader>
                <CardTitle>课时设置</CardTitle>
                <CardDescription>设置课程时长和总课时</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">单次课时长（分钟）*</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      placeholder="45"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalHours">总课时 *</Label>
                    <Input
                      id="totalHours"
                      type="number"
                      value={formData.totalHours}
                      onChange={(e) => handleChange('totalHours', e.target.value)}
                      placeholder="10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="validDays">有效期（天）*</Label>
                  <Input
                    id="validDays"
                    type="number"
                    value={formData.validDays}
                    onChange={(e) => handleChange('validDays', e.target.value)}
                    placeholder="90"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    学生购买后，必须在有效期内完成所有课时
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxStudents">最大学生数（可选）</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleChange('maxStudents', e.target.value)}
                    placeholder="不填表示不限制"
                  />
                  <p className="mt-1 text-sm text-gray-500">设置后，达到人数上限将停止销售</p>
                </div>
              </CardContent>
            </Card>

            {/* 价格设置 */}
            <Card>
              <CardHeader>
                <CardTitle>价格设置</CardTitle>
                <CardDescription>设置课时包的价格</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">原价（元）*</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="999.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discountPrice">优惠价（元，可选）</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={(e) => handleChange('discountPrice', e.target.value)}
                      placeholder="799.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '创建中...' : '发布课时包'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
