// 推送数据库结构到 Turso
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { createClient } = require('@libsql/client')

// 手动读取 .env.local 文件
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

// 解析环境变量
const env = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // 去除引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }
  }
})

console.log('🚀 正在推送数据库结构到 Turso...\n')
console.log(`数据库: ${env.TURSO_DATABASE_URL}\n`)

async function pushSchema() {
  try {
    // 1. 生成迁移 SQL
    console.log('📝 步骤 1/2: 生成迁移 SQL...')
    const migrationSql = execSync(
      'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
      { encoding: 'utf-8' }
    )

    console.log('✅ SQL 生成成功\n')

    // 保存 SQL 到文件以供检查
    const sqlPath = path.join(__dirname, 'migration.sql')
    fs.writeFileSync(sqlPath, migrationSql)
    console.log(`💾 SQL 已保存到: ${sqlPath}\n`)

    // 2. 连接到 Turso 并执行 SQL
    console.log('📡 步骤 2/2: 连接到 Turso 并执行迁移...')
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    })

    // 将 SQL 分割成单独的语句并执行
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`执行 ${statements.length} 条 SQL 语句...\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          await client.execute(statement)
          console.log(`✓ 语句 ${i + 1}/${statements.length} 执行成功`)
        } catch (error) {
          // 忽略 "table already exists" 错误
          if (error.message.includes('already exists')) {
            console.log(`⚠ 语句 ${i + 1}/${statements.length} - 表已存在,跳过`)
          } else {
            throw error
          }
        }
      }
    }

    await client.close()

    console.log('\n✅ 数据库结构推送成功！')
    console.log('📊 所有表和索引已创建')

  } catch (error) {
    console.error('\n❌ 推送失败:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

pushSchema()

