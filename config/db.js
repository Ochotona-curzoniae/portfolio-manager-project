import mysql from "mysql2/promise"
import dotenv from "dotenv"
dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "financial_dashboard",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

const pool = mysql.createPool(dbConfig)

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ database connected")
    connection.release()
  } catch (error) {
    console.error("❌ database connection failed:", error.message)
  }
}

testConnection()

export default pool