import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildExistingReturnRemittanceState,
  deriveReturnRemittanceStatus,
  determineReturnRemittanceReprocessMode,
} from '../remittances/returns-remittance-state';
import {
  detectOutRemittanceInconsistencies,
  shouldRepairOutRemittanceParent,
} from '../remittances/out-remittance-diagnostics';

describe('determineReturnRemittanceReprocessMode', () => {
  it('ignores archived children and recreates from scratch when none are active', () => {
    const mode = determineReturnRemittanceReprocessMode([
      { archivedAt: '2026-03-12T07:36:22.594Z', contactId: 'donor-1' },
      { archivedAt: '2026-03-12T07:36:22.594Z', contactId: null },
    ]);

    assert.equal(mode, 'create_children_from_scratch');
  });
});

describe('buildExistingReturnRemittanceState', () => {
  it('does not allow complete when only archived children remain', () => {
    const state = buildExistingReturnRemittanceState({
      children: [
        { archivedAt: '2026-03-12T07:36:22.594Z', contactId: 'donor-1', amount: -10, date: '2026-03-05' },
      ],
      fallbackItemCount: 1,
      fallbackPendingReturns: [
        { iban: 'ES11', amount: 10, date: '2026-03-05' },
      ],
    });

    assert.equal(state.activeChildrenCount, 0);
    assert.equal(state.archivedChildrenCount, 1);
    assert.equal(state.remittanceStatus, 'pending');
    assert.equal(state.pendingCount, 1);
  });
});

describe('deriveReturnRemittanceStatus', () => {
  it('keeps complete reserved for flows with active children', () => {
    assert.equal(
      deriveReturnRemittanceStatus({
        hasActiveChildren: false,
        resolvedCount: 2,
        pendingCount: 0,
      }),
      'pending',
    );
  });
});

describe('detectOutRemittanceInconsistencies', () => {
  it('flags the Baruma-style regression when the parent stays complete with only archived children', () => {
    const reasons = detectOutRemittanceInconsistencies({
      parent: {
        amount: -23,
        isRemittance: true,
        remittanceStatus: 'complete',
      },
      activeChildrenCount: 0,
    });

    assert.deepEqual(reasons, ['PARENT_MARKED_PROCESSED_WITHOUT_ACTIVE_CHILDREN']);
    assert.equal(
      shouldRepairOutRemittanceParent({
        parent: {
          amount: -23,
          isRemittance: true,
          remittanceStatus: 'complete',
        },
        activeChildrenCount: 0,
      }),
      true,
    );
  });

  it('flags undone remittance docs that still leave the parent processed', () => {
    const reasons = detectOutRemittanceInconsistencies({
      parent: {
        amount: -23,
        isRemittance: true,
        remittanceStatus: 'complete',
      },
      activeChildrenCount: 0,
      remittanceDocumentStatus: 'undone',
    });

    assert.deepEqual(reasons, [
      'PARENT_MARKED_PROCESSED_WITHOUT_ACTIVE_CHILDREN',
      'REMITTANCE_DOC_UNDONE_BUT_PARENT_STILL_PROCESSED',
    ]);
  });
});
