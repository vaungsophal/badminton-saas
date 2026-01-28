import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Get platform overview stats
    const overviewResult = await db.query(`
      SELECT 
        COUNT(DISTINCT up.id) as total_users,
        COUNT(DISTINCT CASE WHEN up.role = 'owner' THEN up.id END) as total_owners,
        COUNT(DISTINCT c.id) as total_clubs,
        COUNT(DISTINCT co.id) as total_courts,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.commission_amount ELSE 0 END), 0) as total_commission
      FROM user_profiles up
      LEFT JOIN clubs c ON up.id = c.owner_id AND up.role = 'owner'
      LEFT JOIN courts co ON c.id = co.club_id
      LEFT JOIN bookings b ON co.id = b.court_id
    `)

    // Get monthly revenue data for charts
    let revenueQuery = ''
    if (period === 'year') {
      revenueQuery = `
        SELECT 
          DATE_TRUNC('month', b.booking_date) as month,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as revenue,
          COUNT(CASE WHEN b.status = 'confirmed' THEN b.id END) as bookings
        FROM bookings b
        WHERE b.booking_date >= date_trunc('year', CURRENT_DATE) - INTERVAL '1 year'
        GROUP BY DATE_TRUNC('month', b.booking_date)
        ORDER BY month DESC
        LIMIT 12
      `
    } else {
      revenueQuery = `
        SELECT 
          DATE_TRUNC('month', b.booking_date) as month,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as revenue,
          COUNT(CASE WHEN b.status = 'confirmed' THEN b.id END) as bookings
        FROM bookings b
        WHERE b.booking_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', b.booking_date)
        ORDER BY month DESC
        LIMIT 7
      `
    }

    const revenueResult = await db.query(revenueQuery)

    // Get growth stats (compare with previous period)
    const growthResult = await db.query(`
      WITH current_period AS (
        SELECT 
          COUNT(DISTINCT CASE WHEN up.role = 'owner' THEN up.id END) as active_owners,
          COUNT(DISTINCT up.id) as new_users,
          COUNT(DISTINCT b.id) as total_bookings
        FROM user_profiles up
        LEFT JOIN bookings b ON up.id = b.customer_id
        WHERE up.created_at >= date_trunc('month', CURRENT_DATE)
      ),
      previous_period AS (
        SELECT 
          COUNT(DISTINCT CASE WHEN up.role = 'owner' THEN up.id END) as active_owners,
          COUNT(DISTINCT up.id) as new_users,
          COUNT(DISTINCT b.id) as total_bookings
        FROM user_profiles up
        LEFT JOIN bookings b ON up.id = b.customer_id
        WHERE up.created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
          AND up.created_at < date_trunc('month', CURRENT_DATE)
      )
      SELECT 
        cp.active_owners as current_owners,
        pp.active_owners as previous_owners,
        cp.new_users as current_users,
        pp.new_users as previous_users,
        cp.total_bookings as current_bookings,
        pp.total_bookings as previous_bookings
      FROM current_period cp, previous_period pp
    `)

    // Get retention rate
    const retentionResult = await db.query(`
      WITH monthly_users AS (
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(DISTINCT id) as new_users
        FROM user_profiles
        WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '3 months')
        GROUP BY DATE_TRUNC('month', created_at)
      ),
      returning_users AS (
        SELECT 
          COUNT(DISTINCT up.id) as returning_count
        FROM user_profiles up
        JOIN bookings b ON up.id = b.customer_id
        WHERE b.booking_date >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
          AND up.created_at < date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      )
      SELECT 
        mu.new_users,
        ru.returning_count
      FROM monthly_users mu, returning_users ru
      WHERE mu.month = date_trunc('month', CURRENT_DATE - INTERVAL '2 months')
      LIMIT 1
    `)

    const overview = overviewResult.rows[0]
    const growth = growthResult.rows[0]
    const retention = retentionResult.rows[0]

    // Format revenue data for charts
    const revenueData = revenueResult.rows.reverse().map(row => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
      revenue: parseFloat(row.revenue),
      bookings: parseInt(row.bookings)
    }))

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const ownerGrowth = calculateGrowth(
      parseInt(growth.current_owners),
      parseInt(growth.previous_owners)
    )
    const userGrowth = calculateGrowth(
      parseInt(growth.current_users),
      parseInt(growth.previous_users)
    )
    const retentionRate = retention ? 
      (parseInt(retention.returning_count) / Math.max(1, parseInt(retention.new_users))) * 100 : 0

    return NextResponse.json({
      overview: {
        totalUsers: parseInt(overview.total_users),
        totalOwners: parseInt(overview.total_owners),
        totalClubs: parseInt(overview.total_clubs),
        totalCourts: parseInt(overview.total_courts),
        totalBookings: parseInt(overview.total_bookings),
        confirmedBookings: parseInt(overview.confirmed_bookings),
        pendingBookings: parseInt(overview.pending_bookings),
        cancelledBookings: parseInt(overview.cancelled_bookings),
        totalRevenue: parseFloat(overview.total_revenue),
        totalCommission: parseFloat(overview.total_commission)
      },
      revenueData,
      growth: {
        owners: {
          current: parseInt(growth.current_owners),
          previous: parseInt(growth.previous_owners),
          percentage: ownerGrowth
        },
        users: {
          current: parseInt(growth.current_users),
          previous: parseInt(growth.previous_users),
          percentage: userGrowth
        },
        retention: {
          rate: retentionRate
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch admin dashboard data' }, { status: 500 })
  }
}