import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('获取分类错误:', error)
    return NextResponse.json(
      { error: '获取分类失败' },
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
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('创建分类错误:', error)
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    )
  }
}
