'use client';

import * as React from 'react';
import { Clock3, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/i18n';
import { SepaCollectionWizard } from './SepaCollectionWizard';
import { SepaCollectionRunsHistory } from './SepaCollectionRunsHistory';

type SepaCollectionView = 'create' | 'history';

export function SepaCollectionWorkspace() {
  const { t, tr } = useTranslations();
  const [view, setView] = React.useState<SepaCollectionView>('create');

  return (
    <Tabs value={view} onValueChange={(value) => setView(value as SepaCollectionView)} className="space-y-4">
      <TabsList className="grid h-auto w-full grid-cols-2">
        <TabsTrigger value="create" className="flex min-h-11 items-center gap-2 whitespace-normal text-center">
          <PlusCircle className="h-4 w-4" />
          <span>{t.sepaCollection.newCollection}</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex min-h-11 items-center gap-2 whitespace-normal text-center">
          <Clock3 className="h-4 w-4" />
          <span>{tr('sepaPain008.history.tab', 'Historial')}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" forceMount className={view === 'create' ? 'mt-0' : 'hidden'}>
        <SepaCollectionWizard />
      </TabsContent>

      <TabsContent value="history" forceMount className={view === 'history' ? 'mt-0' : 'hidden'}>
        <SepaCollectionRunsHistory />
      </TabsContent>
    </Tabs>
  );
}
