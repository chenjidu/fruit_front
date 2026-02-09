const { PrismaClient } = require('@prisma/client')
const { PrismaLibSQL } = require('@prisma/adapter-libsql')
const { createClient } = require('@libsql/client')

async function verify() {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  const adapter = new PrismaLibSQL(libsql)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('🔍 验证 Turso 数据库迁移...\n')

    const userCount = await prisma.user.count()
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const orderItemCount = await prisma.orderItem.count()

    console.log('📊 数据统计：')
    console.log(`   用户数：${userCount}`)
    console.log(`   分类数：${categoryCount}`)
    console.log(`   商品数：${productCount}`)
    console.log(`   订单数：${orderCount}`)
    console.log(`   订单项数：${orderItemCount}\n`)

    // 测试关联查询
    console.log('🔗 测试关联查询...')
    const products = await prisma.product.findMany({
      include: { category: true, wholesaler: true },
      take: 3
    })
    console.log(`✅ 商品关联查询成功：${products.length} 条记录\n`)

    if (products.length > 0) {
      console.log('📝 示例商品数据：')
      products.forEach(p => {
        console.log(`   - ${p.name} (${p.category.name}) by ${p.wholesaler.name}`)
      })
      console.log()
    }

    // 测试订单关联
    if (orderCount > 0) {
      console.log('🔗 测试订单关联查询...')
      const orders = await prisma.order.findMany({
        include: {
          merchant: true,
          items: {
            include: { product: true }
          }
        },
        take: 2
      })
      console.log(`✅ 订单关联查询成功：${orders.length} 条记录\n`)
    }

    console.log('✅ 验证通过！所有数据和关联查询正常。\n')
  } catch (error) {
    console.error('❌ 验证失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verify()
