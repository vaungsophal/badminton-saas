import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const courtId = searchParams.get('id')

    if (courtId) {
      // Get specific court with club info
      const result = await db.query(`
        SELECT c.*, cl.name as club_name, cl.owner_id
        FROM courts c
        JOIN clubs cl ON c.club_id = cl.id
        WHERE c.id = $1
      `, [courtId])
      const court = result.rows[0]
      if (!court) {
        return NextResponse.json({ error: 'Court not found' }, { status: 404 })
      }
      return NextResponse.json(court)
    }

    // Get courts by owner
    let query = `
      SELECT c.*, cl.name as club_name
      FROM courts c
      JOIN clubs cl ON c.club_id = cl.id
    `
    const params = []

    if (ownerId) {
      query += ' WHERE cl.owner_id = $1'
      params.push(ownerId)
    }

    const result = await db.query(query, params)
    const courts = result.rows
    return NextResponse.json({ courts })
  } catch (error) {
    console.error('Error fetching courts:', error)
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner_id, club_id, court_name, price_per_hour, available_time_slots, status, images } = body

    // Validate that the club belongs to the owner
    const clubCheck = await db.query(
      'SELECT id FROM clubs WHERE id = $1 AND owner_id = $2',
      [club_id, owner_id]
    )

    if (clubCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Club not found or unauthorized' }, { status: 404 })
    }

    const result = await db.query(`
      INSERT INTO courts (club_id, name, description, images, price_per_hour, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [
      club_id,
      court_name,
      null,
      images || [],
      price_per_hour,
      status || 'open'
    ])
    const court = result.rows[0]

    return NextResponse.json({ court }, { status: 201 })
  } catch (error) {
    console.error('Error creating court:', error)
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courtId = searchParams.get('id')
    const ownerId = searchParams.get('owner_id')

    if (!courtId || !ownerId) {
      return NextResponse.json(
        { error: 'Court ID and owner ID are required' },
        { status: 400 }
      )
    }

    // First check if court exists and belongs to owner
    const existingCourtResult = await db.query(`
      SELECT c.*, cl.owner_id 
      FROM courts c
      JOIN clubs cl ON c.club_id = cl.id
      WHERE c.id = $1
    `, [courtId])

    const existingCourt = existingCourtResult.rows[0]

    if (!existingCourt || existingCourt.owner_id !== ownerId) {
      return NextResponse.json(
        { error: 'Court not found or unauthorized' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { club_id, court_name, price_per_hour, status, images } = body

    const result = await db.query(`
      UPDATE courts SET club_id = $1, name = $2, price_per_hour = $3, status = $4, images = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [
      club_id,
      court_name,
      price_per_hour,
      status || 'open',
      images || [],
      courtId
    ])

    const court = result.rows[0]
    return NextResponse.json({ court })
  } catch (error) {
    console.error('Error updating court:', error)
    return NextResponse.json({ error: 'Failed to update court' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courtId = searchParams.get('id')
    const ownerId = searchParams.get('owner_id')

    if (!courtId || !ownerId) {
      return NextResponse.json({ error: 'Court ID and owner ID are required' }, { status: 400 })
    }

const courtResult = await db.query(`
      SELECT c.*, cl.owner_id 
      FROM courts c
      JOIN clubs cl ON c.club_id = cl.id
      WHERE c.id = $1
    `, [courtId])

    const court = courtResult.rows[0]
    if (!court || court.owner_id !== ownerId) {
      return NextResponse.json({ error: 'Court not found or unauthorized' }, { status: 404 })
     }

    const deleteResult = await db.query('DELETE FROM courts WHERE id = $1 RETURNING *', [courtId])
    const deletedCourt = deleteResult.rows[0]
    return NextResponse.json({ success: true, court: deletedCourt })
  } catch (error) {
    console.error('Error deleting court:', error)
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 })
  }
}