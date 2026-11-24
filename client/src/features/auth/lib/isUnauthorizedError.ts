export function isUnauthorizedError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'status' in error && error.status === 401;
}
