/**
 * Heuristic message classifier.
 * Determines newsletter/subscription/spam categories based on message metadata.
 * Results are probabilistic — UI clearly communicates this.
 */
import type { NormalizedMessage } from "./types";
import type { ClassificationResult, RiskFactor, RiskFactorType } from "@/types";
import { MessageCategory } from "@prisma/client";

// Newsletter keywords in subject lines
const NEWSLETTER_SUBJECT_PATTERNS = [
  /newsletter/i,
  /weekly\s*(digest|update|roundup)/i,
  /monthly\s*(digest|update|roundup)/i,
  /\bdigest\b/i,
  /\bunsubscribe\b/i,
  /you('re| are) (subscribed|receiving)/i,
];

// Billing/subscription subject patterns
const BILLING_SUBJECT_PATTERNS = [
  /rechnung|invoice|billing/i,
  /zahlungsbestätigung|payment\s*confirm/i,
  /abo.*verlänger|subscription.*renew/i,
  /your\s*(subscription|plan)\s*(has|will|is)/i,
  /receipt\s*from/i,
  /order\s*confirm/i,
  /quittung/i,
];

// Urgent/alarm language patterns (risk indicator)
const URGENCY_PATTERNS = [
  /dringend|urgent|sofort|immediately/i,
  /konto.*gesperrt|account.*suspended|account.*locked/i,
  /passwort.*abgelaufen|password.*expired/i,
  /verify\s*(your\s*)?account/i,
  /ungewöhnliche\s*aktivität|unusual\s*activity/i,
  /last\s*chance|letzte\s*chance/i,
  /action\s*required|handlung\s*erforderlich/i,
  /limited\s*time|zeitlich\s*begrenzt/i,
];

// Promotion patterns
const PROMO_PATTERNS = [
  /\d+\s*%\s*(off|rabatt|discount)/i,
  /sale\s*ends|angebot\s*endet/i,
  /exclusive\s*(offer|deal)/i,
  /\bblack\s*friday\b/i,
  /\bcyber\s*monday\b/i,
  /gratis|kostenlos\s*testen/i,
];

// Suspicious domain patterns (lookalike detection)
const LOOKALIKE_PATTERNS: Array<{ legit: RegExp; indicator: string }> = [
  { legit: /paypal\.com$/, indicator: "paypal" },
  { legit: /amazon\.com$|amazon\.de$/, indicator: "amazon" },
  { legit: /apple\.com$/, indicator: "apple" },
  { legit: /google\.com$/, indicator: "google" },
  { legit: /microsoft\.com$/, indicator: "microsoft" },
  { legit: /dhl\.de$|dhl\.com$/, indicator: "dhl" },
  { legit: /sparkasse\.de$/, indicator: "sparkasse" },
  { legit: /postbank\.de$/, indicator: "postbank" },
];

export function classifyMessage(msg: NormalizedMessage): ClassificationResult {
  const subject = msg.subject ?? "";
  const domain = msg.fromDomain;
  const headers = msg.headers;

  const listUnsubscribeHeader = headers["list-unsubscribe"] ?? headers["List-Unsubscribe"] ?? "";
  const listIdHeader = headers["list-id"] ?? headers["List-Id"] ?? "";
  const precedenceHeader = (headers["precedence"] ?? headers["Precedence"] ?? "").toLowerCase();
  const xMailer = headers["x-mailer"] ?? headers["X-Mailer"] ?? "";

  // ── Newsletter detection ──
  const hasListUnsubscribe = listUnsubscribeHeader.length > 0;
  const hasListId = listIdHeader.length > 0;
  const isBulkPrecedence = precedenceHeader === "bulk" || precedenceHeader === "list";
  const subjectMatchesNewsletter = NEWSLETTER_SUBJECT_PATTERNS.some((p) => p.test(subject));
  const isKnownEsp = /mailchimp|sendgrid|klaviyo|mailjet|constantcontact|campaign\s*monitor|hubspot|brevo|sendinblue/i.test(xMailer);

  const isNewsletter =
    hasListUnsubscribe ||
    hasListId ||
    isBulkPrecedence ||
    subjectMatchesNewsletter ||
    isKnownEsp;

  // ── Subscription/billing detection ──
  const isSubscriptionBilling = BILLING_SUBJECT_PATTERNS.some((p) => p.test(subject));

  // ── Promotion detection ──
  const isPromotion = PROMO_PATTERNS.some((p) => p.test(subject));

  // ── Category assignment ──
  let category: MessageCategory;
  if (isSubscriptionBilling) {
    category = MessageCategory.SUBSCRIPTION_BILLING;
  } else if (isNewsletter) {
    category = MessageCategory.NEWSLETTER;
  } else if (isPromotion) {
    category = MessageCategory.PROMOTION;
  } else {
    category = MessageCategory.OTHER;
  }

  // ── Unsubscribe URL extraction ──
  let unsubscribeUrl: string | null = null;
  let unsubscribeEmail: string | null = null;

  if (listUnsubscribeHeader) {
    const urlMatch = listUnsubscribeHeader.match(/<(https?:\/\/[^>]+)>/);
    const emailMatch = listUnsubscribeHeader.match(/<mailto:([^>]+)>/);
    if (urlMatch) unsubscribeUrl = urlMatch[1];
    if (emailMatch) unsubscribeEmail = emailMatch[1];
  }

  // ── Risk scoring ──
  const riskFactors: RiskFactor[] = [];
  let riskScore = 0;

  // Check urgency language
  if (URGENCY_PATTERNS.some((p) => p.test(subject))) {
    riskFactors.push({
      type: "urgent_language" as RiskFactorType,
      label: "Dringende Sprache",
      description: "Betreff enthält Alarmwörter oder dringliche Aufforderungen",
      weight: 25,
    });
    riskScore += 25;
  }

  // Check lookalike domain
  for (const { legit, indicator } of LOOKALIKE_PATTERNS) {
    if (!legit.test(domain) && (subject.toLowerCase().includes(indicator) || msg.fromEmail.toLowerCase().includes(indicator))) {
      riskFactors.push({
        type: "lookalike_domain" as RiskFactorType,
        label: "Verdächtige Absenderdomain",
        description: `E-Mail erwähnt "${indicator}" kommt aber nicht von der offiziellen Domain`,
        weight: 35,
      });
      riskScore += 35;
      break;
    }
  }

  // Check missing unsubscribe in bulk mail
  if (isBulkPrecedence && !hasListUnsubscribe) {
    riskFactors.push({
      type: "missing_unsubscribe" as RiskFactorType,
      label: "Kein Abmeldelink",
      description: "Massen-E-Mail ohne Abmeldemöglichkeit",
      weight: 15,
    });
    riskScore += 15;
  }

  // Cap at 100
  riskScore = Math.min(100, riskScore);

  // Update category if high risk
  if (riskScore >= 50 && category === MessageCategory.OTHER) {
    category = MessageCategory.SPAM_SUSPECT;
  }
  if (riskScore >= 75) {
    category = MessageCategory.PHISHING_SUSPECT;
  }

  return {
    isNewsletter,
    isSubscriptionBilling,
    category,
    riskScore,
    riskFactors,
    unsubscribeUrl,
    unsubscribeEmail,
    listId: listIdHeader || null,
    hasListUnsubscribe,
  };
}
