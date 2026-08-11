import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  const { clientId } = await params;

  if (!clientId) {
    return Response.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    console.log('Fetching macros for client:', clientId);

    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Meal plan fetch error:', error);
      throw error;
    }

    if (!mealPlan) {
      console.log('No meal plan found for client');
      return Response.json({ 
        macros: null,
        message: 'No meal plan found'
      });
    }

    console.log('Meal plan found:', {
      status: mealPlan.status,
      calories: mealPlan.target_calories,
      protein: mealPlan.target_protein_g,
      carbs: mealPlan.target_carbs_g,
      fats: mealPlan.target_fats_g
    });

    const macros = {
      daily_calories: parseInt(mealPlan.target_calories) || 0,
      daily_protein_g: parseInt(mealPlan.target_protein_g) || 0,
      daily_carbs_g: parseInt(mealPlan.target_carbs_g) || 0,
      daily_fats_g: parseInt(mealPlan.target_fats_g) || 0,
    };

    console.log('Returning macros:', macros);
    return Response.json({ macros });
  } catch (error) {
    console.error('Error fetching macros:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { clientId } = await params;

  if (!clientId) {
    return Response.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    const macroData = await request.json();

    const { data: mealPlan, error: fetchError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!mealPlan) {
      return Response.json({ error: 'No meal plan found' }, { status: 404 });
    }

    // ✅ FIX: Use target_* columns consistently
    const { error: updateError } = await supabase

    if (updateError) throw updateError;

    console.log('Macros updated in meal_plans');

    const { error: historyError } = await supabase
      .from('meal_plan_history')
      .insert([
        {
          client_id: clientId,
          meal_plan_id: mealPlan.id,
          meals: mealPlan.meals_data,
          substitutions: mealPlan.substitutions,
          daily_calories: macroData.daily_calories,
          daily_protein: macroData.daily_protein_g,
          daily_carbs: macroData.daily_carbs_g,
          daily_fats: macroData.daily_fats_g,
          action_type: 'macro_edit',
          admin_notes: 'Macros updated by admin',
          status: 'active',
        },
      ]);

    if (historyError) console.log('History error (non-fatal):', historyError);

    const { error: clientError } = await supabase
      .from('clients')
      .update({
        last_plan_updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (clientError) console.log('Client update error (non-fatal):', clientError);

    return Response.json({ 
      success: true,
      message: 'Macros updated successfully'
    });
  } catch (error) {
    console.error('Error updating macros:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
