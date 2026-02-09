import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  const hashedPassword = await bcrypt.hash('123456', 10)

  const wholesaler = await prisma.user.upsert({
    where: { email: 'wholesaler@example.com' },
    update: {},
    create: {
      email: 'wholesaler@example.com',
      password: hashedPassword,
      name: '张三',
      phone: '13800138000',
      role: 'WHOLESALER',
      businessName: '张三水果批发',
      address: '北京市朝阳区水果批发市场A区101号'
    }
  })

  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      password: hashedPassword,
      name: '李四',
      phone: '13900139000',
      role: 'MERCHANT',
      businessName: '李四水果店',
      address: '北京市海淀区中关村大街123号'
    }
  })

  const category1 = await prisma.category.upsert({
    where: { name: '苹果' },
    update: {},
    create: {
      name: '苹果',
      description: '新鲜苹果，多种品种'
    }
  })

  const category2 = await prisma.category.upsert({
    where: { name: '香蕉' },
    update: {},
    create: {
      name: '香蕉',
      description: '进口香蕉，香甜可口'
    }
  })

  const category3 = await prisma.category.upsert({
    where: { name: '橙子' },
    update: {},
    create: {
      name: '橙子',
      description: '新鲜橙子，维生素C丰富'
    }
  })

  await prisma.product.upsert({
    where: { id: 'prod1' },
    update: {},
    create: {
      id: 'prod1',
      name: '红富士苹果',
      description: '山东烟台红富士，甜脆多汁',
      price: 8.5,
      stock: 1000,
      unit: '斤',
      categoryId: category1.id,
      wholesalerId: wholesaler.id,
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'
    }
  })

  await prisma.product.upsert({
    where: { id: 'prod2' },
    update: {},
    create: {
      id: 'prod2',
      name: '进口香蕉',
      description: '菲律宾进口香蕉，香甜软糯',
      price: 5.5,
      stock: 800,
      unit: '斤',
      categoryId: category2.id,
      wholesalerId: wholesaler.id,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
    }
  })

  await prisma.product.upsert({
    where: { id: 'prod3' },
    update: {},
    create: {
      id: 'prod3',
      name: '赣南脐橙',
      description: '江西赣南脐橙，果肉饱满',
      price: 6.8,
      stock: 600,
      unit: '斤',
      categoryId: category3.id,
      wholesalerId: wholesaler.id,
      imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400'
    }
  })

  console.log('数据库初始化完成！')
  console.log('批发商账号: wholesaler@example.com / 123456')
  console.log('商户账号: merchant@example.com / 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
