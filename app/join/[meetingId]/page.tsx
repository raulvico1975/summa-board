import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeetingJoinShell } from "@/src/components/meetings/meeting-join-shell";
import { getMeetingById, isMeetingUsable } from "@/src/lib/db/repo";
import { formatDateTime } from "@/src/lib/dates";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";
import { localizedPublicMetadata } from "@/src/lib/seo";
import { withLocalePath } from "@/src/i18n/routing";
import { getRequestI18n } from "@/src/i18n/server";
import { getProductConfig } from "@/src/lib/product/config";

type PageSearchParams = Record<string, string | string[] | undefined>;

function readSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeReturnHref(value: string | undefined, locale: "ca" | "es"): string {
  const fallbackHref = withLocalePath(locale, "/");
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallbackHref;
  }

  return value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}): Promise<Metadata> {
  const { locale } = await getRequestI18n();
  const product = getProductConfig();
  const { meetingId } = await params;
  const meeting = await getMeetingById(meetingId);
  const fallbackTitle =
    locale === "ca" ? `Accés a la reunió | ${product.brandName}` : `Acceso a la reunión | ${product.brandName}`;
  const description =
    locale === "ca"
      ? `Accés privat i guiat a la sala de reunió de ${product.brandName}.`
      : `Acceso privado y guiado a la sala de reunión de ${product.brandName}.`;

  return {
    ...localizedPublicMetadata({
      locale,
      path: `/join/${meetingId}`,
      title: meeting ? `${meeting.title} | ${product.brandName}` : fallbackTitle,
      description,
    }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MeetingJoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ meetingId: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { locale } = await getRequestI18n();
  const [{ meetingId }, rawSearchParams, owner] = await Promise.all([
    params,
    searchParams,
    getOwnerFromServerCookies(),
  ]);

  const meeting = await getMeetingById(meetingId);
  if (!meeting || !isMeetingUsable(meeting)) {
    notFound();
  }

  const scheduledLabel = meeting.scheduledAt ? formatDateTime(meeting.scheduledAt, locale) : null;
  const initialDisplayName =
    owner?.orgId === meeting.orgId ? owner.contactName?.trim() || owner.orgName.trim() : null;
  const autoJoinParam = readSearchParam(rawSearchParams.autojoin);
  const returnToParam = readSearchParam(rawSearchParams.returnTo);

  return (
    <MeetingJoinShell
      locale={locale}
      meetingId={meeting.id}
      meetingTitle={meeting.title}
      scheduledLabel={scheduledLabel}
      initialDisplayName={initialDisplayName}
      autoJoin={autoJoinParam === "1" || autoJoinParam === "true"}
      returnHref={sanitizeReturnHref(returnToParam, locale)}
    />
  );
}
