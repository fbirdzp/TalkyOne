import crypto from 'crypto'

import WxPay from 'wechatpay-node-v3'

import { PaymentRequest, PaymentResponse, PaymentStatus } from './types'

// 初始化微信支付 SDK
const wxpay = new WxPay({
  appid: process.env.WECHAT_APP_ID!,
  mchid: process.env.WECHAT_MCH_ID!,
  publicKey: process.env.WECHAT_PUBLIC_KEY!,
  privateKey: process.env.WECHAT_PRIVATE_KEY!,
  key: process.env.WECHAT_API_KEY!,
})

// 创建微信支付订单（Native 支付，生成二维码）
export async function createWechatOrder(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const { orderId, amount, subject, description, notifyUrl } = request

    const result = await wxpay.transactions_native({
      out_trade_no: orderId,
      description: subject,
      amount: {
        total: Math.round(amount * 100), // 转换为分
        currency: 'CNY',
      },
      notify_url: notifyUrl || process.env.WECHAT_NOTIFY_URL!,
    })

    return {
      success: true,
      paymentId: orderId,
      qrCode: result.code_url, // 二维码链接
    }
  } catch (error: any) {
    console.error('微信支付创建订单失败:', error)
    return {
      success: false,
      paymentId: request.orderId,
      error: error.message,
    }
  }
}

// 验证微信支付回调
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyWechatCallback(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string,
  serial: string
): Promise<boolean> {
  try {
    const message = `${timestamp}\n${body}\n${nonce}\n`
    const publicKey = process.env.WECHAT_PUBLIC_KEY!

    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(message)

    return verify.verify(publicKey, signature, 'base64')
  } catch (error) {
    console.error('微信支付回调验证失败:', error)
    return false
  }
}

// 查询微信支付订单状态
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryWechatOrder(orderId: string): Promise<PaymentStatus> {
  try {
    const result = await wxpay.query({
      out_trade_no: orderId,
    })

    const statusMap: Record<string, PaymentStatus> = {
      SUCCESS: PaymentStatus.SUCCESS,
      REFUND: PaymentStatus.REFUNDED,
      NOTPAY: PaymentStatus.PENDING,
      CLOSED: PaymentStatus.CANCELLED,
      REVOKED: PaymentStatus.CANCELLED,
      USERPAYING: PaymentStatus.PROCESSING,
      PAYERROR: PaymentStatus.FAILED,
    }

    return statusMap[result.trade_state] || PaymentStatus.PENDING
  } catch (error) {
    console.error('查询微信支付订单失败:', error)
    return PaymentStatus.FAILED
  }
}

// 微信支付退款
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function refundWechatOrder(
  orderId: string,
  refundAmount: number,
  reason?: string
): Promise<boolean> {
  try {
    await wxpay.refunds({
      out_trade_no: orderId,
      out_refund_no: `refund_${orderId}_${Date.now()}`,
      reason: reason || '用户申请退款',
      amount: {
        refund: Math.round(refundAmount * 100), // 转换为分
        total: Math.round(refundAmount * 100),
        currency: 'CNY',
      },
    })

    return true
  } catch (error) {
    console.error('微信支付退款失败:', error)
    return false
  }
}

// 创建微信支付 H5 订单（用于移动网页）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createWechatH5Order(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const { orderId, amount, subject, description, notifyUrl } = request

    const result = await wxpay.transactions_h5({
      out_trade_no: orderId,
      description: subject,
      amount: {
        total: Math.round(amount * 100),
        currency: 'CNY',
      },
      notify_url: notifyUrl || process.env.WECHAT_NOTIFY_URL!,
    })

    return {
      success: true,
      paymentId: orderId,
      paymentUrl: result.h5_url,
    }
  } catch (error: any) {
    console.error('微信支付 H5 创建订单失败:', error)
    return {
      success: false,
      paymentId: request.orderId,
      error: error.message,
    }
  }
}

// 创建微信支付 JSAPI 订单（用于公众号/小程序）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createWechatJSAPIOrder(
  request: PaymentRequest,
  openId: string
): Promise<PaymentResponse> {
  try {
    const { orderId, amount, subject, description, notifyUrl } = request

    const result = await wxpay.transactions_jsapi({
      out_trade_no: orderId,
      description: subject,
      amount: {
        total: Math.round(amount * 100),
        currency: 'CNY',
      },
      notify_url: notifyUrl || process.env.WECHAT_NOTIFY_URL!,
      payer: {
        openid: openId,
      },
    })

    return {
      success: true,
      paymentId: orderId,
      data: result,
    }
  } catch (error: any) {
    console.error('微信支付 JSAPI 创建订单失败:', error)
    return {
      success: false,
      paymentId: request.orderId,
      error: error.message,
    }
  }
}
