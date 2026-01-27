import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courtId = searchParams.get('court_id')
    const date = searchParams.get('date')

    if (!courtId || !date) {
      return NextResponse.json({ error: 'Court ID and date are required' }, { status: 400 })
    }

    // First check if time slots exist for this court and date
    const existingSlots = await db.query(
      'SELECT * FROM time_slots WHERE court_id = $1 AND date = $2 ORDER BY start_time ASC',
      [courtId, date]
    )

    // If slots exist, return them
    if (existingSlots.rows.length > 0) {
      return NextResponse.json({ timeSlots: existingSlots.rows })
    }

    // If no slots exist, generate them based on default operating hours
    const courtResult = await db.query(
      'SELECT description FROM courts WHERE id = $1',
      [courtId]
    )

    if (courtResult.rows.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    }

    const court = courtResult.rows[0]
    
    // Parse operating hours from description if available, otherwise use defaults
    let operatingHours = { start_time: '06:00', end_time: '22:00' }
    let slotDuration = 60
    
    try {
      if (court.description) {
        const parsed = JSON.parse(court.description)
        operatingHours = parsed.operating_hours || operatingHours
        slotDuration = parsed.slot_duration || slotDuration
      }
    } catch (e) {
      // Use defaults if parsing fails
    }

    // Generate time slots
    const slots = []
    const startTime = new Date(`2000-01-01T${operatingHours.start_time}:00`)
    const endTime = new Date(`2000-01-01T${operatingHours.end_time}:00`)
    
    let currentTime = new Date(startTime)
    
    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime.getTime() + slotDuration * 60000)
      
      if (slotEndTime <= endTime) {
        slots.push({
          court_id: courtId,
          date: date,
          start_time: currentTime.toTimeString().slice(0, 5),
          end_time: slotEndTime.toTimeString().slice(0, 5),
          is_available: true
        })
      }
      
      currentTime = slotEndTime
    }

    // Insert generated slots into database
    if (slots.length > 0) {
      const insertPromises = slots.map(slot =>
        db.query(
          `INSERT INTO time_slots (court_id, date, start_time, end_time, is_available, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
           RETURNING *`,
          [slot.court_id, slot.date, slot.start_time, slot.end_time, slot.is_available]
        )
      )
      
      const results = await Promise.all(insertPromises)
      return NextResponse.json({ timeSlots: results.map(r => r.rows[0]) })
    }

    return NextResponse.json({ timeSlots: [] })
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json({ error: 'Failed to fetch time slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courtId, date, slots } = body

    if (!courtId || !date || !slots || !Array.isArray(slots)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Delete existing slots for this court and date
    await db.query(
      'DELETE FROM time_slots WHERE court_id = $1 AND date = $2',
      [courtId, date]
    )

    // Insert new slots
    const insertPromises = slots.map(slot =>
      db.query(
        `INSERT INTO time_slots (court_id, date, start_time, end_time, is_available, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING *`,
        [courtId, date, slot.start_time, slot.end_time, slot.is_available !== false]
      )
    )

    const results = await Promise.all(insertPromises)
    return NextResponse.json({ timeSlots: results.map(r => r.rows[0]) }, { status: 201 })
  } catch (error) {
    console.error('Error creating time slots:', error)
    return NextResponse.json({ error: 'Failed to create time slots' }, { status: 500 })
  }
}