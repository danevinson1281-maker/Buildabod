'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-gray-400 hover:text-yellow-500 text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFD700' }}>
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 md:p-12 space-y-8">
          
          {/* 1. Agreement to Terms */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using BuildABod.co ("the Service"), you agree to be bound by these Terms of Service and our Privacy Policy. 
              If you do not agree to abide by these terms, please do not use this service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              BuildABod.co reserves the right to modify these terms at any time. Changes will be posted on this page 
              with an updated "Last Updated" date. Your continued use of the service constitutes acceptance of new terms.
            </p>
          </section>

          {/* 2. What BuildABod.co Is & Is NOT */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              2. What BuildABod.co Is & Is Not
            </h2>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-4">
              <p className="text-blue-200 font-semibold mb-3">✓ BuildABod.co IS:</p>
              <ul className="text-gray-300 space-y-2 text-sm ml-4">
                <li>• A nutrition guidance and meal planning platform</li>
                <li>• Educational and informational in nature</li>
                <li>• A coaching support service for fitness-focused individuals</li>
              </ul>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <p className="text-red-200 font-semibold mb-3">✗ BuildABod.co IS NOT:</p>
              <ul className="text-gray-300 space-y-2 text-sm ml-4">
                <li>• A medical service, clinic, or healthcare provider</li>
                <li>• A substitute for professional medical advice</li>
                <li>• A substitute for a registered dietitian (RD) or nutritionist</li>
                <li>• A source of diagnosis, treatment, or medical prescriptions</li>
              </ul>
            </div>
          </section>

          {/* 3. Medical Disclaimer & Liability Waiver */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              3. Medical Disclaimer & Liability Waiver
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-4">
              <p className="text-red-200 font-semibold mb-3">⚠️ IMPORTANT LEGAL NOTICE:</p>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>
                  <strong>BuildABod.co meal plans are nutrition recommendations only.</strong> They are not medical advice, 
                  and should not be treated as such.
                </li>
                <li>
                  <strong>Dane Vinson is a certified personal trainer, NOT a licensed medical doctor, registered dietitian, 
                  or healthcare provider.</strong> No medical or dietary services are being provided.
                </li>
                <li>
                  <strong>YOU MUST CONSULT YOUR DOCTOR or healthcare provider</strong> before starting any new diet, 
                  nutrition plan, or fitness program—especially if you have:
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>• Existing medical conditions (diabetes, heart disease, thyroid issues, etc.)</li>
                    <li>• Take prescription medications that affect metabolism or nutrition</li>
                    <li>• History of eating disorders or disordered eating</li>
                    <li>• Are pregnant, nursing, or planning pregnancy</li>
                    <li>• Are under 18 years of age</li>
                    <li>• Have food allergies or intolerances</li>
                  </ul>
                </li>
                <li>
                  <strong>You assume all health risks.</strong> BuildABod.co is not responsible for any adverse health effects, 
                  allergic reactions, complications, or outcomes from using our meal plans or service. You assume complete responsibility 
                  for your health and dietary choices.
                </li>
              </ul>
            </div>
            <p className="text-gray-300 leading-relaxed">
              By using this service, you acknowledge and agree that:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mt-3">
              <li>• You have consulted a healthcare provider before using BuildABod.co</li>
              <li>• You understand the risks involved in dietary changes</li>
              <li>• You release BuildABod.co from all liability related to your health</li>
              <li>• You will immediately stop and seek medical attention if you experience any adverse health effects</li>
            </ul>
          </section>

          {/* 4. TDEE & Macro Calculations */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              4. TDEE & Macro Calculations
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              BuildABod.co calculates your Total Daily Energy Expenditure (TDEE) and macro targets using industry-standard 
              formulas based on your age, gender, height, weight, activity level, and fitness goals.
            </p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-4">
              <p className="text-gray-300 text-sm">
                <strong>These calculations are estimates only.</strong> Individual metabolism varies significantly. 
                Results depend on your adherence, consistency, genetics, stress levels, sleep quality, and overall lifestyle. 
                That's why having a coach to monitor progress and adjust your plan is critical for success.
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              We are not responsible if your actual results differ from calculated estimates. 
              Progress requires consistent effort over time.
            </p>
          </section>

          {/* 5. Food Database & Nutrition Info */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              5. Food Database & Nutrition Information
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Nutritional information in our food database is sourced from public USDA databases and manufacturer labels. 
              While we strive for accuracy, nutrition data may vary based on:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-3">
              <li>• Brand differences (USDA data may differ from specific brands)</li>
              <li>• Preparation methods and cooking times</li>
              <li>• Portion measurement accuracy (scales vs. cups)</li>
              <li>• Individual food variations (seasonal, organic vs. conventional)</li>
              <li>• Manufacturing variation in same food</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              <strong>We are not responsible for inaccuracies in nutrition databases or manufacturer data.</strong> 
              If you have concerns about specific foods or allergies, verify nutritional information with the manufacturer directly.
            </p>
          </section>

          {/* 6. Allergy & Dietary Restrictions */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              6. Allergies & Dietary Restrictions
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              During intake, you provide information about food allergies and dietary restrictions. 
              We use this information to avoid those foods in your meal plan.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 my-4">
              <p className="text-yellow-200 text-sm">
                <strong>⚠️ However:</strong> Our food database is not certified allergy-free. 
                Cross-contamination or labeling errors may occur. If you have severe allergies, 
                you are responsible for double-checking food labels and preparation methods. 
                BuildABod.co is not liable for allergic reactions.
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Always verify food labels and consult your doctor or allergist before consuming foods if you have severe allergies.
            </p>
          </section>

          {/* 7. Photo & Testimonial Rights */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              7. Photo Rights & Testimonials
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              By uploading progress photos or providing testimonials to BuildABod.co, you grant us the right to:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li>• Display your before/after photos on our website</li>
              <li>• Use your transformation results in marketing materials and social media</li>
              <li>• Share quotes from your feedback publicly</li>
              <li>• Identify you by first name and general location (city/state) only</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mb-3">
              <strong>You can opt out at any time.</strong> If you do not want your photos or testimonials used publicly, 
              contact us immediately at support@buildabod.co in writing and we will not publish future content. 
              Removal of already-published content may take time depending on platform distribution.
            </p>
            <p className="text-gray-300 leading-relaxed text-sm">
              <strong>Note:</strong> By uploading to our platform, you represent that you are the owner of the photos 
              and have the right to grant these permissions.
            </p>
          </section>

          {/* 8. User Responsibilities & Conduct */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              8. Your Responsibilities & Conduct
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              As a user of BuildABod.co, you agree to:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li>• Provide accurate information during intake (age, weight, activity level, medical history)</li>
              <li>• Consult a healthcare provider before starting any diet or fitness program</li>
              <li>• Follow meal plans responsibly and listen to your body</li>
              <li>• Stop immediately and seek medical attention if you experience adverse health effects</li>
              <li>• Not hold BuildABod.co liable for any health outcomes or lack of results</li>
              <li>• Maintain confidentiality of your account and login credentials</li>
              <li>• Not misrepresent the service or use it for illegal purposes</li>
              <li>• Not attempt to access other users' accounts or data</li>
            </ul>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              <strong>TO THE FULLEST EXTENT PERMITTED BY LAW:</strong> BuildABod.co, Dane Vinson, and all associated parties 
              are not liable for:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li>• Any health complications, adverse reactions, or negative outcomes from using meal plans</li>
              <li>• Failure to achieve fitness or weight loss goals (results vary by individual)</li>
              <li>• Allergic reactions to foods, despite listing allergies in intake</li>
              <li>• Loss of profits, data, business opportunities, or indirect/consequential damages</li>
              <li>• Service interruptions, technical issues, or downtime</li>
              <li>• Errors or delays in meal plan generation or delivery</li>
              <li>• Third-party service failures (Stripe, email delivery, etc.)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
        
            </p>
          </section>

          {/* 10. Refund Policy */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              10. Refund Policy
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              <strong>Kickstart Plans (One-time purchase):</strong> Refunds are not available after purchase. 
              If critical errors occur in your plan generation, contact support@buildabod.co and we will regenerate your plan at no charge.
            </p>
            <p className="text-gray-300 leading-relaxed mb-3">
              <strong>Subscription Plans (Pro/Elite):</strong> You may cancel your subscription at any time from your dashboard. 
              Cancellations take effect at the end of your current billing cycle. No refunds are issued for partial months 
              or unused days in your subscription.
            </p>
            <p className="text-gray-300 leading-relaxed">
              To discuss plan issues, contact support@buildabod.co with your order details. 
            </p>
          </section>

          {/* 11. Account & Subscription Terms */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              11. Account & Subscription Terms
            </h2>
            <ul className="text-gray-300 space-y-3 ml-4">
              <li>
                <strong>Age Requirement:</strong> You must be at least 18 years old to use this service.
              </li>
              <li>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your password 
                and account. You agree to notify us immediately of any unauthorized access.
              </li>
              <li>
                <strong>Subscription Renewal:</strong> Subscriptions renew automatically at the end of each billing period 
                unless canceled. You authorize BuildABod.co to charge your payment method on file.
              </li>
              <li>
                <strong>Price Changes:</strong> We may change subscription pricing with 30 days' notice. 
                Price changes take effect at your next renewal date.
              </li>
              <li>
                <strong>Account Termination:</strong> BuildABod.co reserves the right to terminate accounts 
                that violate these terms or engage in fraudulent activity.
              </li>
            </ul>
          </section>

          {/* 12. Privacy & Data */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              12. Privacy & Data Security
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We take your privacy seriously:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-3">
              <li>• Your personal and health data are encrypted and securely stored in Supabase</li>
              <li>• Payment information is processed securely via Stripe (we never store full payment details)</li>
              <li>• We do not sell your data to third parties</li>
              <li>• We use your data only to provide meal plans, coaching, and improve the service</li>
              <li>• You can request to view, update, or delete your data at any time</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              For full privacy details, see our <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* 13. Intellectual Property */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              13. Intellectual Property Rights
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              All content on BuildABod.co (including text, graphics, logos, images, meal plans, and software) 
              is the property of BuildABod or its content providers and is protected by copyright law.
            </p>
            <p className="text-gray-300 leading-relaxed">
              You may not reproduce, modify, distribute, or transmit any content without prior written permission from BuildABod.co. 
              Your meal plan is for personal use only and may not be shared, sold, or redistributed.
            </p>
          </section>

          {/* 14. Third-Party Services */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              14. Third-Party Services & Links
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              BuildABod.co uses third-party services including Stripe (payments), Supabase (database), and Resend (email). 
              Your use of these services is subject to their terms and privacy policies.
            </p>
            <p className="text-gray-300 leading-relaxed">
              BuildABod.co may contain links to external websites. We are not responsible for the content, accuracy, 
              or practices of third-party sites. Your use of third-party services is at your own risk.
            </p>
          </section>

          {/* 15. Governing Law & Disputes */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              15. Governing Law & Dispute Resolution
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              These Terms of Service are governed by the laws of the United States, without regard to conflict of law principles.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Any disputes arising from these terms or your use of BuildABod.co shall be resolved through binding arbitration 
              or small claims court, at your option. You agree not to pursue class action lawsuits against BuildABod.co.
            </p>
          </section>

          {/* 16. Contact */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              16. Questions or Concerns?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about these terms or need to discuss your use of BuildABod.co, contact us at:
            </p>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-300">
                <strong>Email:</strong> support@buildabod.co<br />
                <strong>Website:</strong> buildabod.co
              </p>
            </div>
          </section>

          {/* Footer Acknowledgment */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              By using BuildABod.co, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service, Medical Disclaimer, and Liability Waiver.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/">
            <button
              className="text-black font-bold py-3 px-8 rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: '#FFD700' }}
            >
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
