import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export class DatabaseService {
  private pool: Pool

  constructor() {
    this.pool = pool
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  async getOne(text: string, params?: any[]) {
    const result = await this.query(text, params)
    return result.rows[0] || null
  }

  async getMany(text: string, params?: any[]) {
    const result = await this.query(text, params)
    return result.rows
  }

  async insert(table: string, data: Record<string, any>) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ')
    
    const text = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
    
    const result = await this.query(text, values)
    return result.rows[0]
  }

  async update(table: string, column: string, value: any, data: Record<string, any>) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((key, index) => `${key} = $${index + 2}`).join(', ')
    
    const text = `UPDATE ${table} SET ${placeholders} WHERE ${column} = $1 RETURNING *`
    
    const result = await this.query(text, [value, ...values])
    return result.rows[0]
  }

  async delete(table: string, id: string) {
    const text = `DELETE FROM ${table} WHERE id = $1 RETURNING *`
    const result = await this.query(text, [id])
    return result.rows[0]
  }

  async findById(table: string, id: string) {
    const text = `SELECT * FROM ${table} WHERE id = $1`
    return await this.getOne(text, [id])
  }

  async findMany(table: string, conditions: Record<string, any> = {}, options: { orderBy?: string, limit?: number, offset?: number } = {}) {
    const whereClause = Object.keys(conditions).length > 0 
      ? `WHERE ${Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
      : ''
    
    let text = `SELECT * FROM ${table} ${whereClause}`
    
    if (options.orderBy) {
      text += ` ORDER BY ${options.orderBy}`
    }
    
    if (options.limit) {
      text += ` LIMIT ${options.limit}`
    }
    
    if (options.offset) {
      text += ` OFFSET ${options.offset}`
    }
    
    const params = Object.values(conditions)
    return await this.getMany(text, params)
  }
}

export const db = new DatabaseService()