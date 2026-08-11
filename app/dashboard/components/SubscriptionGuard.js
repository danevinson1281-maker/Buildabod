// app/dashboard/components/SubscriptionGuard.js

'use client';

import { checkSubscriptionAccess } from '@/lib/subscriptionHelpers';
import Link from 'next/link';

export default function SubscriptionGuard({ client, children }) {
  const { canAccess, message, isPastDue, isExpiringSoon, daysRemaining, showUpgradeOptions } =
    checkSubscriptionAccess(client);

  // ✅ ACCESS DENIED
  if (!canAccess) {
    const isKickstart = client?.plan_type === 'kickstart';

    return (
      <div
        style={{
          background: '#1a0a0a',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '40px auto',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
        <h2
          style={{
            color: '#ef4444',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 12px',
          }}
        >
          Access Suspended
        </h2>
        <p style={{ color: '#ccc', fontSize: '16px', margin: '0 0 24px', lineHeight: '1.6' }}>
          {message}
        </p>

        {/* KICKSTART EXPIRED — show both options */}
        {isKickstart && (
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <Link
              href={`/upgrade?clientId=${client.id}`}
              style={{
                display: 'block',
                padding: '14px 28px',
                background: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
              }}
            >
              🚀 Upgrade to Pro — $97/mo
            </Link>
            <Link
              href={`/payment?clientId=${client.id}&plan=kickstart&extend=true`}
              style={{
                display: 'block',
                padding: '14px 28px',
                background: 'transparent',
                color: '#FFD700',
                border: '1px solid #FFD700',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
              }}
            >
              🔄 Extend Kickstart — $50
            </Link>
            <a
              href="mailto:dane@buildabod.co"
              style={{
                display: 'block',
                padding: '12px 28px',
                background: 'transparent',
                color: '#888',
                border: '1px solid #333',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              ✉️ Contact Dane
            </a>
          </div>
        )}

        {/* PRO/ELITE PAST DUE — show payment update */}
        {!isKickstart && (
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <a
              href="https://billing.stripe.com/p/login/your-portal-link"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '14px 28px',
                background: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
              }}
            >
              💳 Update Payment Method
            </a>
            <a
              href="mailto:dane@buildabod.co"
              style={{
                display: 'block',
                padding: '12px 28px',
                background: 'transparent',
                color: '#FFD700',
                border: '1px solid #FFD700',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              ✉️ Contact Dane
            </a>
          </div>
        )}
      </div>
    );
  }

  // ✅ ACCESS ALLOWED — but show warning if needed
  return (
    <>
      {/* WARNING BANNER */}
      {message && (
        <div
          style={{
            background:
              isPastDue || isExpiringSoon
                ? 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.08) 100%)'
                : 'transparent',
            border: isPastDue || isExpiringSoon ? '1px solid #FFD700' : 'none',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: isPastDue || isExpiringSoon ? '#FFD700' : '#ccc',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>{message}</div>

          {/* URGENT ACTION BUTTONS */}
          {isExpiringSoon && showUpgradeOptions && (
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <Link
                href={`/upgrade?clientId=${client.id}`}
                style={{
                  padding: '6px 12px',
                  background: '#FFD700',
                  color: '#000',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                }}
              >
                Upgrade Now
              </Link>
              <Link
                href={`/payment?clientId=${client.id}&plan=kickstart&extend=true`}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  color: '#FFD700',
                  border: '1px solid #FFD700',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                }}
              >
                Extend $50
              </Link>
            </div>
          )}

          {isPastDue && (
            <a
              href="mailto:dane@buildabod.co"
              style={{
                padding: '6px 12px',
                background: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              Contact Dane
            </a>
          )}
        </div>
      )}

      {/* RENDER DASHBOARD */}
      {children}
    </>
  );
}
