import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { StatusBadge } from "@/src/components/ui/status-badge";
import { ResultsTable } from "@/src/components/polls/results-table";
import { getPollBySlug, getPollVoteRows } from "@/src/lib/db/repo";
import { formatDateTime } from "@/src/lib/dates";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";

export default async function PublicPollResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [poll, owner] = await Promise.all([getPollBySlug(slug), getOwnerFromServerCookies()]);

  if (!poll) {
    notFound();
  }

  const rows = await getPollVoteRows(poll.id);
  const options = poll.options.map((option) => ({ id: option.id, label: formatDateTime(option.startsAt) }));

  const totals = options.map((option) => ({
    ...option,
    count: rows.reduce(
      (acc, row) => acc + (row.availabilityByOptionId[option.id] ? 1 : 0),
      0
    ),
  }));

  const ranked = [...totals].sort((a, b) => b.count - a.count);
  const bestOption = ranked[0];
  const isOwner = owner?.orgId === poll.orgId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resultats: {poll.title}</h1>
        <StatusBadge status={poll.status} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Opcions ordenades</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {ranked.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                index === 0 ? "border-sky-200 bg-sky-50" : "border-slate-200"
              }`}
            >
              <span>{item.label}</span>
              <span className="font-medium">{item.count} disponibles</span>
            </div>
          ))}

          {bestOption ? (
            <p className="pt-2 text-sm text-sky-700">Millor opció: {bestOption.label}</p>
          ) : null}

          {isOwner && poll.status === "open" ? (
            <Link href={`/polls/${poll.id}`} className="inline-block pt-2 text-sm font-medium text-sky-700 hover:underline">
              Tancar votació
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Taula de vots</h2>
        </CardHeader>
        <CardContent>
          <ResultsTable options={options} rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
