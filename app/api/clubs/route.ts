import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const clubId = searchParams.get('id')

    if (clubId) {
      // Get specific club
      const result = await db.query('SELECT * FROM clubs WHERE id = $1', [clubId])
      const club = result.rows[0]
      if (!club) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 })
      }
      return NextResponse.json(club)
    }

    // Get clubs by owner with court count
    let query = `
      SELECT c.*, COUNT(co.id) as court_count
      FROM clubs c
      LEFT JOIN courts co ON c.id = co.club_id
    `
    const params = []

    if (ownerId) {
      query += ' WHERE c.owner_id = $1'
      params.push(ownerId)
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC'

    const result = await db.query(query, params)
    const clubs = result.rows
    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('id')
    const ownerId = searchParams.get('owner_id')

    if (!clubId || !ownerId) {
      return NextResponse.json(
        { error: 'Club ID and owner ID are required' },
        { status: 400 }
      )
    }

    // First check if club exists and belongs to owner
    const existingClubResult = await db.query(
      'SELECT * FROM clubs WHERE id = $1 AND owner_id = $2',
      [clubId, ownerId]
    )
    const existingClub = existingClubResult.rows[0]

    if (!existingClub) {
      return NextResponse.json(
        { error: 'Club not found or unauthorized' },
        { status: 404 }
      )
    }

const body = await request.json()
    const { name, description, address, latitude, longitude, phone, email, images } = body

    const result = await db.query(`
      UPDATE clubs SET name = $1, description = $2, address = $3, latitude = $4, longitude = $5, phone = $6, email = $7, images = $8, updated_at = NOW()
      WHERE id = $9 AND owner_id = $10
      RETURNING *
    `, [
      name,
      description || null,
      address,
      latitude || null,
      longitude || null,
      phone || null,
      email || null,
      images || [],
      clubId,
      ownerId
    ])

    const club = result.rows[0]
    return NextResponse.json({ club })
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json({ error: 'Failed to update club' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
const body = await request.json()
    console.log('Club creation request body:', body)
    const { owner_id, name, description, address, latitude, longitude, phone, email, images } = body

    if (!owner_id || !name || !address) {
      console.error('Missing required fields:', { owner_id, name, address })
      return NextResponse.json(
        { error: 'Missing required fields: owner_id, name, address' },
        { status: 400 }
      )
    }

    const result = await db.query(`
      INSERT INTO clubs (owner_id, name, description, address, latitude, longitude, phone, email, images, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `, [
      owner_id,
      name,
      description || null,
      address,
      latitude || null,
      longitude || null,
      phone || null,
      email || null,
      images || [],
      true
    ])
    const club = result.rows[0]

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

const result = await db.query(
       'DELETE FROM clubs WHERE id = $1 AND owner_id = $2 RETURNING *',
       [clubId, ownerId]
     )
     const club = result.rows[0]

     if (!club) {
       return NextResponse.json({ error: 'Club not found or unauthorized' }, { status: 404 })
     }

     return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting club:', error)
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 })
  }
}