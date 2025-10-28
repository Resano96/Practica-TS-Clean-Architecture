type AppErrorType = 'validation' | 'not_found' | 'conflict' | 'infra';
declare abstract class BaseAppError extends Error {
    readonly cause?: unknown | undefined;
    abstract readonly type: AppErrorType;
    protected constructor(message: string, cause?: unknown | undefined);
}
export declare class ValidationError extends BaseAppError {
    readonly type = "validation";
    constructor(message: string, cause?: unknown);
}
export declare class NotFoundError extends BaseAppError {
    readonly type = "not_found";
    constructor(message: string, cause?: unknown);
}
export declare class ConflictError extends BaseAppError {
    readonly type = "conflict";
    constructor(message: string, cause?: unknown);
}
export declare class InfraError extends BaseAppError {
    readonly type = "infra";
    constructor(message: string, cause?: unknown);
}
export type AppError = ValidationError | NotFoundError | ConflictError | InfraError;
export declare const toAppError: (error: unknown, fallback?: string) => AppError;
export {};
