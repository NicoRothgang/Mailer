"use client";

import React from "react";
import { cn, getScoreColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthScoreProps {
  score: number;
  className?: string;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Ausgezeichnet";
  if (score >= 60) return "Gut";
  if (score >= 40) return "Mittel";
  if (score >= 20) return "Schlecht";
  return "Kritisch";
}

function getScoreRingColor(score: number): string {
  if (score >= 70) return "#059669"; // emerald
  if (score >= 40) return "#d97706"; // amber
  return "#dc2626"; // red
}

export function HealthScore({ score, className }: HealthScoreProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreRingColor(score);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Inbox Health Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-6">
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" className="-rotate-90">
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(220 14.3% 95.9%)"
              strokeWidth="12"
            />
            {/* Progress ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute flex flex-col items-center">
            <span className={cn("text-3xl font-bold", getScoreColor(score))}>{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className={cn("text-sm font-semibold", getScoreColor(score))}>{getScoreLabel(score)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Postfach-Gesundheit</p>
        </div>
      </CardContent>
    </Card>
  );
}
