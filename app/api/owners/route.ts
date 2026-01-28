import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const ownerId = searchParams.get('id')

    if (ownerId) {
      // Get specific owner
      const result = await db.query(`
        SELECT u.*, COUNT(c.id) as club_count, COUNT(co.id) as court_count
        FROM user_profiles u
        LEFT JOIN clubs c ON u.id = c.owner_id
        LEFT JOIN courts co ON c.id = co.club_id
        WHERE u.id = $1 AND u.role = 'club_owner'
        GROUP BY u.id
      `, [ownerId])
      const owner = result.rows[0]
      if (!owner) {
        return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
      }
      return NextResponse.json(owner)
    }

    // Get owners with club and court counts
    let query = `
      SELECT u.*, COUNT(c.id) as club_count, COUNT(co.id) as court_count
      FROM user_profiles u
      LEFT JOIN clubs c ON u.id = c.owner_id
      LEFT JOIN courts co ON c.id = co.club_id
      WHERE u.role = 'club_owner'
    `
    const params = []

    if (status && status !== 'all') {
      if (status === 'active') {
        query += ' AND u.is_verified = true AND u.status = $1'
        params.push('active')
      } else if (status === 'pending') {
        query += ' AND (u.is_verified = false OR u.status != $1)'
        params.push('active')
      }
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC'

    const result = await db.query(query, params)
    const owners = result.rows
    return NextResponse.json({ owners })
  } catch (error) {
    console.error('Error fetching owners:', error)
    return NextResponse.json({ error: 'Failed to fetch owners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, company_name, is_verified = false, status = 'active' } = body

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, email' },
        { status: 400 }
      )
    }

    const result = await db.query(`
      INSERT INTO user_profiles (id, email, role, full_name, phone, company_name, is_verified, status, created_at, updated_at)
      VALUES ($1, $2, 'club_owner', $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      id,
      email,
      name,
      phone || null,
      company_name || null,
      is_verified,
      status
    ])
    
    const owner = result.rows[0]
    return NextResponse.json({ owner }, { status: 201 })
  } catch (error) {
    console.error('Error creating owner:', error)
    return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('id')

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, phone, company_name, is_verified, status } = body

    // First check if owner exists
    const existingOwnerResult = await db.query(
      'SELECT * FROM user_profiles WHERE id = $1 AND role = $2',
      [ownerId, 'club_owner']
    )
    const existingOwner = existingOwnerResult.rows[0]

    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      )
    }

    const result = await db.query(`
      UPDATE user_profiles SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), phone = COALESCE($3, phone), company_name = COALESCE($4, company_name), is_verified = COALESCE($5, is_verified), status = COALESCE($6, status), updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [
      name,
      email,
      phone,
      company_name,
      is_verified,
      status,
      ownerId
    ])

    const owner = result.rows[0]
    return NextResponse.json({ owner })
  } catch (error) {
    console.error('Error updating owner:', error)
    return NextResponse.json({ error: 'Failed to update owner' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('id')

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID is required' }, { status: 400 })
    }

    // Check if owner has clubs before deletion
    const clubsResult = await db.query(
      'SELECT COUNT(*) as count FROM clubs WHERE owner_id = $1',
      [ownerId]
    )
    const clubCount = parseInt(clubsResult.rows[0].count)

    if (clubCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete owner with existing clubs' },
        { status: 400 }
      )
    }

    const result = await db.query(
      'DELETE FROM user_profiles WHERE id = $1 AND role = $2 RETURNING *',
      [ownerId, 'club_owner']
    )
    const owner = result.rows[0]

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting owner:', error)
    return NextResponse.json({ error: 'Failed to delete owner' }, { status: 500 })
  }
}