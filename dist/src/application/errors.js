class BaseAppError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
    }
}
export class ValidationError extends BaseAppError {
    type = 'validation';
    constructor(message, cause) {
        super(message, cause);
    }
}
export class NotFoundError extends BaseAppError {
    type = 'not_found';
    constructor(message, cause) {
        super(message, cause);
    }
}
export class ConflictError extends BaseAppError {
    type = 'conflict';
    constructor(message, cause) {
        super(message, cause);
    }
}
export class InfraError extends BaseAppError {
    type = 'infra';
    constructor(message, cause) {
        super(message, cause);
    }
}
export const toAppError = (error, fallback = 'Unexpected error') => {
    if (error instanceof BaseAppError) {
        return error;
    }
    if (error instanceof Error) {
        return new InfraError(error.message, error);
    }
    return new InfraError(fallback, error);
};
//# sourceMappingURL=errors.js.map