import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

function hashPassword(password) {
  return Buffer.from(password).toString('base64')
}

export async function createAdminUser(email, password) {
  const hashedPassword = hashPassword(password)
  
  const { data, error } = await supabase
    .from('admin_users')
    .insert([{ email, password_hash: hashedPassword }])
    .select()

  return { data, error }
}

export async function verifyAdminCredentials(email, password) {
  const hashedPassword = hashPassword(password)

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('password_hash', hashedPassword)
    .single()

  if (error || !data) {
    return { valid: false, user: null }
  }

  return { valid: true, user: data }
}

export async function getAdminUserByEmail(email) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return data
}
