import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'club_owner' | 'customer'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    role: (userProfile?.role as UserRole) || 'customer',
  }
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole = 'customer',
  companyName?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  if (data.user) {
    await supabase.from('user_profiles').insert({
      id: data.user.id,
      email,
      role,
      company_name: companyName,
    })
  }

  return data
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}
