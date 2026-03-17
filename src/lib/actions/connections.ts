"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import type { ConnectionWithStats } from "@/types";
import type { EmailProvider } from "@prisma/client";

/** List all connections for the current user (tokens never returned) */
export async function getUserConnections(): Promise<ConnectionWithStats[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const connections = await db.providerConnection.findMany({
    where: { userId: session.user.id },
    include: {
      syncJobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return connections.map(({ syncJobs, accessTokenEnc, refreshTokenEnc, ...conn }) => ({
    ...conn,
    latestSync: syncJobs[0] ?? null,
  }));
}

/** Delete / disconnect a provider connection */
export async function disconnectProvider(connectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Nicht authentifiziert" };
  }

  const connection = await db.providerConnection.findFirst({
    where: { id: connectionId, userId: session.user.id },
  });

  if (!connection) {
    return { success: false as const, error: "Verbindung nicht gefunden" };
  }

  await db.providerConnection.delete({ where: { id: connectionId } });

  await db.userActionLog.create({
    data: {
      userId: session.user.id,
      action: "disconnect_provider",
      targetType: "connection",
      targetId: connectionId,
      details: { provider: connection.provider, email: connection.email },
    },
  });

  return { success: true as const };
}

/** Trigger a manual sync for a connection */
export async function triggerSync(connectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Nicht authentifiziert" };
  }

  const connection = await db.providerConnection.findFirst({
    where: { id: connectionId, userId: session.user.id },
  });

  if (!connection) {
    return { success: false as const, error: "Verbindung nicht gefunden" };
  }

  // Check if a sync is already running
  const running = await db.syncJob.findFirst({
    where: { connectionId, status: "RUNNING" },
  });
  if (running) {
    return { success: false as const, error: "Sync läuft bereits" };
  }

  const job = await db.syncJob.create({
    data: {
      connectionId,
      status: "QUEUED",
      syncType: "MANUAL",
    },
  });

  // In a production system this would enqueue to a background worker
  // For MVP we process inline (limited batch)
  // TODO: Replace with proper queue (e.g. BullMQ / Inngest)
  processSync(job.id, connectionId, session.user.id).catch(console.error);

  return { success: true as const, jobId: job.id };
}

/** Internal: run sync (simplified MVP implementation) */
async function processSync(jobId: string, connectionId: string, userId: string) {
  await db.syncJob.update({ where: { id: jobId }, data: { status: "RUNNING", startedAt: new Date() } });

  try {
    const connection = await db.providerConnection.findUnique({ where: { id: connectionId } });
    if (!connection) throw new Error("Connection not found");

    const { importProviderAdapter } = await import("@/lib/providers/adapter");
    const adapter = importProviderAdapter(connection.provider);

    // Decrypt tokens
    const accessToken = decrypt(connection.accessTokenEnc);
    const refreshToken = connection.refreshTokenEnc ? decrypt(connection.refreshTokenEnc) : undefined;

    const result = await adapter.syncMessages({
      connectionId,
      userId,
      accessToken,
      refreshToken,
      tokenExpiry: connection.tokenExpiry ?? undefined,
      lastSyncAt: connection.lastSyncAt ?? undefined,
    });

    await db.syncJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        messagesProcessed: result.processed,
        newMessages: result.newMessages,
      },
    });

    await db.providerConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date(), totalMessages: { increment: result.newMessages } },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    await db.syncJob.update({
      where: { id: jobId },
      data: { status: "FAILED", completedAt: new Date(), errorMessage: message },
    });
  }
}

/** Get decrypted access token for server-side use only */
export async function getDecryptedToken(
  userId: string,
  provider: EmailProvider
): Promise<{ accessToken: string; refreshToken?: string; expiry?: Date } | null> {
  const connection = await db.providerConnection.findFirst({
    where: { userId, provider, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
  if (!connection) return null;

  return {
    accessToken: decrypt(connection.accessTokenEnc),
    refreshToken: connection.refreshTokenEnc ? decrypt(connection.refreshTokenEnc) : undefined,
    expiry: connection.tokenExpiry ?? undefined,
  };
}
