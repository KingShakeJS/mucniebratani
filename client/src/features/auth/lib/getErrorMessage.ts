function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const FALLBACK_MESSAGE = 'Что-то пошло не так. Попробуйте ещё раз.';

export function getErrorMessage(error: unknown): string {
  if (!isRecord(error)) {
    return FALLBACK_MESSAGE;
  }

  const data = 'data' in error ? error.data : error;

  if (!isRecord(data)) {
    return 'error' in error && typeof error.error === 'string' ? error.error : FALLBACK_MESSAGE;
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  if (Array.isArray(data.errors)) {
    const [firstError] = data.errors;

    if (isRecord(firstError) && typeof firstError.message === 'string') {
      return firstError.message;
    }
  }

  return FALLBACK_MESSAGE;
}
