import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ca } from "@/src/i18n/ca";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">{ca.home.title}</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">{ca.home.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/p/demo-poll">
              <Button>{ca.home.ctaPublic}</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">{ca.home.ctaOwner}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
