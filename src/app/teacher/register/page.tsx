'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const steps = [
  { id: 1, name: '基本信息' },
  { id: 2, name: '教学信息' },
  { id: 3, name: '资质证书' },
  { id: 4, name: '自我介绍' },
  { id: 5, name: '确认提交' },
]

export default function TeacherRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // 步骤1：基本信息
    name: '',
    email: '',
    phone: '',
    bio: '',

    // 步骤2：教学信息
    subjects: [] as string[],
    languages: [] as string[],
    experience: 0,
    education: '',

    // 步骤3：资质证书（文件）
    certifications: [] as File[],

    // 步骤4：自我介绍
    introduction: '',
    videoFile: null as File | null,
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const formDataToSend = new FormData()

      // 添加文本字段
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'certifications' && key !== 'videoFile') {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value))
          } else {
            formDataToSend.append(key, value as string)
          }
        }
      })

      // 添加文件
      formData.certifications.forEach((file, index) => {
        formDataToSend.append(`certification_${index}`, file)
      })

      if (formData.videoFile) {
        formDataToSend.append('video', formData.videoFile)
      }

      const response = await fetch('/api/teacher/register', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        alert('提交成功！我们将在3-5个工作日内审核您的资料。')
        router.push('/teacher/pending')
      } else {
        alert('提交失败，请稍后重试')
      }
    } catch (error) {
      alert('提交失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-secondary px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">成为 TalkyOne 教师</h1>
          <p className="text-muted-foreground">填写以下信息，开启您的教学之旅</p>
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            {steps.map((step) => (
              <span
                key={step.id}
                className={currentStep >= step.id ? 'font-medium text-primary' : ''}
              >
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <Card className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">基本信息</h2>

              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入您的姓名"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="13800138000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <textarea
                  id="bio"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="简要介绍您的教学背景和专长..."
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">教学信息</h2>

              <div className="space-y-2">
                <Label>教学科目</Label>
                <div className="flex flex-wrap gap-2">
                  {['英语', '法语', '对外汉语', '法律咨询', '日语', '西班牙语'].map((subject) => (
                    <Button
                      key={subject}
                      type="button"
                      variant={formData.subjects.includes(subject) ? 'default' : 'outline'}
                      onClick={() => {
                        const subjects = formData.subjects.includes(subject)
                          ? formData.subjects.filter((s) => s !== subject)
                          : [...formData.subjects, subject]
                        setFormData({ ...formData, subjects })
                      }}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>教学语言</Label>
                <div className="flex flex-wrap gap-2">
                  {['中文', '英语', '法语'].map((lang) => (
                    <Button
                      key={lang}
                      type="button"
                      variant={formData.languages.includes(lang) ? 'default' : 'outline'}
                      onClick={() => {
                        const languages = formData.languages.includes(lang)
                          ? formData.languages.filter((l) => l !== lang)
                          : [...formData.languages, lang]
                        setFormData({ ...formData, languages })
                      }}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">教学经验（年）</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">学历</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="例如：北京大学 英语语言文学 本科"
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">资质证书</h2>
              <p className="text-sm text-muted-foreground">
                请上传您的学历证书、教师资格证书等相关证明材料
              </p>

              <div className="space-y-4">
                <Label>上传证书文件</Label>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setFormData({
                      ...formData,
                      certifications: [...formData.certifications, ...files],
                    })
                  }}
                />

                {formData.certifications.length > 0 && (
                  <div className="space-y-2">
                    <Label>已上传的文件：</Label>
                    <ul className="space-y-1">
                      {formData.certifications.map((file, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span>{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const certs = formData.certifications.filter((_, i) => i !== index)
                              setFormData({
                                ...formData,
                                certifications: certs,
                              })
                            }}
                          >
                            删除
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">自我介绍</h2>

              <div className="space-y-2">
                <Label htmlFor="introduction">文字介绍</Label>
                <textarea
                  id="introduction"
                  className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  placeholder="详细介绍您的教学理念、方法、成功案例等..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>自我介绍视频（可选）</Label>
                <p className="text-sm text-muted-foreground">
                  上传60秒内的自我介绍视频，让学生更了解您
                </p>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData({ ...formData, videoFile: file })
                    }
                  }}
                />
                {formData.videoFile && (
                  <p className="text-sm text-muted-foreground">已选择：{formData.videoFile.name}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">确认提交</h2>
              <p className="text-sm text-muted-foreground">
                请确认您填写的信息无误，提交后将进入审核流程
              </p>

              <div className="space-y-4 rounded-lg bg-muted p-6">
                <div>
                  <span className="font-medium">姓名：</span>
                  {formData.name}
                </div>
                <div>
                  <span className="font-medium">邮箱：</span>
                  {formData.email}
                </div>
                <div>
                  <span className="font-medium">教学科目：</span>
                  {formData.subjects.join(', ')}
                </div>
                <div>
                  <span className="font-medium">教学经验：</span>
                  {formData.experience} 年
                </div>
                <div>
                  <span className="font-medium">资质证书：</span>
                  {formData.certifications.length} 个文件
                </div>
                {formData.videoFile && (
                  <div>
                    <span className="font-medium">自我介绍视频：</span>
                    {formData.videoFile.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              上一步
            </Button>

            {currentStep < 5 ? (
              <Button type="button" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? '提交中...' : '提交审核'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
