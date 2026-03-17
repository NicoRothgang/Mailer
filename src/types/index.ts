import type {
  User,
  ProviderConnection,
  EmailMessage,
  Sender,
  NewsletterEntity,
  SubscriptionEntity,
  RiskEntity,
  SyncJob,
  InboxScoreSnapshot,
  EmailProvider,
  ConnectionStatus,
  MessageCategory,
  NewsletterStatus,
  SubscriptionCategory,
  BillingInterval,
  SubscriptionStatus,
  RiskStatus,
  SyncStatus,
  UserRole,
} from "@prisma/client";

// Re-export Prisma types
export type {
  User,
  ProviderConnection,
  EmailMessage,
  Sender,
  NewsletterEntity,
  SubscriptionEntity,
  RiskEntity,
  SyncJob,
  InboxScoreSnapshot,
  EmailProvider,
  ConnectionStatus,
  MessageCategory,
  NewsletterStatus,
  SubscriptionCategory,
  BillingInterval,
  SubscriptionStatus,
  RiskStatus,
  SyncStatus,
  UserRole,
};

// ─────────────────────────────────────────────
// API / Server Action response shapes
// ─────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export interface DashboardStats {
  healthScore: number;
  totalMessages: number;
  newsletterCount: number;
  spamRiskCount: number;
  subscriptionCount: number;
  potentiallyUnusedCount: number;
  connectedProviders: number;
  topSenders: TopSenderItem[];
  recentActivity: RecentActivityItem[];
}

export interface TopSenderItem {
  domain: string;
  brandName: string | null;
  totalMessages: number;
  categories: MessageCategory[];
}

export interface RecentActivityItem {
  id: string;
  action: string;
  targetType: string | null;
  status: string;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// Connections
// ─────────────────────────────────────────────

export interface ConnectionWithStats extends Omit<ProviderConnection, "accessTokenEnc" | "refreshTokenEnc"> {
  latestSync: SyncJob | null;
}

// ─────────────────────────────────────────────
// Newsletters
// ─────────────────────────────────────────────

export type NewsletterWithSender = NewsletterEntity & {
  sender: Sender | null;
};

// ─────────────────────────────────────────────
// Subscriptions
// ─────────────────────────────────────────────

export type SubscriptionWithSender = SubscriptionEntity & {
  sender: Sender | null;
};

export interface SubscriptionSummary {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  possiblyInactiveCount: number;
  currency: string;
}

// ─────────────────────────────────────────────
// Risk / Spam
// ─────────────────────────────────────────────

export interface RiskFactor {
  type: RiskFactorType;
  label: string;
  description: string;
  weight: number; // contribution to overall score
}

export type RiskFactorType =
  | "unknown_sender"
  | "urgent_language"
  | "suspicious_links"
  | "domain_mismatch"
  | "invoice_panic"
  | "unusual_subject"
  | "bulk_send_pattern"
  | "missing_unsubscribe"
  | "spf_dkim_fail"
  | "lookalike_domain";

export type RiskEntityWithMessage = RiskEntity & {
  message: EmailMessage;
};

// ─────────────────────────────────────────────
// Heuristics
// ─────────────────────────────────────────────

export interface ClassificationResult {
  isNewsletter: boolean;
  isSubscriptionBilling: boolean;
  category: MessageCategory;
  riskScore: number;
  riskFactors: RiskFactor[];
  unsubscribeUrl: string | null;
  unsubscribeEmail: string | null;
  listId: string | null;
  hasListUnsubscribe: boolean;
}

// ─────────────────────────────────────────────
// Provider OAuth state
// ─────────────────────────────────────────────

export interface OAuthState {
  userId: string;
  provider: EmailProvider;
  nonce: string;
  redirectTo?: string;
}

// ─────────────────────────────────────────────
// Session extension
// ─────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
      onboardingCompleted: boolean;
    };
  }

  interface User {
    role: UserRole;
    onboardingCompleted: boolean;
  }
}
