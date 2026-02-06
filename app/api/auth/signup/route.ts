import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    console.log('[v0] Signup API called')
    const { email, password, full_name, company_name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('[v0] Creating admin client...')
    const supabase = await createAdminClient()
    console.log('[v0] Admin client created')

    // Create user with auto-confirmed email to avoid rate limit
    console.log('[v0] Creating user:', email)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        company_name,
      },
    })

    if (error) {
      console.error('[v0] Auth error:', error)
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in or use a different email address.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('[v0] User created:', data.user.id)

    // Create or update profile (upsert to avoid duplicate key errors)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name,
        company_name,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('[v0] Profile error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    console.log('[v0] Signup successful')
    return NextResponse.json({ success: true, user: data.user })
  } catch (error) {
    console.error('[v0] Signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}
