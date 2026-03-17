"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  try {
  const [
    latestScore,
    totalMessages,
    newsletterCount,
    spamRiskCount,
    subscriptionCount,
    possiblyUnused,
    connectedProviders,
    topSenders,
    recentActivity,
  ] = await Promise.all([
    // Latest health score
    db.inboxScoreSnapshot.findFirst({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
    }),
    // Total messages
    db.emailMessage.count({ where: { userId } }),
    // Newsletter count
    db.newsletterEntity.count({ where: { userId, status: "ACTIVE" } }),
    // High risk messages
    db.riskEntity.count({ where: { userId, riskScore: { gte: 50 }, status: "PENDING_REVIEW" } }),
    // Active subscriptions
    db.subscriptionEntity.count({ where: { userId, status: "ACTIVE" } }),
    // Possibly inactive subscriptions
    db.subscriptionEntity.count({ where: { userId, status: "POSSIBLY_INACTIVE" } }),
    // Connected providers
    db.providerConnection.count({ where: { userId, status: "ACTIVE" } }),
    // Top senders by message count
    db.sender.findMany({
      where: { userId },
      orderBy: { totalMessages: "desc" },
      take: 5,
      select: { domain: true, brandName: true, totalMessages: true, categories: true },
    }),
    // Recent user actions
    db.userActionLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Calculate health score if no snapshot exists yet
  const healthScore = latestScore?.score ?? calculateHealthScore({
    totalMessages,
    newsletterCount,
    spamRiskCount,
    subscriptionCount,
  });

  return {
    healthScore,
    totalMessages,
    newsletterCount,
    spamRiskCount,
    subscriptionCount,
    potentiallyUnusedCount: possiblyUnused,
    connectedProviders,
    topSenders,
    recentActivity,
  };
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return null;
  }
}

function calculateHealthScore({
  totalMessages,
  newsletterCount,
  spamRiskCount,
  subscriptionCount,
}: {
  totalMessages: number;
  newsletterCount: number;
  spamRiskCount: number;
  subscriptionCount: number;
}): number {
  if (totalMessages === 0) return 80; // Default for empty inbox

  let score = 100;

  // Penalty for newsletters (max -30 points)
  const newsletterRatio = newsletterCount / Math.max(totalMessages, 1);
  score -= Math.min(30, Math.round(newsletterRatio * 100));

  // Penalty for spam risk (max -30 points)
  const spamRatio = spamRiskCount / Math.max(totalMessages, 1);
  score -= Math.min(30, Math.round(spamRatio * 200));

  // Small penalty for subscriptions (max -10 points, but they're useful)
  score -= Math.min(10, subscriptionCount);

  return Math.max(0, Math.min(100, score));
}
