interface MetricsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  isProfit?: boolean;
  isLoss?: boolean;
}

export const MetricsCard = ({ title, value, description, icon, isProfit, isLoss }: MetricsCardProps) => {
  const cardClass = isProfit ? "bg-profit" : isLoss ? "bg-loss" : "";
  const valueClass = isProfit ? "text-profit" : isLoss ? "text-loss" : "text-foreground";
  
  return (
    <div className={`rounded-lg border bg-card p-6 shadow-modern glass transition-all hover:shadow-modern-lg ${cardClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={isProfit ? "text-profit" : isLoss ? "text-loss" : "text-primary"}>
          {icon}
        </div>
      </div>
    </div>
  );
};