export type Ok<T> = {
  ok: true;
  value: T;
};

export type Fail<E> = {
  ok: false;
  error: E;
};

export type Result<T, E> = Ok<T> | Fail<E>;

export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const fail = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result.ok;

export const isFail = <T, E>(result: Result<T, E>): result is Fail<E> =>
  !result.ok;

export const unwrap = <T, E>(
  result: Result<T, E>,
  message = 'Tried to unwrap a failed result',
): T => {
  if (result.ok) {
    return result.value;
  }

  throw new Error(message);
};

export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T =>
  result.ok ? result.value : fallback;

export const map = <T, E, U>(
  result: Result<T, E>,
  mapper: (value: T) => U,
): Result<U, E> => (result.ok ? ok(mapper(result.value)) : fail(result.error));

export const mapError = <T, E, F>(
  result: Result<T, E>,
  mapper: (error: E) => F,
): Result<T, F> => (result.ok ? result : fail(mapper(result.error)));
