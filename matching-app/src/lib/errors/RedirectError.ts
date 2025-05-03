export class RedirectError extends Error {
  path: string;

  constructor(path: string, message?: string) {
    super(message || `リダイレクトを実行: ${path}`);
    this.name = 'RedirectError';
    this.path = path;
  }
}

export function isRedirectError(error: unknown): error is RedirectError {
  return error instanceof RedirectError;
}
