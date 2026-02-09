import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: '状态不能为空' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    if (session.user.role === 'WHOLESALER') {
      const hasProduct = order.items.some(item => 
        item.product.wholesalerId === session.user.id
      )
      if (!hasProduct) {
        return NextResponse.json(
          { error: '无权限修改此订单' },
          { status: 403 }
        )
      }
    } else if (session.user.role === 'MERCHANT') {
      if (order.merchantId !== session.user.id) {
        return NextResponse.json(
          { error: '无权限修改此订单' },
          { status: 403 }
        )
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            businessName: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
                wholesaler: {
                  select: {
                    id: true,
                    name: true,
                    businessName: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('更新订单错误:', error)
    return NextResponse.json(
      { error: '更新订单失败' },
      { status: 500 }
    )
  }
}
