import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = `
      SELECT 
        c.*,
        u.full_name as owner_name,
        u.email as owner_email,
        COUNT(co.id) as court_count,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as total_revenue,
        AVG(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE NULL END) as avg_booking_value
      FROM clubs c
      LEFT JOIN user_profiles u ON c.owner_id = u.id
      LEFT JOIN courts co ON c.id = co.club_id
      LEFT JOIN bookings b ON co.id = b.court_id
      WHERE u.role = 'club_owner'
    `
    const params = []
    const conditions = []

    if (status && status !== 'all') {
      conditions.push('c.is_active = $' + (params.length + 1))
      params.push(status === 'active' ? 'true' : 'false')
    }

    if (search) {
      conditions.push(`(
        c.name ILIKE $${params.length + 1} OR 
        u.full_name ILIKE $${params.length + 1} OR 
        u.email ILIKE $${params.length + 1} OR 
        c.address ILIKE $${params.length + 1}
      )`)
      params.push(`%${search}%`)
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ')
    }

    query += ' GROUP BY c.id, u.full_name, u.email ORDER BY c.created_at DESC'

    const result = await db.query(query, params)
    const clubs = result.rows.map(club => ({
      ...club,
      total_revenue: parseFloat(club.total_revenue) || 0,
      avg_booking_value: parseFloat(club.avg_booking_value) || 0,
      court_count: parseInt(club.court_count) || 0,
      total_bookings: parseInt(club.total_bookings) || 0,
      is_active: club.is_active ? 'active' : 'inactive'
    }))

    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Error fetching admin clubs:', error)
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 })
    }

    const result = await db.query(
      'UPDATE clubs SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [is_active, id]
    )

    const club = result.rows[0]
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    return NextResponse.json({ club })
  } catch (error) {
    console.error('Error updating club status:', error)
    return NextResponse.json({ error: 'Failed to update club' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('id')

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 })
    }

    // Check if club has courts
    const courtsResult = await db.query(
      'SELECT COUNT(*) as count FROM courts WHERE club_id = $1',
      [clubId]
    )
    const courtCount = parseInt(courtsResult.rows[0].count)

    if (courtCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete club with existing courts' },
        { status: 400 }
      )
    }

    const result = await db.query(
      'DELETE FROM clubs WHERE id = $1 RETURNING *',
      [clubId]
    )
    const club = result.rows[0]

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, club })
  } catch (error) {
    console.error('Error deleting club:', error)
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 })
  }
}