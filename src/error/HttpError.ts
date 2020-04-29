export type HttpError = {
  statusCode: number
  statusMessage?: string
  message?: string
  data?: any
  stack?: string
}

export function isHttpError(err: any) {
  return err.statusCode !== undefined
}

export function isHttpServerError(err: any) {
  return err.statusCode === 500
}

export function toHttpError(err: Error | HttpError | string, data?: any): HttpError {
  // tslint:disable-next-line: no-string-literal
  if (err['statusCode']) return err as HttpError
  if (err instanceof Error) {
    return {
      ...err,
      statusCode: 500,
      stack: err.stack
    }
  }
  return {
    statusCode: 500,
    message: err?.toString()
  }
}

export function httpError(statusCode: number, message?: string | string[], data?: any) {
  return Array.isArray(message) ? {
    statusCode,
    statusMessage: message[1],
    message: message[0],
    data
  } : {
    statusCode,
    message,
    data
  } as HttpError
}

export function badRequest(message?: string | string[], data?: any) { return httpError(400, message, data) }

export function unauthorized(message?: string | string[], data?: any) { return httpError(401, message, data) }

export function paymentRequired(message?: string | string[], data?: any) { return httpError(402, message, data) }

export function forbidden(message?: string | string[], data?: any) { return httpError(403, message, data) }

export function notFound(message?: string | string[], data?: any) { return httpError(404, message, data) }

export function methodNotAllowed(message?: string | string[], data?: any) { return httpError(405, message, data) }

export function notAcceptable(message?: string | string[], data?: any) { return httpError(406, message, data) }

export function proxyAuthRequired(message?: string | string[], data?: any) { return httpError(407, message, data) }

export function clientTimeout(message?: string | string[], data?: any) { return httpError(408, message, data) }

export function conflict(message?: string | string[], data?: any) { return httpError(409, message, data) }

export function resourceGone(message?: string | string[], data?: any) { return httpError(410, message, data) }

export function lengthRequired(message?: string | string[], data?: any) { return httpError(411, message, data) }

export function preconditionFailed(message?: string | string[], data?: any) { return httpError(412, message, data) }

export function entityTooLarge(message?: string | string[], data?: any) { return httpError(413, message, data) }

export function uriTooLong(message?: string | string[], data?: any) { return httpError(414, message, data) }

export function unsupportedMediaType(message?: string | string[], data?: any) { return httpError(415, message, data) }

export function rangeNotSatisfiable(message?: string | string[], data?: any) { return httpError(416, message, data) }

export function expectationFailed(message?: string | string[], data?: any) { return httpError(417, message, data) }

export function teapot(message?: string | string[], data?: any) { return httpError(418, message, data) }

export function badData(message?: string | string[], data?: any) { return httpError(422, message, data) }

export function locked(message?: string | string[], data?: any) { return httpError(423, message, data) }

export function failedDependency(message?: string | string[], data?: any) { return httpError(424, message, data) }

export function preconditionRequired(message?: string | string[], data?: any) { return httpError(428, message, data) }

export function tooManyRequests(message?: string | string[], data?: any) { return httpError(429, message, data) }

export function illegal(message?: string | string[], data?: any) { return httpError(451, message, data) }

export function badImplementation(message?: string | string[], data?: any) { return httpError(500, message, data) }

export function internal(message?: string | string[], data?: any) { return httpError(500, message, data) }

export function notImplemented(message?: string | string[], data?: any) { return httpError(501, message, data) }

export function badGateway(message?: string | string[], data?: any) { return httpError(502, message, data) }

export function serverUnavailable(message?: string | string[], data?: any) { return httpError(503, message, data) }

export function gatewayTimeout(message?: string | string[], data?: any) { return httpError(504, message, data) }