interface CreditMeterProps {
  credits: number | null;
}

export function CreditMeter({ credits }: CreditMeterProps) {
  if (credits === null) {
    return (
      <div className="animate-pulse bg-card rounded-full h-6 w-24" />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-accent">{credits}</span>
      <span className="text-sm text-textSecondary">credits</span>
    </div>
  );
} 