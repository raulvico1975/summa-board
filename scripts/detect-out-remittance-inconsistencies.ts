/**
 * Detector global de remeses OUT inconsistents.
 *
 * Cerca, per organització, pares OUT on:
 * - el pare continua marcat com a processat (`isRemittance === true` o `remittanceStatus === 'complete'`)
 *   però no té cap filla activa per `parentTransactionId`
 * - o el document de remesa està `undone*` mentre el pare continua processat
 *
 * Execució:
 *   node --import tsx scripts/detect-out-remittance-inconsistencies.ts
 *   node --import tsx scripts/detect-out-remittance-inconsistencies.ts --org <orgId>
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Transaction } from '../src/lib/data';
import { countActiveRemittanceChildren } from '../src/lib/remittances/is-active-child';
import {
  detectOutRemittanceInconsistencies,
  type OutRemittanceInconsistencyReason,
} from '../src/lib/remittances/out-remittance-diagnostics';

const OUTPUT_DIR = path.join(process.cwd(), 'tmp', 'audit');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'out-remittance-inconsistencies.json');
const FIREBASE_PROJECT_ID = 'summa-social';

interface OrgMeta {
  id: string;
  name: string | null;
  slug: string | null;
}

interface Finding {
  orgId: string;
  orgName: string | null;
  orgSlug: string | null;
  parentTxId: string;
  amount: number | null;
  remittanceType: string | null;
  remittanceStatus: string | null;
  remittanceId: string | null;
  remittanceDocumentStatus: string | null;
  totalChildrenCount: number;
  activeChildrenCount: number;
  archivedChildrenCount: number;
  reasons: OutRemittanceInconsistencyReason[];
}

function parseArgs(): { orgId: string | null } {
  const args = process.argv.slice(2);
  let orgId: string | null = null;

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--org' && args[i + 1]) {
      orgId = args[i + 1];
      i += 1;
    }
  }

  return { orgId };
}

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function uniqueDocs<T extends { id: string }>(docs: T[]): T[] {
  const byId = new Map<string, T>();
  for (const doc of docs) {
    byId.set(doc.id, doc);
  }
  return [...byId.values()];
}

async function listOrganizations(db: FirebaseFirestore.Firestore, orgId: string | null): Promise<OrgMeta[]> {
  if (orgId) {
    const orgSnap = await db.doc(`organizations/${orgId}`).get();
    if (!orgSnap.exists) {
      throw new Error(`Organització no trobada: ${orgId}`);
    }

    const data = orgSnap.data();
    return [{
      id: orgSnap.id,
      name: typeof data?.name === 'string' ? data.name : null,
      slug: typeof data?.slug === 'string' ? data.slug : null,
    }];
  }

  const orgsSnap = await db.collection('organizations').select('name', 'slug').get();
  return orgsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: typeof data.name === 'string' ? data.name : null,
      slug: typeof data.slug === 'string' ? data.slug : null,
    };
  });
}

async function getRemittanceDocumentStatus(
  db: FirebaseFirestore.Firestore,
  orgId: string,
  remittanceId: string | null
): Promise<string | null> {
  if (!remittanceId) {
    return null;
  }

  const remittanceSnap = await db.doc(`organizations/${orgId}/remittances/${remittanceId}`).get();
  if (!remittanceSnap.exists) {
    return null;
  }

  const status = remittanceSnap.data()?.status;
  return typeof status === 'string' ? status : null;
}

async function detectForOrg(
  db: FirebaseFirestore.Firestore,
  org: OrgMeta
): Promise<Finding[]> {
  const txCollection = db.collection(`organizations/${org.id}/transactions`);

  const [remittanceParentsSnap, completeParentsSnap] = await Promise.all([
    txCollection.where('isRemittance', '==', true).get(),
    txCollection.where('remittanceStatus', '==', 'complete').get(),
  ]);

  const parentDocs = uniqueDocs([...remittanceParentsSnap.docs, ...completeParentsSnap.docs]);
  const findings: Finding[] = [];

  for (const parentDoc of parentDocs) {
    const parentData = {
      ...(parentDoc.data() as Transaction),
      id: parentDoc.id,
    };

    if ((parentData.amount ?? 0) >= 0) {
      continue;
    }

    if (parentData.parentTransactionId) {
      continue;
    }

    const childrenSnap = await txCollection
      .where('parentTransactionId', '==', parentDoc.id)
      .get();

    const childRows = childrenSnap.docs.map((doc) => ({
      ...(doc.data() as Transaction),
      id: doc.id,
    }));
    const activeChildrenCount = countActiveRemittanceChildren(childRows);
    const totalChildrenCount = childRows.length;
    const archivedChildrenCount = totalChildrenCount - activeChildrenCount;
    const remittanceId = typeof parentData.remittanceId === 'string' ? parentData.remittanceId : null;
    const remittanceDocumentStatus = await getRemittanceDocumentStatus(db, org.id, remittanceId);
    const reasons = detectOutRemittanceInconsistencies({
      parent: parentData,
      activeChildrenCount,
      remittanceDocumentStatus,
    });

    if (reasons.length === 0) {
      continue;
    }

    findings.push({
      orgId: org.id,
      orgName: org.name,
      orgSlug: org.slug,
      parentTxId: parentDoc.id,
      amount: typeof parentData.amount === 'number' ? parentData.amount : null,
      remittanceType: typeof parentData.remittanceType === 'string' ? parentData.remittanceType : null,
      remittanceStatus: typeof parentData.remittanceStatus === 'string' ? parentData.remittanceStatus : null,
      remittanceId,
      remittanceDocumentStatus,
      totalChildrenCount,
      activeChildrenCount,
      archivedChildrenCount,
      reasons,
    });
  }

  return findings;
}

async function main(): Promise<void> {
  const { orgId } = parseArgs();

  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
      projectId: FIREBASE_PROJECT_ID,
    });
  }

  const db = getFirestore();
  const organizations = await listOrganizations(db, orgId);
  const findings: Finding[] = [];

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  DETECTOR GLOBAL DE REMESES OUT INCONSISTENTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Projecte: ${FIREBASE_PROJECT_ID}`);
  console.log(`  Organitzacions: ${organizations.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  for (const org of organizations) {
    console.log(`Revisant ${org.slug || org.id}...`);
    const orgFindings = await detectForOrg(db, org);
    findings.push(...orgFindings);
  }

  ensureOutputDir();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    organizationsScanned: organizations.length,
    findings,
  }, null, 2));

  const findingsByOrg = new Map<string, Finding[]>();
  for (const finding of findings) {
    const key = `${finding.orgId}::${finding.orgSlug || ''}::${finding.orgName || ''}`;
    const current = findingsByOrg.get(key) ?? [];
    current.push(finding);
    findingsByOrg.set(key, current);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  RESULTAT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Casos totals: ${findings.length}`);
  console.log(`  Organitzacions afectades: ${findingsByOrg.size}`);
  console.log(`  JSON: ${OUTPUT_FILE}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (findings.length === 0) {
    console.log('');
    console.log('No s\'han trobat remeses OUT inconsistents.');
    return;
  }

  for (const [orgKey, orgFindings] of findingsByOrg.entries()) {
    const [currentOrgId, currentOrgSlug, currentOrgName] = orgKey.split('::');
    console.log('');
    console.log(`- Org: ${currentOrgSlug || currentOrgId}${currentOrgName ? ` (${currentOrgName})` : ''}`);
    console.log(`  Casos: ${orgFindings.length}`);
    for (const finding of orgFindings) {
      console.log(
        `  · ${finding.parentTxId} | amount=${finding.amount} | type=${finding.remittanceType || '(sense)'} | active=${finding.activeChildrenCount} | archived=${finding.archivedChildrenCount} | reasons=${finding.reasons.join(',')}`
      );
    }
  }
}

main().catch((error) => {
  console.error('');
  console.error('❌ Error executant detector global:', error);
  process.exit(1);
});
