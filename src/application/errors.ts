type AppErrorType = 'validation' | 'not_found' | 'conflict' | 'infra';

abstract class BaseAppError extends Error {
  abstract readonly type: AppErrorType;

  protected constructor(message: string, public readonly cause?: unknown) {
    super(message);
  }
}

export class ValidationError extends BaseAppError {
  readonly type = 'validation';

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class NotFoundError extends BaseAppError {
  readonly type = 'not_found';

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class ConflictError extends BaseAppError {
  readonly type = 'conflict';

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class InfraError extends BaseAppError {
  readonly type = 'infra';

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export type AppError =
  | ValidationError
  | NotFoundError
  | ConflictError
  | InfraError;

export const toAppError = (error: unknown, fallback = 'Unexpected error'): AppError => {
  if (error instanceof BaseAppError) {
    return error;
  }

  if (error instanceof Error) {
    return new InfraError(error.message, error);
  }

  return new InfraError(fallback, error);
};
