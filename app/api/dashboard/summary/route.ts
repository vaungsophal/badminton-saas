import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID is required' }, { status: 400 })
    }

    // Get overview stats
    const overviewResult = await db.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_clubs,
        COUNT(DISTINCT CASE WHEN c.is_active = true THEN c.id END) as active_clubs,
        COUNT(DISTINCT co.id) as total_courts,
        COUNT(DISTINCT CASE WHEN co.status = 'open' THEN co.id END) as open_courts,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as total_revenue,
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) > 0 
          THEN COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) / COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END)
          ELSE 0 
        END as average_per_booking
      FROM clubs c
      LEFT JOIN courts co ON c.id = co.club_id
      LEFT JOIN bookings b ON (c.id = b.club_id OR co.id = b.court_id)
      WHERE c.owner_id = $1
    `, [ownerId])

    // Get this week's stats
    const thisWeekResult = await db.query(`
      SELECT 
        COUNT(DISTINCT b.id) as bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as revenue
      FROM bookings b
      WHERE b.owner_id = $1 
        AND b.booking_date >= date_trunc('week', CURRENT_DATE)
        AND b.booking_date < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
    `, [ownerId])

    // Get recent activity (last 10 bookings)
    const recentActivityResult = await db.query(`
      SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.total_price,
        b.status,
        co.name as court_name,
        c.name as club_name,
        up.full_name as customer,
        up.email as customer_email
      FROM bookings b
      JOIN courts co ON b.court_id = co.id
      JOIN clubs c ON b.club_id = c.id
      JOIN user_profiles up ON b.customer_id = up.id
      WHERE b.owner_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [ownerId])

    // Get bookings trend for last 7 days
    const bookingsTrendResult = await db.query(`
      SELECT 
        DATE(b.booking_date) as date,
        COUNT(*) as bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as revenue
      FROM bookings b
      WHERE b.owner_id = $1 
        AND b.booking_date >= CURRENT_DATE - INTERVAL '7 days'
        AND b.booking_date <= CURRENT_DATE
      GROUP BY DATE(b.booking_date)
      ORDER BY date DESC
    `, [ownerId])

    // Get revenue distribution by court
    const revenueDistributionResult = await db.query(`
      SELECT 
        co.id,
        co.name as court_name,
        c.name as club_name,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as total_revenue
      FROM courts co
      JOIN clubs c ON co.club_id = c.id
      LEFT JOIN bookings b ON co.id = b.court_id
      WHERE c.owner_id = $1
      GROUP BY co.id, co.name, c.name
      ORDER BY total_revenue DESC
    `, [ownerId])

    const overview = overviewResult.rows[0]
    const thisWeek = thisWeekResult.rows[0]
    const recentActivity = recentActivityResult.rows
    const bookingsTrend = bookingsTrendResult.rows
    const revenueDistribution = revenueDistributionResult.rows

    // Format recent activity for display
    const formattedRecentActivity = recentActivity.map(activity => ({
      id: activity.id,
      title: `${activity.court_name} - ${activity.club_name}`,
      customer: activity.customer || activity.customer_email || 'Unknown Customer',
      date: activity.booking_date,
      time: `${activity.start_time} - ${activity.end_time}`,
      status: activity.status,
      total_price: parseFloat(activity.total_price).toFixed(2)
    }))

    const response = {
      overview: {
        totalClubs: parseInt(overview.total_clubs),
        activeClubs: parseInt(overview.active_clubs),
        totalCourts: parseInt(overview.total_courts),
        openCourts: parseInt(overview.open_courts),
        totalBookings: parseInt(overview.total_bookings),
        confirmedBookings: parseInt(overview.confirmed_bookings),
        pendingBookings: parseInt(overview.pending_bookings),
        totalRevenue: parseFloat(overview.total_revenue),
        averagePerBooking: parseFloat(overview.average_per_booking)
      },
      thisWeek: {
        bookings: parseInt(thisWeek.bookings),
        revenue: parseFloat(thisWeek.revenue)
      },
      recentActivity: formattedRecentActivity,
      bookingsTrend: bookingsTrend.map(item => ({
        date: item.date,
        bookings: parseInt(item.bookings),
        revenue: parseFloat(item.revenue)
      })),
      revenueDistribution: revenueDistribution.map(item => ({
        courtId: item.id,
        courtName: item.court_name,
        clubName: item.club_name,
        totalBookings: parseInt(item.total_bookings),
        totalRevenue: parseFloat(item.total_revenue)
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 })
  }
}