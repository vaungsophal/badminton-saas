import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  get: (text: string, params?: any[]) => pool.query(text, params).then(res => res.rows[0]),
  all: (text: string, params?: any[]) => pool.query(text, params).then(res => res.rows),
}

export default pool