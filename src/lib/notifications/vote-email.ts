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

export async function notifyOwnerNewVote(input: {
  orgId: string;
  pollTitle: string;
  pollSlug: string;
  voterName: string;
}): Promise<void> {
  if (!resendApiKey) return;

  let ownerEmail: string | undefined;
  try {
    const user = await adminAuth.getUser(input.orgId);
    ownerEmail = user.email;
  } catch {
    return;
  }

  if (!ownerEmail) return;

  const org = await getOrgById(input.orgId);
  const lang: I18nLocale = org?.language ?? "ca";
  const { email: strings } = getI18n(lang);
  const resultsUrl = `https://summareu.app/p/${input.pollSlug}/results`;

  const escapedTitle = escapeHtml(input.pollTitle);
  const escapedVoter = escapeHtml(input.voterName);

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "Summa Reu <your-meeting@summareu.app>",
      to: ownerEmail,
      subject: replaceTokens(strings.voteSubject, { title: input.pollTitle }),
      html: [
        `<p>${replaceTokens(strings.voteBody, { voterName: `<strong>${escapedVoter}</strong>`, title: `<strong>${escapedTitle}</strong>` })}</p>`,
        `<p><a href="${resultsUrl}">${strings.voteCta}</a></p>`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("vote_email_send_failed", input.orgId, error);
  }
}
