// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  PAYPAL = 'paypal',
}

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// 支付请求接口
export interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod
  subject: string
  description?: string
  returnUrl?: string
  notifyUrl?: string
}

// 支付响应接口
export interface PaymentResponse {
  success: boolean
  paymentId: string
  paymentUrl?: string // 支付跳转URL（支付宝、PayPal）
  qrCode?: string // 微信支付二维码
  data?: any
  error?: string
}

// 支付回调接口
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PaymentCallback {
  paymentId: string
  transactionId: string
  status: PaymentStatus
  amount: number
  paidAt?: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

// 退款请求接口
export interface RefundRequest {
  paymentId: string
  amount: number
  reason?: string
}

// 退款响应接口
export interface RefundResponse {
  success: boolean
  refundId: string
  error?: string
}
