import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@/lib/payment/types'
import { verifyPaymentCallback, capturePayment, queryPaymentStatus } from '@/lib/payment'

// 支付回调处理
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const method = pathSegments[pathSegments.length - 1] as 'alipay' | 'wechat' | 'paypal'

    let verified = false
    let paymentId = ''
    let transactionId = ''
    let status: PaymentStatus = PaymentStatus.PENDING

    // 根据支付方式验证回调
    switch (method) {
      case 'alipay': {
        const params = await request.json()
        verified = await verifyPaymentCallback('alipay', params)
        paymentId = params.out_trade_no
        const transactionId = params.trade_no
        status =
          params.trade_status === 'TRADE_SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
        break
      }

      case 'wechat': {
        const body = await request.text()
        const timestamp = request.headers.get('Wechatpay-Timestamp') || ''
        const nonce = request.headers.get('Wechatpay-Nonce') || ''
        const signature = request.headers.get('Wechatpay-Signature') || ''
        const serial = request.headers.get('Wechatpay-Serial') || ''

        verified = await verifyPaymentCallback('wechat', {
          timestamp,
          nonce,
          body,
          signature,
          serial,
        })

        const wechatData = JSON.parse(body)
        paymentId = wechatData.out_trade_no
        transactionId = wechatData.transaction_id
        status = wechatData.trade_state === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
        break
      }

      case 'paypal': {
        const params = await request.json()
        const transmissionId = request.headers.get('Paypal-Transmission-Id') || ''
        const transmissionTime = request.headers.get('Paypal-Transmission-Time') || ''
        const certId = request.headers.get('Paypal-Cert-Id') || ''
        const sigOne = request.headers.get('Paypal-Transmission-Sig') || ''
        const webhookId = process.env.PAYPAL_WEBHOOK_ID!

        verified = await verifyPaymentCallback('paypal', {
          transmissionId,
          transmissionTime,
          certId,
          sigOne,
          webhookId,
          eventBody: JSON.stringify(params),
        })

        paymentId = params.resource?.supplemental_data?.related_ids?.order_id || ''
        transactionId = params.resource?.id || ''

        if (params.event_type === 'CHECKOUT.ORDER.APPROVED') {
          // PayPal 订单已批准，需要捕获
          await capturePayment('paypal', paymentId)
          status = PaymentStatus.PROCESSING
        } else if (params.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
          status = PaymentStatus.SUCCESS
        } else {
          status = PaymentStatus.FAILED
        }
        break
      }

      default:
        return NextResponse.json({ error: '不支持的支付方式' }, { status: 400 })
    }

    if (!verified) {
      console.error('支付回调验证失败:', method)
      return NextResponse.json({ error: '验证失败' }, { status: 400 })
    }

    // 更新支付记录
    const payment = await prisma.payment.findUnique({
      where: { transactionId: paymentId },
    })

    if (!payment) {
      console.error('支付记录不存在:', paymentId)
      return NextResponse.json({ error: '支付记录不存在' }, { status: 404 })
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status === PaymentStatus.SUCCESS ? 'success' : 'failed',
        paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
        data: { ...payment.data, callback: await request.json() },
      },
    })

    // 如果支付成功，更新订单状态
    if (status === PaymentStatus.SUCCESS) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'paid' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('支付回调处理错误:', error)
    return NextResponse.json({ error: '回调处理失败' }, { status: 500 })
  }
}

// 支付宝回调（GET 请求）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const method = searchParams.get('method') || 'alipay'

    let paymentId = ''
    let verified = false

    if (method === 'alipay') {
      const params: any = {}
      searchParams.forEach((value, key) => {
        if (key !== 'method') {
          params[key] = value
        }
      })

      verified = await verifyPaymentCallback('alipay', params)
      paymentId = params.out_trade_no
    } else if (method === 'paypal') {
      const token = searchParams.get('token') || ''
      paymentId = token

      // 查询 PayPal 订单状态
      const status = await queryPaymentStatus('paypal', paymentId)

      if (status === PaymentStatus.SUCCESS) {
        // 更新支付和订单状态
        const payment = await prisma.payment.findUnique({
          where: { transactionId: paymentId },
        })

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'success',
              paidAt: new Date(),
            },
          })

          await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'paid' },
          })
        }
      }

      // 重定向到订单页面
      const orderId = searchParams.get('orderId')
      return NextResponse.redirect(new URL(`/student/orders/${orderId}`, process.env.NEXTAUTH_URL))
    }

    if (!verified) {
      return NextResponse.json({ error: '验证失败' }, { status: 400 })
    }

    // 重定向到订单页面
    const orderId = searchParams.get('orderId')
    return NextResponse.redirect(new URL(`/student/orders/${orderId}`, process.env.NEXTAUTH_URL))
  } catch (error) {
    console.error('支付返回处理错误:', error)
    return NextResponse.json({ error: '返回处理失败' }, { status: 500 })
  }
}
