import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log('Login attempt with email:', email)

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized')
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Query admin_users table
    const { data: admins, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('email', email)

    console.log('DB Result:', { admins, dbError })

    if (dbError) {
      console.error('Database error:', dbError)
      return Response.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      )
    }

    if (!admins || admins.length === 0) {
      console.log('Admin user not found')
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const adminUser = admins[0]

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)

    if (!isValidPassword) {
      console.log('Password mismatch')
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create token
    const token = Buffer.from(
      JSON.stringify({
        adminId: adminUser.id,
        email: adminUser.email,
        iat: Date.now(),
      })
    ).toString('base64')

    console.log('Login successful!')

    return Response.json(
      {
        token,
        admin: {
          id: adminUser.id,
          email: adminUser.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin login error:', error)
    return Response.json(
      { error: 'Login failed: ' + error.message },
      { status: 500 }
    )
  }
}
