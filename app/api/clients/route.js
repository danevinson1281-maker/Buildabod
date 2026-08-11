import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()

    const { email, full_name, phone, age, gender, goal, experience_level, dietary_restrictions, favorite_foods, plan_type } = body

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert([
        {
          email,
          full_name,
          phone,
          age,
          gender,
          goal,
          experience_level,
          dietary_restrictions,
          favorite_foods: JSON.stringify(favorite_foods),
          plan_type,
          tier: null,
          payments_made: 0,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, client: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    let query = supabaseAdmin.from('clients').select('*')
    if (email) query = query.eq('email', email)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, clients: data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
