import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')

    let query = 'SELECT * FROM bookings'
    const params = []
    const conditions = []

    if (ownerId) {
      conditions.push('owner_id = $' + (params.length + 1))
      params.push(ownerId)
    }

    if (status) {
      conditions.push('status = $' + (params.length + 1))
      params.push(status)
    }

    if (startDate) {
      conditions.push('booking_date >= $' + (params.length + 1))
      params.push(startDate)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const bookings = await db.all(query, params)
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, owner_id, status } = body

    const result = await db.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING *',
      [status, id, owner_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}