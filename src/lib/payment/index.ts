import { PaymentMethod, PaymentStatus, PaymentRequest, PaymentResponse } from './types'
import {
  createAlipayOrder,
  verifyAlipayCallback,
  queryAlipayOrder,
  refundAlipayOrder,
} from './alipay'
import {
  createWechatOrder,
  verifyWechatCallback,
  queryWechatOrder,
  refundWechatOrder,
  createWechatH5Order,
  createWechatJSAPIOrder,
} from './wechat'
import {
  createPayPalOrder,
  capturePayPalOrder,
  queryPayPalOrder,
  refundPayPalOrder,
  verifyPayPalCallback,
} from './paypal'

// 创建支付订单
export async function createPayment(
  method: PaymentMethod,
  request: PaymentRequest
): Promise<PaymentResponse> {
  switch (method) {
    case PaymentMethod.ALIPAY:
      return createAlipayOrder(request)

    case PaymentMethod.WECHAT:
      return createWechatOrder(request)

    case PaymentMethod.PAYPAL:
      return createPayPalOrder(request)

    default:
      return {
        success: false,
        paymentId: request.orderId,
        error: '不支持的支付方式',
      }
  }
}

// 创建微信 H5 支付订单
export async function createWechatH5Payment(request: PaymentRequest): Promise<PaymentResponse> {
  return createWechatH5Order(request)
}

// 创建微信 JSAPI 支付订单
export async function createWechatJSAPIPayment(
  request: PaymentRequest,
  openId: string
): Promise<PaymentResponse> {
  return createWechatJSAPIOrder(request, openId)
}

// 验证支付回调
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyPaymentCallback(
  method: PaymentMethod,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
): Promise<boolean> {
  switch (method) {
    case PaymentMethod.ALIPAY:
      return verifyAlipayCallback(params)

    case PaymentMethod.WECHAT:
      return verifyWechatCallback(
        params.timestamp,
        params.nonce,
        params.body,
        params.signature,
        params.serial
      )

    case PaymentMethod.PAYPAL:
      return verifyPayPalCallback(
        params.transmissionId,
        params.transmissionTime,
        params.certId,
        params.sigOne,
        params.webhookId,
        params.eventBody
      )

    default:
      return false
  }
}

// 查询支付订单状态
export async function queryPaymentStatus(
  method: PaymentMethod,
  orderId: string
): Promise<PaymentStatus> {
  switch (method) {
    case PaymentMethod.ALIPAY:
      return queryAlipayOrder(orderId)

    case PaymentMethod.WECHAT:
      return queryWechatOrder(orderId)

    case PaymentMethod.PAYPAL:
      return queryPayPalOrder(orderId)

    default:
      return PaymentStatus.FAILED
  }
}

// 捕获支付（主要用于 PayPal）
export async function capturePayment(
  method: PaymentMethod,
  paymentId: string
): Promise<PaymentStatus> {
  switch (method) {
    case PaymentMethod.PAYPAL:
      return capturePayPalOrder(paymentId)

    default:
      return PaymentStatus.FAILED
  }
}

// 退款
export async function refundPayment(
  method: PaymentMethod,
  orderId: string,
  amount: number,
  reason?: string
): Promise<boolean> {
  switch (method) {
    case PaymentMethod.ALIPAY:
      return refundAlipayOrder(orderId, amount, reason)

    case PaymentMethod.WECHAT:
      return refundWechatOrder(orderId, amount, reason)

    case PaymentMethod.PAYPAL:
      return refundPayPalOrder(orderId, amount)

    default:
      return false
  }
}

// 获取支付方式的显示名称
export function getPaymentMethodName(method: PaymentMethod): string {
  const nameMap: Record<PaymentMethod, string> = {
    [PaymentMethod.ALIPAY]: '支付宝',
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.PAYPAL]: 'PayPal',
  }

  return nameMap[method] || method
}

// 获取支付方式的图标
export function getPaymentMethodIcon(method: PaymentMethod): string {
  const iconMap: Record<PaymentMethod, string> = {
    [PaymentMethod.ALIPAY]: '/icons/alipay.png',
    [PaymentMethod.WECHAT]: '/icons/wechat-pay.png',
    [PaymentMethod.PAYPAL]: '/icons/paypal.png',
  }

  return iconMap[method] || ''
}
