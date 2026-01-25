import { supabase } from './auth'

export async function getCourts(ownerId?: string) {
  let query = supabase
    .from('courts')
    .select('*')
    .eq('is_active', true)

  if (ownerId) {
    query = query.eq('owner_id', ownerId)
  }

  return query.order('created_at', { ascending: false })
}

export async function getAvailableSlots(courtId: string, date: string) {
  return supabase
    .from('time_slots')
    .select('*')
    .eq('court_id', courtId)
    .eq('date', date)
    .eq('is_available', true)
    .order('start_time', { ascending: true })
}

export async function bookSlot(
  slotId: string,
  courtId: string,
  userId: string,
  playerCount: number
) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      time_slot_id: slotId,
      court_id: courtId,
      user_id: userId,
      player_count: playerCount,
      status: 'confirmed',
    })
    .select()
    .single()

  if (!error && data) {
    await supabase
      .from('time_slots')
      .update({ is_available: false })
      .eq('id', slotId)
  }

  return { data, error }
}

export async function getBookings(userId: string, role: string) {
  if (role === 'club_owner') {
    return supabase
      .from('bookings')
      .select('*, courts(name), time_slots(date, start_time, end_time), user_profiles(full_name, email)')
      .eq('courts.owner_id', userId)
      .order('created_at', { ascending: false })
  }

  return supabase
    .from('bookings')
    .select('*, courts(name, location), time_slots(date, start_time, end_time)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createPaymentIntent(bookingId: string, amount: number) {
  return supabase.functions.invoke('create-payment-intent', {
    body: { bookingId, amount },
  })
}
