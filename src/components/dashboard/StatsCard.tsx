
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: "up" | "down";
  trendValue?: string;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
}: StatsCardProps) => {
  return (
    <div className={cn("rounded-xl bg-card p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {trend && trendValue && (
        <div className="mt-4 flex items-center text-xs">
          <span
            className={cn(
              "flex items-center font-medium",
              trend === "up" ? "text-green-500" : "text-red-500"
            )}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
          <span className="ml-1 text-muted-foreground">since last month</span>
        </div>
      )}
    </div>
  );
};
