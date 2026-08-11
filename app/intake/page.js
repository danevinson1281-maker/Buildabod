import { Suspense } from 'react';
import IntakeContent from './IntakeContent';

export default function IntakePage() {
  return (
    <Suspense fallback={null}>
      <IntakeContent />
    </Suspense>
  );
}
