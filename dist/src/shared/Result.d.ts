export type Ok<T> = {
    ok: true;
    value: T;
};
export type Fail<E> = {
    ok: false;
    error: E;
};
export type Result<T, E> = Ok<T> | Fail<E>;
export declare const ok: <T>(value: T) => Result<T, never>;
export declare const fail: <E>(error: E) => Result<never, E>;
export declare const isOk: <T, E>(result: Result<T, E>) => result is Ok<T>;
export declare const isFail: <T, E>(result: Result<T, E>) => result is Fail<E>;
export declare const unwrap: <T, E>(result: Result<T, E>, message?: string) => T;
export declare const unwrapOr: <T, E>(result: Result<T, E>, fallback: T) => T;
export declare const map: <T, E, U>(result: Result<T, E>, mapper: (value: T) => U) => Result<U, E>;
export declare const mapError: <T, E, F>(result: Result<T, E>, mapper: (error: E) => F) => Result<T, F>;
