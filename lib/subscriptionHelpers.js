// lib/subscriptionHelpers.js

/**
 * Check if a Pro/Elite client can access their dashboard
 * Handles: active, past_due (with grace period), paused, canceled
 */
export const checkSubscriptionAccess = (client) => {
  if (!client) {
    return { canAccess: false, message: 'Client not found' };
  }

  const status = client.subscription_status || 'active';
  const planType = client.plan_type;

  // Only Pro/Elite have subscriptions
  if (planType === 'kickstart') {
    return checkKickstartAccess(client);
  }

  // ACTIVE = full access
  if (status === 'active') {
    return {
      canAccess: true,
      message: null,
      isPastDue: false,
      gracePeriodDays: null,
    };
  }

  // PAUSED = locked
  if (status === 'paused') {
    return {
      canAccess: false,
      message: `Your subscription is paused. Contact dane@buildabod.co to resume.`,
      isPastDue: false,
    };
  }

  // CANCELED = locked
  if (status === 'canceled') {
    return {
      canAccess: false,
      message: `Your subscription has been canceled. Upgrade to Pro or Elite to regain access.`,
      isPastDue: false,
    };
  }

  // PAST_DUE = check grace period (3 days)
  if (status === 'past_due') {
    const lastFailedAt = client.last_payment_failed_at
      ? new Date(client.last_payment_failed_at)
      : new Date();
    const now = new Date();
    const gracePeriodEnd = new Date(lastFailedAt);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

    const daysRemaining = Math.ceil(
      (gracePeriodEnd - now) / (1000 * 60 * 60 * 24)
    );

    // Still in grace period = access + warning
    if (now < gracePeriodEnd) {
      return {
        canAccess: true,
        message: `⚠️ Payment Failed — We'll retry for ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''}. Update your card now to avoid losing access.`,
        isPastDue: true,
        gracePeriodDays: daysRemaining,
      };
    }

    // Grace period expired = locked
    return {
      canAccess: false,
      message: `🔒 Your subscription is past due and the grace period has expired. Update your payment method to restore access.`,
      isPastDue: true,
      gracePeriodDays: 0,
    };
  }

  // Fallback
  return { canAccess: true, message: null, isPastDue: false };
};

/**
 * Check if a Kickstart client can access their dashboard
 * 30-day access window, then locked
 */
export const checkKickstartAccess = (client) => {
  if (!client) {
    return { canAccess: false, message: 'Client not found' };
  }

  // ✅ FIX: If no kickstart_purchased_at, allow access
  // This handles clients created before this field was added
  if (!client.kickstart_purchased_at) {
    return { canAccess: true, message: null };
  }

  const purchaseDate = new Date(client.kickstart_purchased_at);
  const now = new Date();
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + 30);

  // Within 30 days = access
  if (now < expiryDate) {
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 3) {
      return {
        canAccess: true,
        message: `⏰ Your Kickstart access expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.`,
        isExpiringSoon: true,
        daysRemaining,
        showUpgradeOptions: true,
      };
    }

    return {
      canAccess: true,
      message: null,
      isExpiringSoon: false,
      daysRemaining,
    };
  }

  // After 30 days = LOCKED
  const daysExpired = Math.ceil((now - expiryDate) / (1000 * 60 * 60 * 24));
  return {
    canAccess: false,
    message: `Your Kickstart access expired ${daysExpired} day${daysExpired !== 1 ? 's' : ''} ago. Upgrade to Pro ($97/mo) or extend Kickstart ($50).`,
    isExpired: true,
    canViewReadOnly: false,
  };
};


/**
 * Determine if client can access premium features (check-ins, photo uploads, etc.)
 */
export const canAccessPremiumFeatures = (client) => {
  if (!client) return false;

  const status = client.subscription_status || 'active';
  const planType = client.plan_type;

  // Kickstart never has premium features
  if (planType === 'kickstart') return false;

  // Only active Pro/Elite have premium access
  if (planType === 'pro' || planType === 'elite') {
    return status === 'active';
  }

  return false;
};

/**
 * Get plan label for display
 */
export const getPlanLabel = (planType) => {
  const labels = {
    kickstart: 'Kickstart',
    pro: 'Pro',
    elite: 'Elite',
  };
  return labels[planType] || planType;
};

/**
 * Calculate days until subscription expires (for Kickstart)
 */
export const getDaysUntilKickstartExpires = (client) => {
  if (!client?.kickstart_purchased_at) return null;

  const purchaseDate = new Date(client.kickstart_purchased_at);
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + 30);

  const now = new Date();
  const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  return Math.max(0, daysRemaining);
};
