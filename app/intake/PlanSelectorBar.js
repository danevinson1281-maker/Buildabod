'use client';

import { useState, useEffect } from 'react';

const PlanSelectorBar = ({ selectedPlan, onPlanChange }) => {
  const plans = [
    {
      name: 'Kickstart',
      id: 'kickstart',
      price: 67, // ✅ UPDATED from 50
      priceId: 'price_1U37oFQVIGuBoBPoMbkMbBPM',
      billing: 'one-time',
      description: '7-day trial, then one-time payment',
      popular: false,
    },
    {
      name: 'Pro',
      id: 'pro',
      price: 127, // ✅ UPDATED from 97
      priceId: 'price_1U37ofQVIGuBoBPoEJYglWcE',
      billing: '/month',
      description: 'Monthly coaching + unlimited tools',
      popular: true,
    },
    {
      name: 'Elite',
      id: 'elite',
      price: 197, // ✅ UPDATED from 167
      priceId: 'price_1U37ovQVIGuBoBPoKxx3Khud',
      billing: '/month',
      description: 'Weekly coaching + priority access',
      popular: false,
    },
  ];

  const [selectedPlanLocal, setSelectedPlanLocal] = useState('kickstart');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedPlanType') : null;
    if (stored) {
      const planId = stored === 'kickstart' ? 'kickstart' : stored;
      setSelectedPlanLocal(planId);
    }
  }, []);

  const handlePlanChange = (planId) => {
    setSelectedPlanLocal(planId);
    localStorage.setItem('selectedPlanType', planId);
    if (onPlanChange) onPlanChange(planId);
    window.dispatchEvent(new Event('planChanged'));
  };

  if (!mounted) return null;

  return (
    <div className="sticky top-0 z-40 bg-black border-b border-yellow-700/30 px-4 py-4 mb-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-gray-400 text-sm mb-3 font-semibold uppercase tracking-wider">
          Select Your Plan
        </p>
        
        <div className="flex gap-3 flex-wrap">
          {plans.map(plan => {
            const isSelected = selectedPlanLocal === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => handlePlanChange(plan.id)}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isSelected
                    ? 'bg-yellow-500 text-black border-2 border-yellow-400 shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-900/50 text-gray-300 border-2 border-gray-700/50 hover:border-yellow-500/50 hover:bg-gray-800/50'
                }`}
              >
                <span className="block font-bold">{plan.name}</span>
                <span className="text-xs opacity-75">
                  ${plan.price} {plan.billing}
                </span>
              </button>
            );
          })}
        </div>
        
        <p className="text-gray-500 text-xs mt-2">
          💡 You can change your plan anytime during signup
        </p>
      </div>
    </div>
  );
};

export default PlanSelectorBar;
