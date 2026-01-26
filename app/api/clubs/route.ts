import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')

    let query = 'SELECT * FROM clubs'
    const params = []

    if (ownerId) {
      query += ' WHERE owner_id = $1'
      params.push(ownerId)
    }

    const clubs = await db.getMany(query, params)
    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner_id, name, description, location, latitude, longitude, phone, email } = body

const club = await db.insert('clubs', {
      owner_id,
      name,
      description: description || null,
      address: location || null,
      latitude: latitude || null,
      longitude: longitude || null,
      phone: phone || null,
      email: email || null,
      images: [],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    })

    return NextResponse.json({ club }, { status: 201 })
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json({ error: 'Failed to create club' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('id')
    const ownerId = searchParams.get('owner_id')

    if (!clubId || !ownerId) {
      return NextResponse.json({ error: 'Club ID and owner ID are required' }, { status: 400 })
    }

const club = await db.getOne(
       'DELETE FROM clubs WHERE id = $1 AND owner_id = $2 RETURNING *',
       [clubId, ownerId]
     )

     if (!club) {
       return NextResponse.json({ error: 'Club not found or unauthorized' }, { status: 404 })
     }

     return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting club:', error)
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 })
  }
}