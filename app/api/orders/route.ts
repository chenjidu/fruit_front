import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}

    if (session.user.role === 'MERCHANT') {
      where.merchantId = session.user.id
    } else if (session.user.role === 'WHOLESALER') {
      where.items = {
        some: {
          product: {
            wholesalerId: session.user.id
          }
        }
      }
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('获取订单错误:', error)
    return NextResponse.json(
      { error: '获取订单失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: '无权限' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { items, deliveryAddress, phone, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: '订单不能为空' },
        { status: 400 }
      )
    }

    if (!deliveryAddress || !phone) {
      return NextResponse.json(
        { error: '收货地址和电话不能为空' },
        { status: 400 }
      )
    }

    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `商品不存在: ${item.productId}` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `商品 ${product.name} 库存不足` },
          { status: 400 }
        )
      }
    }

    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    let totalAmount = 0
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId)!
      const subtotal = product.price * item.quantity
      totalAmount += subtotal
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        subtotal
      }
    })

    const order = await prisma.order.create({
      data: {
        orderNumber,
        merchantId: session.user.id,
        totalAmount,
        deliveryAddress,
        phone,
        notes,
        items: {
          create: orderItems
        }
      },
      include: {
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

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('创建订单错误:', error)
    return NextResponse.json(
      { error: '创建订单失败' },
      { status: 500 }
    )
  }
}
