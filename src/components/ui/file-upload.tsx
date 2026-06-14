'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Image } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (url: string) => void
  onRemove?: () => void
  accept?: string
  maxSize?: number // MB
  className?: string
  value?: string // 已上传的文件 URL
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = 'image/*',
  maxSize = 10, // 默认 10MB
  className,
  value,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`文件大小不能超过 ${maxSize}MB`)
      return
    }

    setUploading(true)

    try {
      // 创建预览
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }

      // 上传文件
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = await response.json()
      onUpload(data.url)
      toast.success('上传成功')
    } catch (error) {
      toast.error('上传失败，请重试')
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          {preview.startsWith('data:image') || preview.startsWith('http') ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
              <img
                src={preview}
                alt="预览"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-gray-50">
              <File className="h-8 w-8 text-gray-400" />
            </div>
          )}

          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 hover:border-primary hover:bg-gray-50"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            {uploading ? '上传中...' : '点击上传文件'}
          </p>
          <p className="text-xs text-gray-400">
            支持 JPG、PNG、GIF、PDF，最大 {maxSize}MB
          </p>
        </div>
      )}

      {uploading && (
        <div className="mt-2 text-sm text-gray-500">上传中...</div>
      )}
    </div>
  )
}
