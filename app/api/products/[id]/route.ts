import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('获取商品详情错误:', error)
    return NextResponse.json(
      { error: '获取商品详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'WHOLESALER') {
      return NextResponse.json(
        { error: '无权限' },
        { status: 403 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    if (product.wholesalerId !== session.user.id) {
      return NextResponse.json(
        { error: '无权限修改此商品' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, price, stock, unit, categoryId, imageUrl, isActive } = body

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(unit && { unit }),
        ...(categoryId && { categoryId }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('更新商品错误:', error)
    return NextResponse.json(
      { error: '更新商品失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'WHOLESALER') {
      return NextResponse.json(
        { error: '无权限' },
        { status: 403 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    if (product.wholesalerId !== session.user.id) {
      return NextResponse.json(
        { error: '无权限删除此商品' },
        { status: 403 }
      )
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除商品错误:', error)
    return NextResponse.json(
      { error: '删除商品失败' },
      { status: 500 }
    )
  }
}
