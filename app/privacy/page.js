'use client'

import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-gray-400 hover:text-yellow-500 text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFD700' }}>
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 md:p-12 space-y-8">

          {/* 1. Introduction */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed">
              BuildABod.co ("we," "us," "our," or "Company") operates the BuildABod website and application (the "Service"). 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              We take your privacy seriously. Please read this Privacy Policy carefully. 
              If you do not agree with our policies and practices, please do not use our Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              <strong>Your continued use of BuildABod.co indicates your acceptance of this Privacy Policy.</strong>
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-lg font-semibold text-gray-100 mt-4 mb-3">
              2.1 Information You Provide Directly
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              We collect information you voluntarily provide when using BuildABod.co:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Account Registration:</strong> Full name, email address, phone number</li>
              <li><strong>Health & Fitness Data:</strong> Age, gender, height, weight, goal weight, primary fitness goal, activity level</li>
              <li><strong>Dietary Information:</strong> Food preferences, dietary restrictions, allergies, meal frequency preferences, meal pattern selection</li>
              <li><strong>Progress Data:</strong> Weight measurements, progress photos, check-in responses, coaching feedback</li>
              <li><strong>Payment Information:</strong> Billing address, payment method (processed securely by Stripe—we don't store full card details)</li>
              <li><strong>Communication:</strong> Messages, feedback, coaching notes, support inquiries via email or dashboard</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              2.2 Automatically Collected Information
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              When you use BuildABod.co, we automatically collect certain information:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Device Information:</strong> Browser type, device type, operating system, device ID, IP address</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, links clicked, features used, interactions with the platform</li>
              <li><strong>Cookies & Tracking:</strong> We use cookies and similar technologies to track activity, remember preferences, and analyze usage patterns</li>
              <li><strong>Log Data:</strong> Server logs containing access times, pages viewed, referral sources, and error information</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              2.3 Information from Third Parties
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We may receive information about you from third-party services (e.g., Stripe for payment verification, 
              Resend for email delivery) to verify your identity, prevent fraud, and improve our service.
            </p>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li><strong>Service Delivery:</strong> Create, manage, and maintain your account</li>
              <li><strong>Meal Planning:</strong> Build personalized meal plans based on your goals, preferences, dietary restrictions, and meal pattern</li>
              <li><strong>Nutrition Guidance:</strong> Calculate macro targets and provide nutrition guidance tailored to your goals</li>
              <li><strong>Progress Tracking:</strong> Track your weight, progress photos, and performance to monitor results</li>
              <li><strong>Coaching Services:</strong> Provide coaching feedback, check-in responses, and plan adjustments (Pro/Elite plans)</li>
              <li><strong>Payment Processing:</strong> Process payments, manage subscriptions, and handle billing</li>
              <li><strong>Communications:</strong> Send transactional emails (confirmations, receipts, plan delivery, updates, password resets)</li>
              <li><strong>Marketing (Optional):</strong> Send marketing emails and updates (only with your consent)</li>
              <li><strong>Customer Support:</strong> Respond to your inquiries and provide customer support</li>
              <li><strong>Service Improvement:</strong> Analyze usage patterns to improve our Service, optimize features, and personalize your experience</li>
              <li><strong>Security & Compliance:</strong> Prevent fraud, detect security breaches, enforce our Terms of Service, and comply with legal obligations</li>
              <li><strong>Analytics:</strong> Aggregate and analyze data to understand user behavior and improve our product</li>
            </ul>
          </section>

          {/* 4. How We Share Your Information */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              4. How We Share Your Information
            </h2>

            <h3 className="text-lg font-semibold text-gray-100 mt-4 mb-3">
              4.1 Service Providers
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              We share information with trusted third parties who assist us in operating our Service:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-3">
              <li><strong>Stripe:</strong> Payment processing, subscription management, and fraud detection (PCI-DSS compliant)</li>
              <li><strong>Supabase:</strong> Database hosting, data storage, and backend infrastructure</li>
              <li><strong>Resend:</strong> Email delivery and transactional communications</li>
              <li><strong>Vercel:</strong> Website hosting and deployment</li>
            </ul>
            <p className="text-gray-300 leading-relaxed text-sm">
              These providers are contractually bound to protect your data, use it only for the purposes we specify, 
              and comply with data protection regulations.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              4.2 Photos & Testimonials
            </h3>
            <p className="text-gray-300 leading-relaxed">
              If you consent, we may share your before/after photos, transformation results, and testimonials on our website, 
              social media, and marketing materials. You can opt out at any time by contacting support@buildabod.co.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              4.3 Legal Requirements
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We may disclose your information if required by law, court order, government request, or if we believe in good faith 
              that disclosure is necessary to protect our rights, your safety, or the public interest.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              4.4 Business Transfers
            </h3>
            <p className="text-gray-300 leading-relaxed">
              If BuildABod.co is involved in a merger, acquisition, bankruptcy, or asset sale, your information may be transferred 
              as part of that transaction. We will notify you of any such change and your options regarding your data.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              4.5 Aggregated & De-Identified Data
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We may share aggregated, de-identified data (data that cannot identify you) for research, analytics, marketing, 
              and other purposes without restriction.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              4.6 With Your Consent
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We will not share your personal information with third parties for purposes other than those listed above 
              without your explicit consent.
            </p>
          </section>

          {/* 5. Data Security */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We implement industry-standard technical, administrative, and physical safeguards to protect your personal information:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li>• Encryption of data in transit using SSL/TLS protocols</li>
              <li>• Secure storage in Supabase with encrypted database</li>
              <li>• Payment information processed by PCI-DSS compliant Stripe (we never store full card details)</li>
              <li>• Limited access to data (only staff with legitimate need-to-know basis)</li>
              <li>• Regular security monitoring and updates</li>
              <li>• Password hashing and secure authentication</li>
            </ul>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-200 text-sm">
                <strong>⚠️ Important:</strong> No method of transmission over the internet is 100% secure. 
                While we employ industry-standard security measures, we cannot guarantee absolute security. 
                
              </p>
            </div>
          </section>

          {/* 6. Your Privacy Rights */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              6. Your Privacy Rights
            </h2>

            <h3 className="text-lg font-semibold text-gray-100 mt-4 mb-3">
              6.1 Access & Portability
            </h3>
            <p className="text-gray-300 leading-relaxed">
              You have the right to access your personal information and receive a copy of the data we hold about you. 
              Contact us at support@buildabod.co to submit a data access request.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              6.2 Correction & Update
            </h3>
            <p className="text-gray-300 leading-relaxed">
              You can update, correct, or modify your account information at any time by logging into your account or 
              contacting support@buildabod.co directly.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              6.3 Deletion
            </h3>
            <p className="text-gray-300 leading-relaxed">
              You have the right to request deletion of your personal information. We will delete your account and associated data 
              upon request, except where we are required to retain it by law or for legitimate business purposes (e.g., fraud prevention, 
              accounting records).
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              6.4 Marketing & Communications
            </h3>
            <p className="text-gray-300 leading-relaxed">
              You can opt out of marketing emails by clicking the "Unsubscribe" link in any email we send or by contacting us directly. 
              <strong> Note:</strong> Transactional emails (receipts, confirmations, important updates) will continue regardless 
              of your marketing preferences.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              6.5 Do Not Track (DNT)
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Some browsers include a "Do Not Track" feature. We do not currently respond to DNT signals, 
              but you can control cookies through your browser settings.
            </p>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              6.6 CCPA Rights (California Residents)
            </h3>
            <p className="text-gray-300 leading-relaxed mb-2">
              If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• Right to know what personal information is collected and how it's used</li>
              <li>• Right to delete personal information (with certain exceptions)</li>
              <li>• Right to opt-out of the sale of personal information</li>
              <li>• Right to non-discrimination for exercising your CCPA rights</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              6.7 GDPR Rights (European Residents)
            </h3>
            <p className="text-gray-300 leading-relaxed mb-2">
              If you are a European resident, you have rights under the General Data Protection Regulation (GDPR), including:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• Right to access your data</li>
              <li>• Right to rectification (correction) of inaccurate data</li>
              <li>• Right to erasure (deletion) of your data</li>
              <li>• Right to restrict processing of your data</li>
              <li>• Right to data portability (receive your data in a structured format)</li>
              <li>• Right to object to processing of your data</li>
              <li>• Right to withdraw consent at any time</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-3">
              6.8 Exercising Your Rights
            </h3>
            <p className="text-gray-300 leading-relaxed">
              To exercise any of these rights, contact us at support@buildabod.co with your request and identifying information. 
              We will respond within 30 days (or as required by applicable law).
            </p>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              7. How Long We Retain Your Data
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined 
              in this Privacy Policy. Retention periods vary by data type:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Account Information:</strong> Retained while your account is active; deleted upon account deletion</li>
              <li><strong>Payment Records:</strong> Retained for 7 years (required for tax and accounting purposes)</li>
              <li><strong>Health & Fitness Data:</strong> Retained while your account is active; deleted upon account deletion</li>
              <li><strong>Progress Photos:</strong> Retained while your account is active; deleted upon request or account deletion</li>
              <li><strong>Cookies:</strong> Typically retained for up to 1 year; can be deleted through browser settings</li>
              <li><strong>Log Data:</strong> Typically retained for 90 days for security and troubleshooting purposes</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              In some cases, we may retain data longer if required by law or for legitimate business purposes 
              (e.g., fraud prevention, legal claims, dispute resolution).
            </p>
          </section>

          {/* 8. Cookies & Tracking */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              8. Cookies & Tracking Technologies
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Session Cookies:</strong> Maintain your login and preferences during your session</li>
              <li><strong>Persistent Cookies:</strong> Remember your preferences across visits</li>
              <li><strong>Analytics:</strong> Track usage patterns to improve our Service</li>
              <li><strong>Third-Party Cookies:</strong> Used by third-party services for payments, analytics, and email</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mb-3">
              <strong>You can control cookies through your browser settings.</strong> Most browsers allow you to:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-3">
              <li>• View cookies stored on your device</li>
              <li>• Accept or reject cookies</li>
              <li>• Delete cookies at any time</li>
            </ul>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-200 text-sm">
                <strong>Note:</strong> Disabling cookies may affect the functionality of BuildABod.co. 
                Some features (login, meal plan generation, progress tracking) may not work properly without cookies.
              </p>
            </div>
          </section>

          {/* 9. Third-Party Links & Services */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              9. Third-Party Links & Services
            </h2>
            <p className="text-gray-300 leading-relaxed">
              BuildABod.co may contain links to third-party websites and services that are not operated by BuildABod. 
              This Privacy Policy does not apply to third-party services, and we are not responsible for their privacy practices, 
              content, or security measures. Please review their privacy policies before providing your information.
            </p>
          </section>

          {/* 10. Children's Privacy */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              10. Children's Privacy
            </h2>
            <p className="text-gray-300 leading-relaxed">
              BuildABod.co is not intended for individuals under 18 years of age. We do not knowingly collect personal information 
              from children under 18. If we learn that we've collected information from a child under 18, we will delete it immediately 
              and contact the parent/guardian if possible. Parents or guardians who believe their child has provided information to 
              BuildABod.co should contact us immediately at support@buildabod.co.
            </p>
          </section>

          {/* 11. International Data Transfers */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              11. International Data Transfers
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Your information may be transferred to, stored in, and processed in countries other than your country of residence. 
              These countries may have data protection laws that differ from your country. By using BuildABod.co, you consent to 
              the transfer of your information to countries outside your country of residence.
            </p>
            <p className="text-gray-300 leading-relaxed">
              For European residents, we implement appropriate safeguards (such as Standard Contractual Clauses) to ensure 
              your data is protected in accordance with GDPR.
            </p>
          </section>

          {/* 12. Your California Privacy Rights Summary */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              12. California Privacy Rights Summary (CCPA)
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              If you are a California resident, you have the right to:
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mb-4">
              <li><strong>Know:</strong> What categories of personal information we collect and how we use it</li>
              <li><strong>Delete:</strong> Your personal information (with limited exceptions)</li>
              <li><strong>Opt-Out:</strong> Of the sale or sharing of your personal information for cross-context behavioral advertising</li>
              <li><strong>Correction:</strong> Inaccurate personal information</li>
              <li><strong>Non-Discrimination:</strong> BuildABod.co will not discriminate against you for exercising your CCPA rights</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              To submit a CCPA request, email support@buildabod.co with "CCPA Request" in the subject line and include 
              proof of residency. We will respond within 60 days.
            </p>
          </section>

          {/* 13. Changes to This Privacy Policy */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              13. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of material changes via email or by posting the updated policy on 
              our website with an updated "Last Updated" date.
            </p>
            <p className="text-gray-300 leading-relaxed">
              <strong>Your continued use of BuildABod.co following any changes constitutes your acceptance of the updated Privacy Policy.</strong>
            </p>
          </section>

          {/* 14. Contact Us */}
          <section>
            <h2 style={{ color: '#FFD700' }} className="text-2xl font-bold mb-4">
              14. Questions or Concerns?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about this Privacy Policy, wish to exercise your rights, or have concerns about how we handle 
              your information, please contact us:
            </p>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-4">
              <p className="text-gray-300 mb-2">
                <strong>Email:</strong> support@buildabod.co
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Website:</strong> buildabod.co
              </p>
              <p className="text-gray-300">
                <strong>Response Time:</strong> We will respond to all inquiries and data requests within 30 days (or as required by applicable law)
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              For GDPR-related inquiries, you also have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          {/* Footer Acknowledgment */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              This Privacy Policy was last updated in January 2026. Your continued use of BuildABod.co 
              indicates your acceptance of this Privacy Policy.
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
