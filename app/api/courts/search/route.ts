import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const location = searchParams.get('location')
    const maxDistance = searchParams.get('max_distance')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const date = searchParams.get('date')
    const startTime = searchParams.get('start_time')
    const endTime = searchParams.get('end_time')
    const amenities = searchParams.get('amenities')
    const rating = searchParams.get('rating')

    let sql = `
      SELECT 
        c.*,
        cl.name as club_name,
        cl.address,
        cl.latitude,
        cl.longitude,
        cl.rating,
        cl.amenities,
        cl.is_active
      FROM courts c
      JOIN clubs cl ON c.club_id = cl.id
      WHERE c.status = 'open' 
      AND cl.is_active = true
    `
    const params: any[] = []

    // Text search
    if (query) {
      sql += ` AND (
        c.name ILIKE $${params.length + 1} OR
        cl.name ILIKE $${params.length + 1} OR
        cl.address ILIKE $${params.length + 1}
      )`
      params.push(`%${query}%`)
    }

    // Price range
    if (minPrice) {
      sql += ` AND c.price_per_hour >= $${params.length + 1}`
      params.push(parseFloat(minPrice))
    }
    if (maxPrice) {
      sql += ` AND c.price_per_hour <= $${params.length + 1}`
      params.push(parseFloat(maxPrice))
    }

    // Rating filter
    if (rating && parseInt(rating) > 0) {
      sql += ` AND cl.rating >= $${params.length + 1}`
      params.push(parseFloat(rating))
    }

    // Location filter
    if (location) {
      sql += ` AND cl.address ILIKE $${params.length + 1}`
      params.push(`%${location}%`)
    }

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(',')
      sql += ` AND cl.amenities ?| $${params.length + 1}`
      params.push(amenityList)
    }

    sql += ' ORDER BY cl.rating DESC, c.price_per_hour ASC'

    const courts = await db.getMany(sql, params)

    // Filter by availability if date and time are provided
    let filteredCourts = courts
    
    if (date && (startTime || endTime)) {
      const availableCourtIds = await getAvailableCourts(
        date,
        startTime || undefined,
        endTime || undefined
      )
      
      filteredCourts = filteredCourts.filter((court: any) => 
        availableCourtIds.includes(court.id)
      )
    }

    return NextResponse.json({
      courts: filteredCourts,
      count: filteredCourts.length
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getAvailableCourts(
  date: string,
  startTime?: string,
  endTime?: string
): Promise<string[]> {
  let sql = `
    SELECT DISTINCT court_id 
    FROM time_slots 
    WHERE date = $1 
    AND is_available = true
  `
  const params: any[] = [date]

  if (startTime) {
    sql += ` AND start_time >= $${params.length + 1}`
    params.push(startTime)
  }
  if (endTime) {
    sql += ` AND end_time <= $${params.length + 1}`
    params.push(endTime)
  }

  const result = await db.getMany(sql, params)
  return result.map((slot: any) => slot.court_id)
}