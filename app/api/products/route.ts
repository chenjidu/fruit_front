import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const wholesalerId = searchParams.get('wholesalerId')

    const where: any = {
      isActive: true
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (wholesalerId) {
      where.wholesalerId = wholesalerId
    }

    const products = await prisma.product.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('获取商品错误:', error)
    return NextResponse.json(
      { error: '获取商品失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'WHOLESALER') {
      return NextResponse.json(
        { error: '无权限' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, price, stock, unit, categoryId, imageUrl } = body

    if (!name || !price || !stock || !unit || !categoryId) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        categoryId,
        imageUrl,
        wholesalerId: session.user.id
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('创建商品错误:', error)
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    )
  }
}
