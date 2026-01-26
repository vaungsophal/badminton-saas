import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')

    let query = 'SELECT * FROM courts'
    const params = []

    if (ownerId) {
      query += ' WHERE owner_id = $1'
      params.push(ownerId)
    }

    const courts = await db.all(query, params)
    return NextResponse.json(courts)
  } catch (error) {
    console.error('Error fetching courts:', error)
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner_id, club_id, court_name, price_per_hour, available_time_slots, status } = body

    const result = await db.query(
      `INSERT INTO courts (owner_id, club_id, court_name, price_per_hour, available_time_slots, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [owner_id, club_id, court_name, price_per_hour, available_time_slots || '8', status || 'open']
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating court:', error)
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, owner_id, status } = body

    const result = await db.query(
      'UPDATE courts SET status = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING *',
      [status, id, owner_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Court not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
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

    const result = await db.query(
      'DELETE FROM courts WHERE id = $1 AND owner_id = $2 RETURNING *',
      [courtId, ownerId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Court not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting court:', error)
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 })
  }
}