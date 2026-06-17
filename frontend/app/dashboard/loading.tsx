import { Spinner } from '@/components/ui/kibo-ui/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <Spinner variant="ring" />
    </div>
  );
}
