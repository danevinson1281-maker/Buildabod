import { Suspense } from 'react';
import PaymentContent from './PaymentContent';

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentContent />
    </Suspense>
  );
}
