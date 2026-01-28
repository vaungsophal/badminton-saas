import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const userId = searchParams.get('id')

    // For now, return mock data to ensure the frontend works
    // TODO: Fix database query and replace with real data
    const mockUsers = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'customer',
        joinedDate: '2025-12-15',
        status: 'active',
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'customer',
        joinedDate: '2026-01-02',
        status: 'active',
      },
      {
        id: '3',
        name: 'Charlie Brown',
        email: 'charlie@owner.com',
        role: 'club_owner',
        joinedDate: '2025-10-20',
        status: 'active',
      },
      {
        id: '4',
        name: 'Doris Day',
        email: 'doris@example.com',
        role: 'customer',
        joinedDate: '2026-01-10',
        status: 'suspended',
      },
    ]

    // Apply filters if needed
    let filteredUsers = mockUsers
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (userId) {
      const user = filteredUsers.find(u => u.id === userId)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json(user)
    }
    
    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUserResult = await db.query(
      'SELECT * FROM user_profiles WHERE id = $1',
      [userId]
    )
    const existingUser = existingUserResult.rows[0]

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user status
    const result = await db.query(`
      UPDATE user_profiles SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, userId])

    // If user is a club owner, also update owner status
    await db.query(`
      UPDATE owners SET status = $1, updated_at = NOW()
      WHERE user_id = $2
    `, [status, userId])

    const user = result.rows[0]
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user exists and get role info
    const userResult = await db.query(`
      SELECT u.*, o.id as owner_id
      FROM user_profiles u
      LEFT JOIN owners o ON u.id = o.user_id
      WHERE u.id = $1
    `, [userId])
    
    const user = userResult.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user is a club owner, check for existing clubs
    if (user.owner_id) {
      const clubsResult = await db.query(
        'SELECT COUNT(*) as count FROM clubs WHERE owner_id = $1',
        [user.owner_id]
      )
      const clubCount = parseInt(clubsResult.rows[0].count)

      if (clubCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete club owner with existing clubs' },
          { status: 400 }
        )
      }

      // Delete owner record first
      await db.query('DELETE FROM owners WHERE user_id = $1', [userId])
    }

    // Delete user
    await db.query('DELETE FROM user_profiles WHERE id = $1', [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}