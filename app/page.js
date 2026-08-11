import { Suspense } from 'react';
import HomeContent from './HomeContent';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}
