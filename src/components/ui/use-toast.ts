// 简化的 useToast hook
// 实际项目中应该使用 @radix-ui/react-toast 或 react-hot-toast

import { useState } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, ...options }
    setToasts(prev => [...prev, newToast])

    // 3秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)

    // 这里应该显示 toast UI，但为了简化，我们只 console.log
    console.log(`[Toast] ${options.title}: ${options.description || ''}`)
  }

  return { toast, toasts }
}
