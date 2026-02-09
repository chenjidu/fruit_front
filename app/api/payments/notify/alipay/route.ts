import { NextResponse } from 'next/server'
import { verify } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    
    const sign = params.get('sign')
    const outTradeNo = params.get('out_trade_no')
    const tradeStatus = params.get('trade_status')

    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false })
  } catch (error) {
    console.error('支付回调错误:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
