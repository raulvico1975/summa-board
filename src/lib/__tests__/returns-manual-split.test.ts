import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ParentAlreadyProcessedError,
  assertNoActiveReturnChildren,
  getActiveReturnChildren,
} from '../returns/process-guards';

describe('return process guards', () => {
  it('ignores archived children and allows reprocess once undo left no active children', () => {
    const children: Array<{ archivedAt?: string; amount: number }> = [
      { archivedAt: '2026-03-19T10:00:00.000Z', amount: -20 },
      { archivedAt: '2026-03-19T10:00:00.000Z', amount: -20 },
      { archivedAt: '2026-03-19T10:00:00.000Z', amount: -20 },
    ];

    assert.deepEqual(getActiveReturnChildren(children), []);
    assert.doesNotThrow(() => assertNoActiveReturnChildren('parent-1', children));
  });

  it('blocks processing when active children still exist', () => {
    const children: Array<{ archivedAt?: string; amount: number }> = [
      { archivedAt: '2026-03-19T10:00:00.000Z', amount: -20 },
      { amount: -20 },
      { amount: -20 },
    ];

    assert.throws(
      () => assertNoActiveReturnChildren('parent-1', children),
      ParentAlreadyProcessedError,
    );
  });

  it('undo + reprocess does not duplicate children logically', () => {
    const firstProcess: Array<{ archivedAt?: string; amount: number }> = [
      { archivedAt: '2026-03-19T10:00:00.000Z', amount: -20 },
      { archivedAt: '2026-03-19T10:00:00.000Z', amount: -20 },
      { archivedAt: '2026-03-19T10:00:00.000Z', amount: -20 },
    ];
    const secondProcess: Array<{ archivedAt?: string; amount: number }> = [
      { amount: -20 },
      { amount: -20 },
      { amount: -20 },
    ];

    const combined = [...firstProcess, ...secondProcess];

    assert.equal(getActiveReturnChildren(combined).length, 3);
    assert.equal(combined.length, 6);
    assert.equal(combined.filter((child) => child.archivedAt).length, 3);
  });
});
