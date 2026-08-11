import { Suspense } from 'react';
import PricingContent from './PricingContent';

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  );
}
