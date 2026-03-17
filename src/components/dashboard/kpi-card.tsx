import React from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  className?: string;
}

const colorMap = {
  default: { icon: "bg-gray-100 text-gray-600", border: "" },
  success: { icon: "bg-emerald-100 text-emerald-600", border: "border-emerald-200" },
  warning: { icon: "bg-amber-100 text-amber-600", border: "border-amber-200" },
  danger: { icon: "bg-red-100 text-red-600", border: "border-red-200" },
  info: { icon: "bg-blue-100 text-blue-600", border: "border-blue-200" },
  purple: { icon: "bg-purple-100 text-purple-600", border: "border-purple-200" },
};

export function KpiCard({ title, value, description, icon: Icon, trend, color = "default", className }: KpiCardProps) {
  const colors = colorMap[color];

  return (
    <Card className={cn("card-hover", colors.border, className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {typeof value === "number" ? formatNumber(value) : value}
            </p>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className={cn("mt-1 text-xs font-medium", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}
