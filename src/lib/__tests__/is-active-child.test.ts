import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  countActiveRemittanceChildren,
  filterActiveRemittanceChildren,
  isActiveRemittanceChild,
} from '../remittances/is-active-child';

describe('isActiveRemittanceChild', () => {
  it('treats null and undefined archivedAt as active', () => {
    assert.equal(isActiveRemittanceChild({ archivedAt: null }), true);
    assert.equal(isActiveRemittanceChild({}), true);
  });

  it('treats populated archivedAt as inactive', () => {
    assert.equal(isActiveRemittanceChild({ archivedAt: '2026-03-12T07:36:22.594Z' }), false);
  });
});

describe('filterActiveRemittanceChildren', () => {
  it('keeps only active children', () => {
    const children = [
      { id: 'active-null', archivedAt: null },
      { id: 'active-missing' },
      { id: 'archived', archivedAt: '2026-03-12T07:36:22.594Z' },
    ];

    assert.deepEqual(
      filterActiveRemittanceChildren(children).map((child) => child.id),
      ['active-null', 'active-missing'],
    );
  });

  it('leaves zero active children after undo archives them', () => {
    const archivedChildren = [
      { id: 'child-1', archivedAt: '2026-03-12T07:36:22.594Z' },
      { id: 'child-2', archivedAt: '2026-03-12T07:36:22.594Z' },
    ];

    assert.deepEqual(filterActiveRemittanceChildren(archivedChildren), []);
    assert.equal(countActiveRemittanceChildren(archivedChildren), 0);
  });
});
