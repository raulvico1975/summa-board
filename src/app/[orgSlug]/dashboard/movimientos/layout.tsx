'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/i18n';

interface MovimientosLayoutProps {
  children: React.ReactNode;
}

export default function MovimientosLayout({ children }: MovimientosLayoutProps) {
  const { canAccessMovimentsRoute } = usePermissions();
  const { t } = useTranslations();

  if (!canAccessMovimentsRoute) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t.movements.accessRestrictedTitle}
            </CardTitle>
            <CardDescription>
              {t.movements.accessRestrictedDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t.movements.accessRequirements}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
