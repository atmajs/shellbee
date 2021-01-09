export function serialize_error (err: Error) {
    return {
        message: err.message ?? String(err),
        stack: err.stack
    };
}
