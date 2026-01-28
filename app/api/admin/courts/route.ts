import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = `
      SELECT 
        c.id,
        c.name,
        c.price_per_hour,
        c.status as court_status,
        c.created_at,
        c.updated_at,
        cl.name as club_name,
        cl.address as location,
        cl.owner_id,
        up.first_name || ' ' || up.last_name as owner_name,
        COUNT(b.id) as bookings,
        COALESCE(AVG(r.rating), 0) as rating,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as revenue
      FROM courts c
      JOIN clubs cl ON c.club_id = cl.id
      JOIN user_profiles up ON cl.owner_id = up.id
      LEFT JOIN bookings b ON c.id = b.court_id
      LEFT JOIN reviews r ON b.id = r.booking_id
    `

    const params = []
    const whereConditions = []

    if (status && status !== 'all') {
      whereConditions.push(`c.status = $${params.length + 1}`)
      params.push(status)
    }

    if (search) {
      whereConditions.push(`(
        c.name ILIKE $${params.length + 1} OR 
        cl.name ILIKE $${params.length + 1} OR 
        up.first_name ILIKE $${params.length + 1} OR 
        up.last_name ILIKE $${params.length + 1}
      )`)
      params.push(`%${search}%`)
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ')
    }

    query += `
      GROUP BY c.id, cl.name, cl.address, cl.owner_id, up.first_name, up.last_name
      ORDER BY c.created_at DESC
    `

    const result = await db.query(query, params)
    const courts = result.rows.map(court => ({
      id: court.id,
      name: court.name,
      owner: court.owner_name,
      location: court.location,
      courts: 1, // This represents individual court, so always 1
      status: court.court_status,
      rating: parseFloat(court.rating) || 0,
      bookings: parseInt(court.bookings) || 0,
      price_per_hour: parseFloat(court.price_per_hour) || 0,
      revenue: parseFloat(court.revenue) || 0,
      club_name: court.club_name,
      created_at: court.created_at,
      updated_at: court.updated_at
    }))

    return NextResponse.json({ courts })
  } catch (error) {
    console.error('Error fetching admin courts:', error)
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courtId = searchParams.get('id')
    
    if (!courtId) {
      return NextResponse.json({ error: 'Court ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['open', 'closed', 'maintenance'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required (open, closed, maintenance)' }, { status: 400 })
    }

    const result = await db.query(`
      UPDATE courts 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, courtId])

    const court = result.rows[0]
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    }

    return NextResponse.json({ court })
  } catch (error) {
    console.error('Error updating court status:', error)
    return NextResponse.json({ error: 'Failed to update court' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courtId = searchParams.get('id')
    
    if (!courtId) {
      return NextResponse.json({ error: 'Court ID is required' }, { status: 400 })
    }

    // Check if court has any bookings
    const bookingCheck = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE court_id = $1',
      [courtId]
    )

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete court with existing bookings' 
      }, { status: 400 })
    }

    const result = await db.query(
      'DELETE FROM courts WHERE id = $1 RETURNING *',
      [courtId]
    )

    const court = result.rows[0]
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, court })
  } catch (error) {
    console.error('Error deleting court:', error)
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 })
  }
}