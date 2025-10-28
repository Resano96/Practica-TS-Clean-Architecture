export const ok = (value) => ({
    ok: true,
    value,
});
export const fail = (error) => ({
    ok: false,
    error,
});
export const isOk = (result) => result.ok;
export const isFail = (result) => !result.ok;
export const unwrap = (result, message = 'Tried to unwrap a failed result') => {
    if (result.ok) {
        return result.value;
    }
    throw new Error(message);
};
export const unwrapOr = (result, fallback) => result.ok ? result.value : fallback;
export const map = (result, mapper) => (result.ok ? ok(mapper(result.value)) : fail(result.error));
export const mapError = (result, mapper) => (result.ok ? result : fail(mapper(result.error)));
//# sourceMappingURL=Result.js.map