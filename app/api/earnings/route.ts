import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const dateRange = searchParams.get('date_range') || 'month'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!ownerId) {
      return NextResponse.json({ error: 'owner_id is required' }, { status: 400 })
    }

    // Build date conditions
    let dateCondition = ''
    const params = [ownerId]
    
    if (startDate && endDate) {
      dateCondition = `AND b.booking_date >= $${params.length + 1} AND b.booking_date <= $${params.length + 2}`
      params.push(startDate, endDate)
    } else if (dateRange === 'month') {
      dateCondition = `AND b.booking_date >= date_trunc('month', CURRENT_DATE)`
    } else if (dateRange === 'year') {
      dateCondition = `AND b.booking_date >= date_trunc('year', CURRENT_DATE)`
    }
    // 'all' range doesn't add date condition

    // Main earnings query
    const earningsQuery = `
      SELECT 
        COUNT(*) as booking_count,
        COALESCE(SUM(CAST(b.total_price AS DECIMAL)), 0) as total_earnings,
        COALESCE(SUM(CAST(b.commission_amount AS DECIMAL)), 0) as total_commission,
        COALESCE(AVG(CAST(b.total_price AS DECIMAL)), 0) as average_earning,
        COALESCE(SUM(CAST(b.total_price AS DECIMAL)) - SUM(CAST(b.commission_amount AS DECIMAL)), 0) as net_earnings
      FROM bookings b
      LEFT JOIN courts c ON b.court_id = c.id
      LEFT JOIN clubs cl ON c.club_id = cl.id
      WHERE cl.owner_id = $1
        AND b.status = 'confirmed'
        ${dateCondition}
    `

    // Daily earnings for charts
    const dailyEarningsQuery = `
      SELECT 
        DATE(b.booking_date) as date,
        COUNT(*) as booking_count,
        COALESCE(SUM(CAST(b.total_price AS DECIMAL)), 0) as daily_earnings,
        COALESCE(SUM(CAST(b.commission_amount AS DECIMAL)), 0) as daily_commission
      FROM bookings b
      LEFT JOIN courts c ON b.court_id = c.id
      LEFT JOIN clubs cl ON c.club_id = cl.id
      WHERE cl.owner_id = $1
        AND b.status = 'confirmed'
        ${dateCondition}
      GROUP BY DATE(b.booking_date)
      ORDER BY date DESC
      LIMIT 30
    `

    // Monthly earnings for trend analysis
    const monthlyEarningsQuery = `
      SELECT 
        DATE_TRUNC('month', b.booking_date) as month,
        COUNT(*) as booking_count,
        COALESCE(SUM(CAST(b.total_price AS DECIMAL)), 0) as monthly_earnings,
        COALESCE(SUM(CAST(b.commission_amount AS DECIMAL)), 0) as monthly_commission
      FROM bookings b
      LEFT JOIN courts c ON b.court_id = c.id
      LEFT JOIN clubs cl ON c.club_id = cl.id
      WHERE cl.owner_id = $1
        AND b.status = 'confirmed'
        AND b.booking_date >= date_trunc('month', CURRENT_DATE - INTERVAL '11 months')
      GROUP BY DATE_TRUNC('month', b.booking_date)
      ORDER BY month DESC
      LIMIT 12
    `

    // Court performance breakdown
    const courtPerformanceQuery = `
      SELECT 
        c.id as court_id,
        c.name as court_name,
        COUNT(*) as booking_count,
        COALESCE(SUM(CAST(b.total_price AS DECIMAL)), 0) as total_earnings,
        COALESCE(AVG(CAST(b.total_price AS DECIMAL)), 0) as average_earning
      FROM bookings b
      LEFT JOIN courts c ON b.court_id = c.id
      LEFT JOIN clubs cl ON c.club_id = cl.id
      WHERE cl.owner_id = $1
        AND b.status = 'confirmed'
        ${dateCondition}
      GROUP BY c.id, c.name
      ORDER BY total_earnings DESC
    `

    // Execute all queries
    const [earningsResult, dailyResult, monthlyResult, courtResult] = await Promise.all([
      db.query(earningsQuery, params),
      db.query(dailyEarningsQuery, params),
      db.query(monthlyEarningsQuery, [ownerId]),
      db.query(courtPerformanceQuery, params)
    ])

    const earnings = earningsResult.rows[0]
    const dailyEarnings = dailyResult.rows.reverse() // Reverse for chronological order
    const monthlyEarnings = monthlyResult.rows.reverse()
    const courtPerformance = courtResult.rows

    // Format response
    const response = {
      summary: {
        bookingCount: parseInt(earnings.booking_count),
        totalEarnings: parseFloat(earnings.total_earnings).toFixed(2),
        totalCommission: parseFloat(earnings.total_commission).toFixed(2),
        netEarnings: parseFloat(earnings.net_earnings).toFixed(2),
        averageEarning: parseFloat(earnings.average_earning).toFixed(2)
      },
      dailyEarnings: dailyEarnings.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnings: parseFloat(day.daily_earnings),
        commission: parseFloat(day.daily_commission),
        bookingCount: parseInt(day.booking_count)
      })),
      monthlyEarnings: monthlyEarnings.map(month => ({
        month: new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        earnings: parseFloat(month.monthly_earnings),
        commission: parseFloat(month.monthly_commission),
        bookingCount: parseInt(month.booking_count)
      })),
      courtPerformance: courtPerformance.map(court => ({
        courtId: court.court_id,
        courtName: court.court_name,
        bookingCount: parseInt(court.booking_count),
        totalEarnings: parseFloat(court.total_earnings).toFixed(2),
        averageEarning: parseFloat(court.average_earning).toFixed(2)
      })),
      dateRange,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching earnings data:', error)
    return NextResponse.json({ error: 'Failed to fetch earnings data' }, { status: 500 })
  }
}