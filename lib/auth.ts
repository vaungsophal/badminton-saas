import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './server-db'

// This file is server-only

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export type UserRole = 'admin' | 'club_owner' | 'customer'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export async function getCurrentUser(token?: string): Promise<AuthUser | null> {
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await db.get(
      'SELECT id, email, role FROM user_profiles WHERE id = $1',
      [decoded.userId]
    )

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    }
  } catch (error) {
    return null
  }
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole = 'customer',
  companyName?: string,
  fullName?: string
) {
  const existingUser = await db.get(
    'SELECT id FROM user_profiles WHERE email = $1',
    [email]
  )

  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const userId = crypto.randomUUID()

  await db.query(
    `INSERT INTO user_profiles (id, email, password_hash, role, company_name, full_name, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [userId, email, hashedPassword, role, companyName, fullName]
  )

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

  return {
    user: { id: userId, email, role },
    token,
  }
}

export async function signIn(email: string, password: string) {
  const user = await db.get(
    'SELECT id, email, password_hash, role FROM user_profiles WHERE email = $1',
    [email]
  )

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  if (!isValidPassword) {
    throw new Error('Invalid credentials')
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  return {
    user: { id: user.id, email: user.email, role: user.role },
    token,
  }
}

export async function signOut() {
  return { success: true }
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
