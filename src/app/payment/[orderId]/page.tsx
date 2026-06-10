'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentMethod } from '@/lib/payment/types'
import { createPayment } from '@/lib/payment'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Order {
  id: string
  totalAmount: number
  status: string
  package: {
    title: string
    price: number
    discountPrice: number | null
  }
}

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.ALIPAY)

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${params.orderId}`)
      if (!response.ok) throw new Error('获取订单失败')

      const data = await response.json()
      setOrder(data)
    } catch (error) {
      toast.error('获取订单失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order) return

    setProcessing(true)
    try {
      const paymentRequest = {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'CNY',
        method: paymentMethod,
        subject: order.package.title,
        description: `购买课程：${order.package.title}`,
        returnUrl: `${window.location.origin}/payment/return?orderId=${order.id}`,
        notifyUrl: `${window.location.origin}/api/payment/notify`,
      }

      const result = await createPayment(paymentMethod, paymentRequest)

      if (!result.success) {
        throw new Error(result.error || '创建支付失败')
      }

      // 根据支付方式处理
      if (result.paymentUrl) {
        // 支付宝、PayPal：跳转到支付页面
        window.location.href = result.paymentUrl
      } else if (result.qrCode) {
        // 微信支付：显示二维码
        router.push(
          `/payment/qrcode?orderId=${order.id}&qrCode=${encodeURIComponent(result.qrCode)}`
        )
      } else {
        throw new Error('支付返回数据异常')
      }
    } catch (error: Error) {
      toast.error(error.message || '支付失败')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="h-64 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">订单不存在</p>
        </div>
      </div>
    )
  }

  if (order.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                {order.status === 'paid' ? '订单已支付' : '订单状态异常'}
              </p>
              <Button className="mt-4" onClick={() => router.push('/student/orders')}>
                查看订单
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">支付订单</h1>
        </div>

        <div className="space-y-6">
          {/* 订单信息 */}
          <Card>
            <CardHeader>
              <CardTitle>订单信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">订单号</span>
                  <span>{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">课程名称</span>
                  <span>{order.package.title}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>支付金额</span>
                  <span className="text-red-600">¥{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 支付方式选择 */}
          <Card>
            <CardHeader>
              <CardTitle>选择支付方式</CardTitle>
              <CardDescription>请选择您的支付方式</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <div className="space-y-4">
                  {/* 支付宝 */}
                  <Label
                    htmlFor="alipay"
                    className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50"
                  >
                    <RadioGroupItem value={PaymentMethod.ALIPAY} id="alipay" />
                    <div className="flex flex-1 items-center space-x-3">
                      <div className="relative h-12 w-12">
                        <Image
                          src="/icons/alipay.png"
                          alt="支付宝"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium">支付宝</p>
                        <p className="text-sm text-gray-500">推荐有支付宝账户的用户使用</p>
                      </div>
                    </div>
                  </Label>

                  {/* 微信支付 */}
                  <Label
                    htmlFor="wechat"
                    className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50"
                  >
                    <RadioGroupItem value={PaymentMethod.WECHAT} id="wechat" />
                    <div className="flex flex-1 items-center space-x-3">
                      <div className="relative h-12 w-12">
                        <Image
                          src="/icons/wechat-pay.png"
                          alt="微信支付"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium">微信支付</p>
                        <p className="text-sm text-gray-500">推荐有微信账户的用户使用</p>
                      </div>
                    </div>
                  </Label>

                  {/* PayPal */}
                  <Label
                    htmlFor="paypal"
                    className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50"
                  >
                    <RadioGroupItem value={PaymentMethod.PAYPAL} id="paypal" />
                    <div className="flex flex-1 items-center space-x-3">
                      <div className="relative h-12 w-12">
                        <Image
                          src="/icons/paypal.png"
                          alt="PayPal"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-gray-500">推荐使用 PayPal 的海外用户使用</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 支付按钮 */}
          <Button className="w-full" size="lg" onClick={handlePayment} disabled={processing}>
            {processing ? '处理中...' : `确认支付 ¥${order.totalAmount.toFixed(2)}`}
          </Button>

          <p className="text-center text-sm text-gray-500">
            点击&quot;确认支付&quot;即表示您同意《用户协议》
          </p>
        </div>
      </div>
    </div>
  )
}
