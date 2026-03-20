export interface ReturnChildLike {
  archivedAt?: unknown;
}

export class ParentAlreadyProcessedError extends Error {
  constructor(parentTransactionId: string) {
    super(`Parent already processed: ${parentTransactionId}`);
    this.name = 'ParentAlreadyProcessedError';
  }
}

export function getActiveReturnChildren<T extends ReturnChildLike>(
  children: T[]
): T[] {
  return children.filter((child) => !child.archivedAt);
}

export function assertNoActiveReturnChildren<T extends ReturnChildLike>(
  parentTransactionId: string,
  children: T[]
): void {
  if (getActiveReturnChildren(children).length > 0) {
    throw new ParentAlreadyProcessedError(parentTransactionId);
  }
}
