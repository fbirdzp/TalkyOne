import checkout from '@paypal/checkout-server-sdk'

import { PaymentRequest, PaymentResponse, PaymentStatus } from './types'

// 初始化 PayPal SDK
const environment =
  process.env.NODE_ENV === 'production'
    ? new checkout.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )
    : new checkout.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )

const client = new checkout.core.PayPalHttpClient(environment)

// 创建 PayPal 订单
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPayPalOrder(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const { orderId, amount, currency, subject, description, returnUrl, notifyUrl } = request

    const requestBody = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          description: description || subject,
          amount: {
            currency_code: currency || 'USD',
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: `${returnUrl}?cancelled=true`,
        brand_name: 'TalkyOne',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
      },
    }

    const paypalRequest = new checkout.orders.OrdersCreateRequest()
    paypalRequest.requestBody(requestBody)

    const response = await client.execute(paypalRequest)
    const approvalUrl = response.result.links.find((link: any) => link.rel === 'approve')?.href

    return {
      success: true,
      paymentId: response.result.id,
      paymentUrl: approvalUrl,
    }
  } catch (error: any) {
    console.error('PayPal 创建订单失败:', error)
    return {
      success: false,
      paymentId: request.orderId,
      error: error.message,
    }
  }
}

// 捕获 PayPal 订单（完成支付）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function capturePayPalOrder(paypalOrderId: string): Promise<PaymentStatus> {
  try {
    const request = new checkout.orders.OrdersCaptureRequest(paypalOrderId)
    const response = await client.execute(request)

    const statusMap: Record<string, PaymentStatus> = {
      COMPLETED: PaymentStatus.SUCCESS,
      DECLINED: PaymentStatus.FAILED,
      PENDING: PaymentStatus.PROCESSING,
    }

    return statusMap[response.result.status] || PaymentStatus.PENDING
  } catch (error: any) {
    console.error('PayPal 捕获订单失败:', error)
    return PaymentStatus.FAILED
  }
}

// 查询 PayPal 订单状态
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryPayPalOrder(paypalOrderId: string): Promise<PaymentStatus> {
  try {
    const request = new checkout.orders.OrdersGetRequest(paypalOrderId)
    const response = await client.execute(request)

    const statusMap: Record<string, PaymentStatus> = {
      COMPLETED: PaymentStatus.SUCCESS,
      DECLINED: PaymentStatus.FAILED,
      PENDING: PaymentStatus.PROCESSING,
      CREATED: PaymentStatus.PENDING,
      SAVED: PaymentStatus.PENDING,
      APPROVED: PaymentStatus.PENDING,
    }

    return statusMap[response.result.status] || PaymentStatus.PENDING
  } catch (error: any) {
    console.error('查询 PayPal 订单失败:', error)
    return PaymentStatus.FAILED
  }
}

// PayPal 退款
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function refundPayPalOrder(
  captureId: string,
  refundAmount?: number
): Promise<boolean> {
  try {
    const requestBody: any = {}

    if (refundAmount) {
      requestBody.amount = {
        value: refundAmount.toFixed(2),
        currency_code: 'USD',
      }
    }

    const request = new checkout.payments.CapturesRefundRequest(captureId)
    request.requestBody(requestBody)

    await client.execute(request)
    return true
  } catch (error: any) {
    console.error('PayPal 退款失败:', error)
    return false
  }
}

// 验证 PayPal 回调（Webhook）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyPayPalCallback(
  transmissionId: string,
  transmissionTime: string,
  certId: string,
  sigOne: string,
  webhookId: string,
  eventBody: string
): Promise<boolean> {
  try {
    const verifyRequest = new checkout.webhooks.WebhooksVerifySignatureRequest(webhookId)
    verifyRequest.requestBody({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_id: certId,
      webhook_id: webhookId,
      transmission_sig: sigOne,
      webhook_event: JSON.parse(eventBody),
    })

    const response = await client.execute(verifyRequest)
    return response.result.verification_status === 'SUCCESS'
  } catch (error: any) {
    console.error('PayPal 回调验证失败:', error)
    return false
  }
}
