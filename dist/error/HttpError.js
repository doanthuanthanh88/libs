"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isHttpError(err) {
    return err.statusCode !== undefined;
}
exports.isHttpError = isHttpError;
function isHttpServerError(err) {
    return err.statusCode === 500;
}
exports.isHttpServerError = isHttpServerError;
function toHttpError(err, data) {
    if (err['statusCode'])
        return err;
    if (err instanceof Error) {
        return {
            ...err,
            statusCode: 500,
            stack: err.stack
        };
    }
    return {
        statusCode: 500,
        message: err?.toString()
    };
}
exports.toHttpError = toHttpError;
function httpError(statusCode, message, data) {
    return Array.isArray(message) ? {
        statusCode,
        statusMessage: message[1],
        message: message[0],
        data
    } : {
        statusCode,
        message,
        data
    };
}
exports.httpError = httpError;
function badRequest(message, data) { return httpError(400, message, data); }
exports.badRequest = badRequest;
function unauthorized(message, data) { return httpError(401, message, data); }
exports.unauthorized = unauthorized;
function paymentRequired(message, data) { return httpError(402, message, data); }
exports.paymentRequired = paymentRequired;
function forbidden(message, data) { return httpError(403, message, data); }
exports.forbidden = forbidden;
function notFound(message, data) { return httpError(404, message, data); }
exports.notFound = notFound;
function methodNotAllowed(message, data) { return httpError(405, message, data); }
exports.methodNotAllowed = methodNotAllowed;
function notAcceptable(message, data) { return httpError(406, message, data); }
exports.notAcceptable = notAcceptable;
function proxyAuthRequired(message, data) { return httpError(407, message, data); }
exports.proxyAuthRequired = proxyAuthRequired;
function clientTimeout(message, data) { return httpError(408, message, data); }
exports.clientTimeout = clientTimeout;
function conflict(message, data) { return httpError(409, message, data); }
exports.conflict = conflict;
function resourceGone(message, data) { return httpError(410, message, data); }
exports.resourceGone = resourceGone;
function lengthRequired(message, data) { return httpError(411, message, data); }
exports.lengthRequired = lengthRequired;
function preconditionFailed(message, data) { return httpError(412, message, data); }
exports.preconditionFailed = preconditionFailed;
function entityTooLarge(message, data) { return httpError(413, message, data); }
exports.entityTooLarge = entityTooLarge;
function uriTooLong(message, data) { return httpError(414, message, data); }
exports.uriTooLong = uriTooLong;
function unsupportedMediaType(message, data) { return httpError(415, message, data); }
exports.unsupportedMediaType = unsupportedMediaType;
function rangeNotSatisfiable(message, data) { return httpError(416, message, data); }
exports.rangeNotSatisfiable = rangeNotSatisfiable;
function expectationFailed(message, data) { return httpError(417, message, data); }
exports.expectationFailed = expectationFailed;
function teapot(message, data) { return httpError(418, message, data); }
exports.teapot = teapot;
function badData(message, data) { return httpError(422, message, data); }
exports.badData = badData;
function locked(message, data) { return httpError(423, message, data); }
exports.locked = locked;
function failedDependency(message, data) { return httpError(424, message, data); }
exports.failedDependency = failedDependency;
function preconditionRequired(message, data) { return httpError(428, message, data); }
exports.preconditionRequired = preconditionRequired;
function tooManyRequests(message, data) { return httpError(429, message, data); }
exports.tooManyRequests = tooManyRequests;
function illegal(message, data) { return httpError(451, message, data); }
exports.illegal = illegal;
function badImplementation(message, data) { return httpError(500, message, data); }
exports.badImplementation = badImplementation;
function internal(message, data) { return httpError(500, message, data); }
exports.internal = internal;
function notImplemented(message, data) { return httpError(501, message, data); }
exports.notImplemented = notImplemented;
function badGateway(message, data) { return httpError(502, message, data); }
exports.badGateway = badGateway;
function serverUnavailable(message, data) { return httpError(503, message, data); }
exports.serverUnavailable = serverUnavailable;
function gatewayTimeout(message, data) { return httpError(504, message, data); }
exports.gatewayTimeout = gatewayTimeout;
//# sourceMappingURL=HttpError.js.map