import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, paymentMethod } = body

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      )
    }

    if (paymentMethod === 'alipay') {
      const paymentUrl = `https://openapi.alipay.com/gateway.do?method=alipay.trade.page.pay&out_trade_no=${orderId}&total_amount=0.01&subject=水果订单&return_url=${encodeURIComponent(process.env.NEXTAUTH_URL + '/dashboard/my-orders')}&notify_url=${encodeURIComponent(process.env.NEXTAUTH_URL + '/api/payments/notify/alipay')}&app_id=${process.env.ALIPAY_APP_ID}&charset=utf-8&sign_type=RSA2&timestamp=${new Date().toISOString()}&version=1.0`
      
      return NextResponse.json({
        success: true,
        paymentUrl
      })
    } else if (paymentMethod === 'wechat') {
      return NextResponse.json({
        success: true,
        codeUrl: 'weixin://wxpay/bizpayurl?pr=test'
      })
    }

    return NextResponse.json(
      { error: '不支持的支付方式' },
      { status: 400 }
    )
  } catch (error) {
    console.error('创建支付错误:', error)
    return NextResponse.json(
      { error: '创建支付失败' },
      { status: 500 }
    )
  }
}
