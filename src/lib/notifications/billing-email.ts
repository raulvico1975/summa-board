import { Resend } from "resend";
import { adminAuth } from "@/src/lib/firebase/admin";
import { getOrgById } from "@/src/lib/db/repo";
import { getI18n } from "@/src/i18n";
import type { I18nLocale } from "@/src/i18n/config";

const resendApiKey = process.env.RESEND_API_KEY;
const GRACE_PERIOD_DAYS = "3";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function replaceTokens(template: string, tokens: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(tokens)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

async function getOwnerEmail(org: Awaited<ReturnType<typeof getOrgById>>): Promise<string | null> {
  if (!org) return null;

  try {
    const user = await adminAuth.getUser(org.ownerUid);
    return user.email ?? null;
  } catch {
    return null;
  }
}

function getOrgLanguage(org: { language?: I18nLocale | null } | null): I18nLocale {
  return org?.language ?? "ca";
}

export async function notifyOwnerBillingPastDue(input: {
  orgId: string;
  orgName: string;
}): Promise<void> {
  if (!resendApiKey) return;

  const org = await getOrgById(input.orgId);
  if (!org) return;

  const [ownerEmail, lang] = await Promise.all([getOwnerEmail(org), getOrgLanguage(org)]);
  if (!ownerEmail) return;

  const { email: strings } = getI18n(lang);
  const billingUrl = "https://summareu.app/billing";
  const escapedOrgName = escapeHtml(input.orgName);

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "Summa Reu <your-meeting@summareu.app>",
      to: ownerEmail,
      subject: replaceTokens(strings.billingPastDueSubject, { orgName: input.orgName }),
      html: [
        `<p>${replaceTokens(strings.billingPastDueBody, {
          orgName: `<strong>${escapedOrgName}</strong>`,
          days: GRACE_PERIOD_DAYS,
        })}</p>`,
        `<p><a href="${billingUrl}">${strings.billingPastDueCta}</a></p>`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("billing_past_due_email_failed", input.orgId, error);
  }
}
