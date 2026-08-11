import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientData } = body;

    // ✅ FIX: planType and clientId come from clientData
    const planType = body.planType || clientData.planType || clientData.plan_type || 'unknown';
    const clientId = body.clientId || clientData.clientId || 'N/A';

    console.log('Sending admin notification for new client:', clientData.email);
    console.log('Plan type:', planType);

    // ── Format height from inches to feet'inches" ──────────────────────────
    const formatHeight = () => {
      const inches = clientData.height;
      if (!inches || inches === null || inches === undefined) return 'N/A';
      const numInches = Number(inches);
      if (isNaN(numInches)) return 'N/A';
      const feet = Math.floor(numInches / 12);
      const remainingInches = numInches % 12;
      return feet + "'" + remainingInches + '"';
    };

    // ── Format weight safely ──────────────────────────────────────────────
    const formatWeight = () => {
      const weight = clientData.currentWeight;
      if (!weight || weight === null || weight === undefined) return 'N/A';
      const numWeight = Number(weight);
      return isNaN(numWeight) ? 'N/A' : String(numWeight);
    };

    // ── Format goal weight safely ─────────────────────────────────────────
    const formatGoalWeight = () => {
      const weight = clientData.goalWeight;
      if (!weight || weight === null || weight === undefined) return 'N/A';
      const numWeight = Number(weight);
      return isNaN(numWeight) ? 'N/A' : String(numWeight);
    };

    // ── Format goal label ─────────────────────────────────────────────────
    const formatGoal = () => {
      const goals = {
        'fat-loss': 'Fat Loss',
        'muscle-gain': 'Muscle Gain',
        'build-muscle': 'Build Muscle',
        'body-recomp': 'Body Recomposition',
        'maintain': 'Maintain Weight',
      };
      return goals[clientData.primaryGoal] || clientData.primaryGoal || 'N/A';
    };

    // ── Format experience label ───────────────────────────────────────────
    const formatExperience = () => {
      const levels = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
      };
      return levels[clientData.experienceLevel] || clientData.experienceLevel || 'N/A';
    };

    // ── Format activity label ─────────────────────────────────────────────
    const formatActivity = () => {
      const levels = {
        'sedentary': 'Sedentary',
        'lightly-active': 'Lightly Active',
        'moderately-active': 'Moderately Active',
        'very-active': 'Very Active',
        'extremely-active': 'Extremely Active',
      };
      return levels[clientData.activityLevel] || clientData.activityLevel || 'N/A';
    };

    // ── Format gender ─────────────────────────────────────────────────────
    const formatGender = () => {
      if (!clientData.gender) return 'N/A';
      return clientData.gender.charAt(0).toUpperCase() + clientData.gender.slice(1);
    };

    // ── Format meal variety ───────────────────────────────────────────────
    const formatMealVariety = () => {
      const options = {
        'same': 'Same Every Day',
        'mix': 'Mix It Up',
      };
      return options[clientData.mealVariety] || clientData.mealVariety || 'Mix It Up';
    };

    // ── Format dietary type ───────────────────────────────────────────────
    const formatDiet = () => {
      const types = {
        'omnivore': 'Omnivore',
        'vegetarian': 'Vegetarian',
        'vegan': 'Vegan',
        'pescatarian': 'Pescatarian',
        'keto': 'Keto',
        'paleo': 'Paleo',
      };
      return types[clientData.dietaryType] || clientData.dietaryType || 'Omnivore';
    };

    // ── Format allergies ──────────────────────────────────────────────────
    const formatAllergies = () => {
      if (!clientData.allergies) return 'None';
      if (Array.isArray(clientData.allergies)) {
        return clientData.allergies.length > 0 ? clientData.allergies.join(', ') : 'None';
      }
      return 'None';
    };

    // ── Format cooking methods ────────────────────────────────────────────
    const formatCooking = () => {
      if (!clientData.cookingMethods) return 'N/A';
      if (Array.isArray(clientData.cookingMethods)) {
        return clientData.cookingMethods.length > 0 ? clientData.cookingMethods.join(', ') : 'N/A';
      }
      return 'N/A';
    };

    // Store formatted values
    const heightDisplay = formatHeight();
    const weightDisplay = formatWeight();
    const goalWeightDisplay = formatGoalWeight();
    const goalDisplay = formatGoal();
    const experienceDisplay = formatExperience();
    const activityDisplay = formatActivity();
    const genderDisplay = formatGender();
    const varietyDisplay = formatMealVariety();
    const dietDisplay = formatDiet();
    const allergiesDisplay = formatAllergies();
    const cookingDisplay = formatCooking();
    const mealCountDisplay = clientData.mealsPerDay || 'N/A';
    const ageDisplay = clientData.age || 'N/A';
    const nameDisplay = clientData.fullName || 'N/A';
    const emailDisplay = clientData.email || 'N/A';

    console.log('🔍 ADMIN EMAIL VALUES:', {
      heightDisplay, weightDisplay, goalWeightDisplay, goalDisplay,
      experienceDisplay, activityDisplay, genderDisplay, varietyDisplay,
      dietDisplay, allergiesDisplay, cookingDisplay
    });

    const response = await resend.emails.send({
      from: 'BuildABod <noreply@buildabod.co>',
      to: 'buildabod.co@gmail.com',
      subject: '🎉 New Client Signup - ' + nameDisplay,
      html:
        '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;max-width:700px;margin:0 auto;background:#1a1a1a;padding:40px 20px;color:white;">' +
        '<h1 style="color:#FFD700;margin-top:0;text-align:center;">🎉 New Client Signup!</h1>' +

        '<div style="background:#222;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #FFD700;">' +
        '<h2 style="color:#FFD700;margin-top:0;">Client Information</h2>' +
        '<table style="width:100%;border-collapse:collapse;color:#ccc;">' +
        '<tr><td style="padding:12px;border-bottom:1px solid #333;"><strong style="color:white;">Name:</strong></td>' +
        '<td style="padding:12px;border-bottom:1px solid #333;">' + nameDisplay + '</td></tr>' +
        '<tr><td style="padding:12px;border-bottom:1px solid #333;"><strong style="color:white;">Email:</strong></td>' +
        '<td style="padding:12px;border-bottom:1px solid #333;">' + emailDisplay + '</td></tr>' +
        '<tr><td style="padding:12px;border-bottom:1px solid #333;"><strong style="color:white;">Plan:</strong></td>' +
        '<td style="padding:12px;border-bottom:1px solid #333;"><strong style="color:#FFD700;">' + planType.toUpperCase() + '</strong></td></tr>' +
        '<tr><td style="padding:12px;"><strong style="color:white;">Client ID:</strong></td>' +
        '<td style="padding:12px;font-family:monospace;font-size:12px;">' + clientId + '</td></tr>' +
        '</table>' +
        '</div>' +

        '<div style="background:#222;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #FFD700;">' +
        '<h2 style="color:#FFD700;margin-top:0;">Intake Summary</h2>' +
        '<table style="width:100%;border-collapse:collapse;color:#ccc;font-size:14px;">' +
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #333;width:50%;"><strong style="color:white;">Age:</strong> ' + ageDisplay + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Gender:</strong> ' + genderDisplay + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Height:</strong> ' + heightDisplay + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Current Weight:</strong> ' + weightDisplay + ' lbs</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Goal Weight:</strong> ' + goalWeightDisplay + ' lbs</td>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Goal:</strong> ' + goalDisplay + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Experience:</strong> ' + experienceDisplay + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Activity Level:</strong> ' + activityDisplay + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Dietary:</strong> ' + dietDisplay + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Allergies:</strong> ' + allergiesDisplay + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Cooking:</strong> ' + cookingDisplay + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #333;"><strong style="color:white;">Meals/Day:</strong> ' + mealCountDisplay + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="2" style="padding:10px;"><strong style="color:white;">Meal Variety:</strong> ' + varietyDisplay + '</td>' +
        '</tr>' +
        '</table>' +
        '</div>' +

        '<div style="background:#111;padding:20px;border-radius:8px;margin:20px 0;">' +
        '<h2 style="color:#FFD700;margin-top:0;">⚡ Action Required</h2>' +
        '<ol style="color:#ccc;padding-left:20px;margin:10px 0;">' +
        '<li>Check intake details in admin dashboard</li>' +
        '<li>Review macros & adjust if needed</li>' +
        '<li>Generate & approve meal plan</li>' +
        '<li>Client gets magic link to view plan</li>' +
        '</ol>' +
        '</div>' +

        '<div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #333;color:#666;font-size:12px;">' +
        '<p>BuildABod Admin Notification</p>' +
        '</div>' +
        '</div>',
    });

    console.log('Admin notification sent:', response.data?.id);

    return NextResponse.json({ success: true, message: 'Admin notified' });

  } catch (error) {
    console.error('Admin notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
