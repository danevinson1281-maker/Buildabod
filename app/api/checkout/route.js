import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
  basic: 'price_1TTt1rHuCdpMAfMS5cjWPtuz',
  pro: 'price_1TTt2qHuCdpMAfMS7YrWnyWJ',
  elite: 'price_1TTt3FHuCdpMAfMSfEbbqZQz',
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { plan, intakeData } = body

    const priceId = PRICE_IDS[plan]

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 })
    }

    const isSubscription = plan === 'pro' || plan === 'elite'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        fullName: intakeData.fullName,
        email: intakeData.email,
        age: intakeData.age,
        gender: intakeData.gender,
        height: intakeData.height,
        currentWeight: intakeData.currentWeight,
        goalWeight: intakeData.goalWeight,
        primaryGoal: intakeData.primaryGoal,
        activityLevel: intakeData.activityLevel,
        workoutFrequency: intakeData.workoutFrequency,
        cardioDuration: intakeData.cardioDuration,
        mealsPerDay: intakeData.mealsPerDay,
        diabetic: intakeData.diabetic,
        allergies: intakeData.allergies || 'None',
        otherNotes: intakeData.otherNotes || 'None',
        selectedFoods: intakeData.selectedFoods.join(', '),
      },
      customer_email: intakeData.email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/intake?plan=${plan}`,
    })

    return new Response(JSON.stringify({ url: session.url }), { status: 200 })
  } catch (error) {
    console.error('Stripe error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
