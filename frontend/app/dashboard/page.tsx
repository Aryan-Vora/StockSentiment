import { Suspense } from 'react';
import { Spinner } from '@/components/ui/kibo-ui/spinner';
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
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <Spinner variant="ring" />
    </div>
  );
}
