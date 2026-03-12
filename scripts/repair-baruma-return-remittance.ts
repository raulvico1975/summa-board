/**
 * Reparació puntual i idempotent del cas Baruma detectat.
 *
 * Guardrails:
 * - Només opera sobre el pare conegut de Baruma
 * - No toca filles arxivades
 * - No elimina històric
 * - Només neteja els flags del pare si no hi ha filles actives
 *
 * Execució:
 *   node --import tsx scripts/repair-baruma-return-remittance.ts --dry-run
 *   node --import tsx scripts/repair-baruma-return-remittance.ts --apply
 */

import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import type { Transaction } from '../src/lib/data';
import { countActiveRemittanceChildren } from '../src/lib/remittances/is-active-child';
import {
  detectOutRemittanceInconsistencies,
  shouldRepairOutRemittanceParent,
} from '../src/lib/remittances/out-remittance-diagnostics';

const BARUMA_ORG_ID = 'PrNPBg7YFnk16f9gXdXw';
const BARUMA_PARENT_TX_ID = 'imp_bd019ddcf086ea74ec27a995cfe8';
const FIREBASE_PROJECT_ID = 'summa-social';

function parseArgs(): { apply: boolean } {
  return {
    apply: process.argv.includes('--apply'),
  };
}

async function main(): Promise<void> {
  const { apply } = parseArgs();

  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
      projectId: FIREBASE_PROJECT_ID,
    });
  }

  const db = getFirestore();
  const parentRef = db.doc(`organizations/${BARUMA_ORG_ID}/transactions/${BARUMA_PARENT_TX_ID}`);
  const parentSnap = await parentRef.get();

  if (!parentSnap.exists) {
    throw new Error(`Pare Baruma no trobat: ${BARUMA_PARENT_TX_ID}`);
  }

  const parent = {
    ...(parentSnap.data() as Transaction),
    id: parentSnap.id,
  };
  const childrenSnap = await db
    .collection(`organizations/${BARUMA_ORG_ID}/transactions`)
    .where('parentTransactionId', '==', BARUMA_PARENT_TX_ID)
    .get();
  const children = childrenSnap.docs.map((doc) => ({
    ...(doc.data() as Transaction),
    id: doc.id,
  }));
  const activeChildrenCount = countActiveRemittanceChildren(children);
  const remittanceId = typeof parent.remittanceId === 'string' ? parent.remittanceId : null;
  const remittanceDocStatus = remittanceId
    ? ((await db.doc(`organizations/${BARUMA_ORG_ID}/remittances/${remittanceId}`).get()).data()?.status ?? null)
    : null;
  const reasons = detectOutRemittanceInconsistencies({
    parent,
    activeChildrenCount,
    remittanceDocumentStatus: remittanceDocStatus,
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  REPARACIÓ PUNTUAL BARUMA');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  projectId:          ${FIREBASE_PROJECT_ID}`);
  console.log(`  orgId:              ${BARUMA_ORG_ID}`);
  console.log(`  parentTxId:         ${BARUMA_PARENT_TX_ID}`);
  console.log(`  mode:               ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`  activeChildren:     ${activeChildrenCount}`);
  console.log(`  archivedChildren:   ${children.length - activeChildrenCount}`);
  console.log(`  remittanceDoc:      ${remittanceId ?? '(sense doc)'}`);
  console.log(`  remittanceDocStatus:${typeof remittanceDocStatus === 'string' ? remittanceDocStatus : '(null)'}`);
  console.log(`  reasons:            ${reasons.length > 0 ? reasons.join(', ') : '(cap)'}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (!shouldRepairOutRemittanceParent({
    parent,
    activeChildrenCount,
    remittanceDocumentStatus: remittanceDocStatus,
  })) {
    console.log('');
    console.log('No cal reparació: el pare ja és reprocessable o no presenta la inconsistència objectiu.');
    return;
  }

  if (activeChildrenCount > 0) {
    throw new Error('Guardrail: hi ha filles actives. No és segur netejar el pare.');
  }

  if (!apply) {
    console.log('');
    console.log('DRY-RUN complet. Per aplicar:');
    console.log('node --import tsx scripts/repair-baruma-return-remittance.ts --apply');
    return;
  }

  const batch = db.batch();
  batch.update(parentRef, {
    isRemittance: FieldValue.delete(),
    remittanceId: FieldValue.delete(),
    remittanceItemCount: FieldValue.delete(),
    remittanceResolvedCount: FieldValue.delete(),
    remittancePendingCount: FieldValue.delete(),
    remittancePendingTotalAmount: FieldValue.delete(),
    remittanceType: FieldValue.delete(),
    remittanceDirection: FieldValue.delete(),
    remittanceStatus: FieldValue.delete(),
    pendingReturns: FieldValue.delete(),
    updatedAt: new Date().toISOString(),
  });

  const auditRef = db.collection(`organizations/${BARUMA_ORG_ID}/auditLogs`).doc();
  batch.set(auditRef, {
    action: 'MANUAL_REPAIR_RETURN_REMITTANCE_PARENT',
    parentTxId: BARUMA_PARENT_TX_ID,
    organizationId: BARUMA_ORG_ID,
    reasons,
    activeChildrenCount,
    archivedChildrenCount: children.length - activeChildrenCount,
    remittanceId,
    remittanceDocumentStatus: typeof remittanceDocStatus === 'string' ? remittanceDocStatus : null,
    actorUid: 'codex-script',
    timestamp: new Date().toISOString(),
  });

  await batch.commit();

  console.log('');
  console.log('Reparació aplicada. El pare ha quedat sanejat i reprocessable.');
}

main().catch((error) => {
  console.error('');
  console.error('❌ Error executant reparació Baruma:', error);
  process.exit(1);
});
