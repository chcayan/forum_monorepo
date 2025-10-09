import dotenv from 'dotenv'
import path from 'path'

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'

dotenv.config({ path: path.resolve(process.cwd(), envFile) })

console.log('当前环境:', process.env.NODE_ENV)
console.log('host:', process.env.SERVER_HOST)
console.log('port:', process.env.PORT)
console.log('数据库地址:', process.env.DB_HOST)
