import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// This is the definitive, simplified server-side handler for the OAuth callback.
// Its only job is to exchange the code for a session and set the cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding' // Default to onboarding for new users

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session) {
      // Check if this is a new user (just signed up) or existing user
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', data.session.user.id)
        .single()

      let redirectPath = next;
      
      // If user exists and has completed onboarding, redirect to dashboard
      if (!profileError && profile?.onboarding_completed) {
        redirectPath = '/dashboard'
      } else {
        // New user or onboarding not completed, redirect to onboarding
        redirectPath = '/onboarding'
      }

      console.log(`Auth callback: Redirecting user to ${redirectPath}`)
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // If there's an error or no code, redirect to an error page.
  console.error('Server Callback: Invalid auth code or session exchange failed.');
  const errorUrl = new URL('/auth/login', origin);
  errorUrl.searchParams.set('error', 'Login failed. Please try again.');
  return NextResponse.redirect(errorUrl);
} 