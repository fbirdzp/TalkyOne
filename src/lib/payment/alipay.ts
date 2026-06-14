import AlipaySdk from 'alipay-sdk'

import { PaymentRequest, PaymentResponse, PaymentStatus } from './types'

// 初始化支付宝 SDK
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: 'https://openapi.alipay.com/gateway.do', // 生产环境
})

// 创建支付宝支付订单
export async function createAlipayOrder(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const { orderId, amount, subject, description, returnUrl, notifyUrl } = request

    const result = await alipaySdk.pageExec('alipay.trade.page.pay', {
      method: 'POST',
      bizContent: {
        out_trade_no: orderId,
        total_amount: amount.toFixed(2),
        subject,
        body: description || subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      },
      returnUrl,
      notifyUrl,
    })

    return {
      success: true,
      paymentId: orderId,
      paymentUrl: result as string,
    }
  } catch (error: any) {
    console.error('支付宝创建订单失败:', error)
    return {
      success: false,
      paymentId: request.orderId,
      error: error.message,
    }
  }
}

// 验证支付宝回调
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyAlipayCallback(params: any): Promise<boolean> {
  try {
    const sign = params.sign
    delete params.sign
    delete params.sign_type

    const isValid = alipaySdk.checkNotifySign(params, sign)
    return isValid
  } catch (error) {
    console.error('支付宝回调验证失败:', error)
    return false
  }
}

// 查询支付宝订单状态
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryAlipayOrder(orderId: string): Promise<PaymentStatus> {
  try {
    const result = await alipaySdk.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: orderId,
      },
    })

    const statusMap: Record<string, PaymentStatus> = {
      WAIT_BUYER_PAY: PaymentStatus.PENDING,
      TRADE_SUCCESS: PaymentStatus.SUCCESS,
      TRADE_FINISHED: PaymentStatus.SUCCESS,
      TRADE_CLOSED: PaymentStatus.CANCELLED,
      TRADE_FAILED: PaymentStatus.FAILED,
    }

    return statusMap[result.trade_status] || PaymentStatus.PENDING
  } catch (error) {
    console.error('查询支付宝订单失败:', error)
    return PaymentStatus.FAILED
  }
}

// 支付宝退款
export async function refundAlipayOrder(
  orderId: string,
  refundAmount: number,
  reason?: string
): Promise<boolean> {
  try {
    await alipaySdk.exec('alipay.trade.refund', {
      bizContent: {
        out_trade_no: orderId,
        refund_amount: refundAmount.toFixed(2),
        refund_reason: reason || '用户申请退款',
      },
    })

    return true
  } catch (error) {
    console.error('支付宝退款失败:', error)
    return false
  }
}
