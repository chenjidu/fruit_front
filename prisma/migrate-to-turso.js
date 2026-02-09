const { PrismaClient } = require('@prisma/client')
const { PrismaLibSQL } = require('@prisma/adapter-libsql')
const { createClient } = require('@libsql/client')

async function migrate() {
  // 源：本地 SQLite
  const prismaLocal = new PrismaClient({
    datasources: { db: { url: 'file:./dev.db' } }
  })

  // 目标：Turso
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  const adapter = new PrismaLibSQL(libsql)
  const prismaTurso = new PrismaClient({ adapter })

  try {
    console.log('开始迁移数据到 Turso...\n')

    // 1. 迁移用户
    console.log('📦 迁移用户...')
    const users = await prismaLocal.user.findMany()
    for (const user of users) {
      await prismaTurso.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }
    console.log(`✅ 已迁移 ${users.length} 个用户\n`)

    // 2. 迁移分类
    console.log('📦 迁移分类...')
    const categories = await prismaLocal.category.findMany()
    for (const category of categories) {
      await prismaTurso.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      })
    }
    console.log(`✅ 已迁移 ${categories.length} 个分类\n`)

    // 3. 迁移商品
    console.log('📦 迁移商品...')
    const products = await prismaLocal.product.findMany()
    for (const product of products) {
      await prismaTurso.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      })
    }
    console.log(`✅ 已迁移 ${products.length} 个商品\n`)

    // 4. 迁移订单及订单项
    console.log('📦 迁移订单...')
    const orders = await prismaLocal.order.findMany({ include: { items: true } })
    for (const order of orders) {
      const { items, ...orderData } = order

      // 先检查订单是否已存在
      const existingOrder = await prismaTurso.order.findUnique({
        where: { id: order.id }
      })

      if (existingOrder) {
        // 如果存在，先删除旧的订单项，再创建新的
        await prismaTurso.orderItem.deleteMany({
          where: { orderId: order.id }
        })
      }

      await prismaTurso.order.upsert({
        where: { id: order.id },
        update: {
          ...orderData,
          items: {
            deleteMany: {},
            create: items.map(item => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
              createdAt: item.createdAt
            }))
          }
        },
        create: {
          ...orderData,
          items: {
            create: items.map(item => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
              createdAt: item.createdAt
            }))
          }
        }
      })
    }
    console.log(`✅ 已迁移 ${orders.length} 个订单\n`)

    console.log('🎉 迁移完成！\n')
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    throw error
  } finally {
    await prismaLocal.$disconnect()
    await prismaTurso.$disconnect()
  }
}

migrate()
