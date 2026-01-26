import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await signIn(email, password)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signin failed' },
      { status: 401 }
    )
  }
}