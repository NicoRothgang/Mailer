/**
 * Provider adapter registry.
 * Dynamically loads the correct adapter for a given EmailProvider.
 */
import type { EmailProvider } from "@prisma/client";
import type { ProviderAdapter } from "./types";

export function importProviderAdapter(provider: EmailProvider): ProviderAdapter {
  switch (provider) {
    case "GMAIL":
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./gmail").gmailAdapter as ProviderAdapter;
    case "OUTLOOK":
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./outlook").outlookAdapter as ProviderAdapter;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
