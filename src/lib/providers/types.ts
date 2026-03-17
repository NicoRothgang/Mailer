import type { EmailProvider, MessageCategory } from "@prisma/client";
import type { ClassificationResult } from "@/types";

// ─────────────────────────────────────────────
// Provider-agnostic normalized message
// ─────────────────────────────────────────────

export interface NormalizedMessage {
  providerMessageId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  fromDomain: string;
  toEmails: string[];
  sentAt: Date;
  receivedAt: Date;
  isRead: boolean;
  snippet: string | null;
  labels: string[];
  headers: Record<string, string>; // raw headers for heuristics
}

// ─────────────────────────────────────────────
// Sync context passed into adapter
// ─────────────────────────────────────────────

export interface SyncContext {
  connectionId: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  lastSyncAt?: Date;
}

export interface SyncResult {
  processed: number;
  newMessages: number;
  errors: string[];
}

// ─────────────────────────────────────────────
// OAuth token exchange result
// ─────────────────────────────────────────────

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  email: string;
  displayName?: string;
  scopes: string[];
}

// ─────────────────────────────────────────────
// Provider adapter interface (Strategy Pattern)
// ─────────────────────────────────────────────

export interface ProviderAdapter {
  provider: EmailProvider;

  /** Generate the OAuth authorization URL */
  getAuthorizationUrl(state: string): string;

  /** Exchange authorization code for tokens */
  exchangeCode(code: string, redirectUri: string): Promise<TokenSet>;

  /** Refresh an expired access token */
  refreshAccessToken(refreshToken: string): Promise<Omit<TokenSet, "email" | "displayName">>;

  /** Sync messages from the provider */
  syncMessages(ctx: SyncContext): Promise<SyncResult>;

  /** Fetch raw message list (paginated) */
  listMessages(accessToken: string, options: ListMessagesOptions): Promise<ProviderMessagePage>;
}

export interface ListMessagesOptions {
  maxResults?: number;
  pageToken?: string;
  after?: Date;
  labels?: string[];
}

export interface ProviderMessagePage {
  messages: NormalizedMessage[];
  nextPageToken?: string;
  totalEstimate?: number;
}

// ─────────────────────────────────────────────
// Message classification service
// ─────────────────────────────────────────────

export interface MessageClassifier {
  classify(message: NormalizedMessage): ClassificationResult;
}
