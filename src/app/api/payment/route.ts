import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/prisma'
import { PaymentMethod } from '@/lib/payment/types'
import { createPayment } from '@/lib/payment'

import { authOptions } from '@/lib/auth'

// 创建支付
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, method } = body

    if (!orderId || !method) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 验证支付方式
    if (!Object.values(PaymentMethod).includes(method)) {
      return NextResponse.json({ error: '不支持的支付方式' }, { status: 400 })
    }

    // 获取订单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { package: true },
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    if (order.studentId !== session.user.id) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: '订单状态异常' }, { status: 400 })
    }

    // 创建支付记录
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method,
        amount: order.totalAmount,
        status: 'pending',
      },
    })

    // 调用支付接口
    const paymentRequest = {
      orderId: payment.id,
      amount: order.totalAmount,
      currency: 'CNY',
      method,
      subject: order.package.title,
      description: `购买课程：${order.package.title}`,
      returnUrl: `${process.env.NEXTAUTH_URL}/payment/return?orderId=${order.id}`,
      notifyUrl: `${process.env.NEXTAUTH_URL}/api/payment/notify`,
    }

    const result = await createPayment(method, paymentRequest)

    if (!result.success) {
      // 更新支付状态为失败
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      return NextResponse.json({ error: result.error || '创建支付失败' }, { status: 500 })
    }

    // 更新支付信息
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: result.paymentId,
        data: result.data,
      },
    })

    return NextResponse.json({
      paymentId: payment.id,
      paymentUrl: result.paymentUrl,
      qrCode: result.qrCode,
    })
  } catch (error) {
    console.error('创建支付错误:', error)
    return NextResponse.json({ error: '创建支付失败' }, { status: 500 })
  }
}

// 查询支付状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: '缺少支付ID' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json({ error: '支付记录不存在' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('查询支付错误:', error)
    return NextResponse.json({ error: '查询支付失败' }, { status: 500 })
  }
}
