import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await db.get(
      'SELECT * FROM user_profiles WHERE id = $1',
      [decoded.userId]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Validate user role
    const validRoles = ['admin', 'club_owner', 'customer']
    if (!validRoles.includes(user.role)) {
      console.error('Invalid user role:', user.role)
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 401 }
      )
    }

    console.log('API /auth/me - user verified with role:', user.role)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    )
  }
}