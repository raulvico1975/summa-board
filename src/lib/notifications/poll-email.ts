import { Resend } from "resend";
import { adminAuth } from "@/src/lib/firebase/admin";
import { getOrgById } from "@/src/lib/db/repo";
import { getI18n } from "@/src/i18n";
import type { I18nLocale } from "@/src/i18n/config";

const resendApiKey = process.env.RESEND_API_KEY;

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

async function getOwnerEmail(orgId: string): Promise<string | null> {
  try {
    const user = await adminAuth.getUser(orgId);
    return user.email ?? null;
  } catch {
    return null;
  }
}

async function getOrgLanguage(orgId: string): Promise<I18nLocale> {
  const org = await getOrgById(orgId);
  return org?.language ?? "ca";
}

export async function notifyOwnerPollCreated(input: {
  orgId: string;
  pollTitle: string;
  pollSlug: string;
}): Promise<void> {
  if (!resendApiKey) return;

  const ownerEmail = await getOwnerEmail(input.orgId);
  if (!ownerEmail) return;

  const lang = await getOrgLanguage(input.orgId);
  const { email: strings } = getI18n(lang);
  const voteUrl = `https://summareu.app/p/${input.pollSlug}`;
  const escapedTitle = escapeHtml(input.pollTitle);

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "Summa Reu <your-meeting@summareu.app>",
      to: ownerEmail,
      subject: replaceTokens(strings.pollCreatedSubject, { title: input.pollTitle }),
      html: [
        `<p>${replaceTokens(strings.pollCreatedBody, { title: `<strong>${escapedTitle}</strong>` })}</p>`,
        `<p>${strings.pollCreatedShareCta}</p>`,
        `<p><a href="${voteUrl}">${voteUrl}</a></p>`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("poll_created_email_failed", input.orgId, error);
  }
}

export async function notifyOwnerPollClosed(input: {
  orgId: string;
  pollTitle: string;
  meetingId: string;
}): Promise<void> {
  if (!resendApiKey) return;

  const ownerEmail = await getOwnerEmail(input.orgId);
  if (!ownerEmail) return;

  const lang = await getOrgLanguage(input.orgId);
  const { email: strings } = getI18n(lang);
  const meetingUrl = `https://summareu.app/owner/meetings/${input.meetingId}`;
  const escapedTitle = escapeHtml(input.pollTitle);

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "Summa Reu <your-meeting@summareu.app>",
      to: ownerEmail,
      subject: replaceTokens(strings.pollClosedSubject, { title: input.pollTitle }),
      html: [
        `<p>${replaceTokens(strings.pollClosedBody, { title: `<strong>${escapedTitle}</strong>` })}</p>`,
        `<p><a href="${meetingUrl}">${strings.pollClosedCta}</a></p>`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("poll_closed_email_failed", input.orgId, error);
  }
}
