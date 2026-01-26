import { db } from './db'

export async function getCourts(ownerId?: string) {
  if (ownerId) {
    return db.all(
      'SELECT * FROM courts WHERE owner_id = $1 AND is_active = true ORDER BY created_at DESC',
      [ownerId]
    )
  }

  return db.all(
    'SELECT * FROM courts WHERE is_active = true ORDER BY created_at DESC'
  )
}

export async function getAvailableSlots(courtId: string, date: string) {
  return db.all(
    'SELECT * FROM time_slots WHERE court_id = $1 AND date = $2 AND is_available = true ORDER BY start_time ASC',
    [courtId, date]
  )
}

export async function bookSlot(
  slotId: string,
  courtId: string,
  userId: string,
  playerCount: number
) {
  try {
    const result = await db.query(
      `INSERT INTO bookings (time_slot_id, court_id, user_id, player_count, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, 'confirmed', NOW(), NOW()) 
       RETURNING *`,
      [slotId, courtId, userId, playerCount]
    )

    const booking = result.rows[0]

    if (booking) {
      await db.query(
        'UPDATE time_slots SET is_available = false, updated_at = NOW() WHERE id = $1',
        [slotId]
      )
    }

    return { data: booking, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getBookings(userId: string, role: string) {
  if (role === 'club_owner') {
    return db.all(
      `SELECT b.*, c.name as court_name, ts.date, ts.start_time, ts.end_time, up.full_name, up.email
       FROM bookings b
       JOIN courts c ON b.court_id = c.id
       JOIN time_slots ts ON b.time_slot_id = ts.id
       JOIN user_profiles up ON b.user_id = up.id
       WHERE c.owner_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    )
  }

  return db.all(
    `SELECT b.*, c.name as court_name, c.location, ts.date, ts.start_time, ts.end_time
     FROM bookings b
     JOIN courts c ON b.court_id = c.id
     JOIN time_slots ts ON b.time_slot_id = ts.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  )
}

export async function createPaymentIntent(bookingId: string, amount: number) {
  // This would typically call a payment service like Stripe
  // For now, we'll return a mock response
  return {
    clientSecret: `pi_${bookingId}_${amount}`,
    bookingId,
    amount,
  }
}

export async function createCourt(courtData: any) {
  const { name, location, description, owner_id, hourly_rate, amenities } = courtData
  
  try {
    const result = await db.query(
      `INSERT INTO courts (name, location, description, owner_id, hourly_rate, amenities, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW()) 
       RETURNING *`,
      [name, location, description, owner_id, hourly_rate, JSON.stringify(amenities)]
    )

    return { data: result.rows[0], error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function createTimeSlots(courtId: string, date: string, slots: any[]) {
  try {
    const slotPromises = slots.map(slot => 
      db.query(
        `INSERT INTO time_slots (court_id, date, start_time, end_time, is_available, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, true, NOW(), NOW()) 
         RETURNING *`,
        [courtId, date, slot.start_time, slot.end_time]
      )
    )

    const results = await Promise.all(slotPromises)
    return { data: results.map(r => r.rows[0]), error: null }
  } catch (error) {
    return { data: null, error }
  }
}
