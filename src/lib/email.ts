import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// 邮件发送接口
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

// 发送邮件
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, text, from } = options

    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'noreply@talkyone.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error('邮件发送失败:', error)
      return false
    }

    console.log('邮件发送成功:', data?.id)
    return true
  } catch (error) {
    console.error('邮件发送错误:', error)
    return false
  }
}

// 邮件模板 - 预约确认
export function generateBookingConfirmationEmail(booking: {
  id: string
  studentName: string
  teacherName: string
  packageTitle: string
  date: string
  startTime: string
  endTime: string
  amount: number
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>预约确认</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A5BFF;">预约确认</h2>
        
        <p>亲爱的 ${booking.studentName}，</p>
        
        <p>您的课程预约已成功创建！以下是预约详情：</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>预约号：</strong>${booking.id}</p>
          <p><strong>教师：</strong>${booking.teacherName}</p>
          <p><strong>课程：</strong>${booking.packageTitle}</p>
          <p><strong>日期：</strong>${booking.date}</p>
          <p><strong>时间：</strong>${booking.startTime} - ${booking.endTime}</p>
          <p><strong>金额：</strong>¥${booking.amount.toFixed(2)}</p>
        </div>
        
        <p>请准时参加课程。如有任何问题，请联系我们的客服团队。</p>
        
        <p>祝学习愉快！</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #888;">
          TalkyOne 团队<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #4A5BFF;">www.talkyone.com</a>
        </p>
      </div>
    </body>
    </html>
  `
}

// 邮件模板 - 支付成功
export function generatePaymentSuccessEmail(payment: {
  id: string
  orderId: string
  amount: number
  method: string
  paidAt: Date
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>支付成功</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10B981;">支付成功</h2>
        
        <p>您的支付已成功完成！</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>支付单号：</strong>${payment.id}</p>
          <p><strong>订单号：</strong>${payment.orderId}</p>
          <p><strong>支付金额：</strong>¥${payment.amount.toFixed(2)}</p>
          <p><strong>支付方式：</strong>${payment.method}</p>
          <p><strong>支付时间：</strong>${payment.paidAt.toLocaleString('zh-CN')}</p>
        </div>
        
        <p>您可以在个人中心查看订单详情。</p>
        
        <p>感谢您使用 TalkyOne！</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #888;">
          TalkyOne 团队<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #4A5BFF;">www.talkyone.com</a>
        </p>
      </div>
    </body>
    </html>
  `
}

// 邮件模板 - 课程提醒
export function generateClassReminderEmail(booking: {
  id: string
  studentName: string
  teacherName: string
  packageTitle: string
  date: string
  startTime: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>课程提醒</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #F59E0B;">课程提醒</h2>
        
        <p>亲爱的 ${booking.studentName}，</p>
        
        <p>这是您的课程提醒。您的课程即将开始：</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>预约号：</strong>${booking.id}</p>
          <p><strong>教师：</strong>${booking.teacherName}</p>
          <p><strong>课程：</strong>${booking.packageTitle}</p>
          <p><strong>日期：</strong>${booking.date}</p>
          <p><strong>时间：</strong>${booking.startTime}</p>
        </div>
        
        <p>请提前准备好，准时参加课程。</p>
        
        <p>祝学习愉快！</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #888;">
          TalkyOne 团队<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #4A5BFF;">www.talkyone.com</a>
        </p>
      </div>
    </body>
    </html>
  `
}

// 邮件模板 - 新消息通知
export function generateNewMessageEmail(message: {
  senderName: string
  content: string
  conversationUrl: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>新消息通知</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A5BFF;">新消息通知</h2>
        
        <p><strong>${message.senderName}</strong> 给您发送了一条新消息：</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-style: italic;">"${message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content}"</p>
        </div>
        
        <p>
          <a 
            href="${message.conversationUrl}" 
            style="display: inline-block; background: #4A5BFF; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;"
          >
            查看消息
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #888;">
          TalkyOne 团队<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #4A5BFF;">www.talkyone.com</a>
        </p>
      </div>
    </body>
    </html>
  `
}
