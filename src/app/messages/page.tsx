'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Search, MessageSquare, User, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Message {
  id: string
  content: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  receiver: {
    id: string
    name: string
    avatar?: string
  }
}

interface Contact {
  id: string
  name: string
  avatar?: string
  role: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchContacts()
    }
  }, [session])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        // 处理消息列表，提取联系人
        const contactMap = new Map<string, Contact>()

        data.messages.forEach((msg: Message) => {
          const isSender = msg.sender.id === session?.user?.id
          const contactId = isSender ? msg.receiver.id : msg.sender.id
          const contactName = isSender ? msg.receiver.name : msg.sender.name
          const contactAvatar = isSender ? msg.receiver.avatar : msg.sender.avatar

          if (!contactMap.has(contactId)) {
            contactMap.set(contactId, {
              id: contactId,
              name: contactName,
              avatar: contactAvatar,
              role: '',
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount: !msg.isRead && !isSender ? 1 : 0,
            })
          } else {
            const contact = contactMap.get(contactId)!
            if (new Date(msg.createdAt) > new Date(contact.lastMessageAt!)) {
              contact.lastMessage = msg.content
              contact.lastMessageAt = msg.createdAt
            }
            if (!msg.isRead && !isSender) {
              contact.unreadCount++
            }
          }
        })

        setContacts(Array.from(contactMap.values()).sort((a, b) =>
          new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime()
        ))
      }
    } catch (error) {
      console.error('获取联系人列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = useCallback(async (contactId: string) => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        const filteredMessages = data.messages.filter(
          (msg: Message) =>
            (msg.sender.id === contactId && msg.receiver.id === session?.user?.id) ||
            (msg.sender.id === session?.user?.id && msg.receiver.id === contactId)
        )
        setMessages(filteredMessages)

        // 标记消息为已读
        filteredMessages.forEach(async (msg: Message) => {
          if (!msg.isRead && msg.receiver.id === session?.user?.id) {
            await fetch(`/api/messages/${msg.id}`, { method: 'PATCH' })
          }
        })
      }
    } catch (error) {
      console.error('获取消息失败:', error)
    }
  }, [session?.user?.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedContact) return

    setSending(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          content: newMessage,
        }),
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages(selectedContact.id)
        fetchContacts() // 刷新联系人列表
      } else {
        const data = await res.json()
        toast({
          title: '错误',
          description: data.error || '发送消息失败',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      toast({
        title: '错误',
        description: '发送消息失败',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    fetchMessages(contact.id)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">消息</h1>
          <p className="mt-2 text-gray-600">与教师和学生的沟通</p>
        </div>

        {/* 消息界面 */}
        <Card className="overflow-hidden">
          <div className="grid h-[600px] grid-cols-1 md:grid-cols-3">
            {/* 联系人列表 */}
            <div className="border-r">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>联系人</CardTitle>
                  <span className="rounded-full bg-primary px-2 py-1 text-xs text-white">
                    {contacts.filter(c => c.unreadCount > 0).length}
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="搜索联系人..."
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto p-0" style={{ height: 'calc(600px - 120px)' }}>
                {contacts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                    <p>暂无消息</p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`cursor-pointer border-b p-4 transition-colors hover:bg-gray-50 ${
                        selectedContact?.id === contact.id ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                          {contact.avatar ? (
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-full w-full p-2 text-gray-400" />
                          )}
                          {contact.unreadCount > 0 && (
                            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                              {contact.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{contact.name}</span>
                            {contact.lastMessageAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(contact.lastMessageAt).toLocaleDateString('zh-CN')}
                              </span>
                            )}
                          </div>
                          {contact.lastMessage && (
                            <p className="truncate text-sm text-gray-600">{contact.lastMessage}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </div>

            {/* 消息内容 */}
            <div className="col-span-2 flex flex-col">
              {selectedContact ? (
                <>
                  {/* 消息头部 */}
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedContact(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                        {selectedContact.avatar ? (
                          <img
                            src={selectedContact.avatar}
                            alt={selectedContact.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-full w-full p-1.5 text-gray-400" />
                        )}
                      </div>
                      <CardTitle>{selectedContact.name}</CardTitle>
                    </div>
                  </CardHeader>

                  {/* 消息列表 */}
                  <CardContent
                    className="flex-1 overflow-y-auto p-4"
                    style={{ height: 'calc(600px - 180px)' }}
                  >
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        开始对话吧！
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.sender.id === session?.user?.id
                        return (
                          <div
                            key={msg.id}
                            className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isMe
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`mt-1 text-right text-xs ${
                                  isMe ? 'text-white/70' : 'text-gray-500'
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* 消息输入 */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="输入消息..."
                        disabled={sending}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={sending || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12" />
                    <p>选择一个联系人开始对话</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
