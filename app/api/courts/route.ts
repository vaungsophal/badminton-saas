import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

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

    const courts = await db.getMany(query, params)
    return NextResponse.json({ courts })
  } catch (error) {
    console.error('Error fetching courts:', error)
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner_id, club_id, court_name, price_per_hour, available_time_slots, status } = body

const court = await db.insert('courts', {
      club_id,
      name: court_name,
      description: null,
      images: [],
      price_per_hour,
      status: status || 'open',
      created_at: new Date(),
      updated_at: new Date()
    })

    return NextResponse.json({ court }, { status: 201 })
  } catch (error) {
    console.error('Error creating court:', error)
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, owner_id, status } = body

const court = await db.getOne(`
      SELECT c.*, cl.owner_id 
      FROM courts c
      JOIN clubs cl ON c.club_id = cl.id
      WHERE c.id = $1
    `, [id])

    if (!court || court.owner_id !== owner_id) {
      return NextResponse.json({ error: 'Court not found or unauthorized' }, { status: 404 })
    }

    const updatedCourt = await db.update('courts', 'id', id, {
      status,
      updated_at: new Date()
    })

    return NextResponse.json({ court: updatedCourt })
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

const court = await db.getOne(`
      SELECT c.*, cl.owner_id 
      FROM courts c
      JOIN clubs cl ON c.club_id = cl.id
      WHERE c.id = $1
    `, [courtId])

    if (!court || court.owner_id !== ownerId) {
      return NextResponse.json({ error: 'Court not found or unauthorized' }, { status: 404 })
     }

    const deletedCourt = await db.delete('courts', courtId)
    return NextResponse.json({ success: true, court: deletedCourt })
  } catch (error) {
    console.error('Error deleting court:', error)
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 })
  }
}