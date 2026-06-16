import { Suspense } from 'react';
import { DashboardClient } from './dashboard-client';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClient />
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f2] text-zinc-700">
      Loading the experiment...
    </div>
  );
}
