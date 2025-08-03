interface EditableMetricsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  onEdit: () => void;
  isAlert?: boolean;
}

export const EditableMetricsCard = ({ title, value, icon, onEdit, isAlert }: EditableMetricsCardProps) => {
  const valueClass = isAlert ? "text-destructive" : "text-foreground";
  const iconClass = isAlert ? "text-destructive" : "text-primary";
  
  return (
    <div 
      onClick={onEdit}
      className="rounded-lg border bg-card p-6 shadow-modern glass transition-all hover:shadow-modern-lg cursor-pointer hover:bg-accent/5"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        </div>
        <div className={iconClass}>
          {icon}
        </div>
      </div>
    </div>
  );
};