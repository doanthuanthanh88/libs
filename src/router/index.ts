import { HttpRequest, HttpResponse } from "uWebSockets.js"
import { Context } from "./Context"
import { jsonParser } from "./bodyparser"
import { logger } from '../logger'
import { parse } from 'querystring'
import { toHttpError, isHttpServerError } from "../error/HttpError"

export type RouterHandle = (ctx: Context, req: HttpRequest) => any | Promise<any>

export async function loadRouter(app: any, routerIndex: { rootPath?: string, routers: any[], middlewares?: RouterHandle[] }) {

  const defaultString = {
    status: ['200', '204'],
    bodyHeader: [
      'content-type', 'application/json', 'text/plain', 'content-encoding', 'gzip', 'content-length', 'vary', 'accept-encoding'
    ],
    cors: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': '*',
      'access-control-allow-headers': '*',
      'access-control-expose-headers': '*',
      'access-control-allow-credentials': 'true'
    }
  }

  const writeHeaders = (res: HttpResponse, headers: object) => {
    for (const k in headers) {
      res.writeHeader(k, headers[k])
    }
  }

  const METHOD = {} as Method

  function responseData(ctx: Context) {
    if (!ctx.error) {
      if (ctx.data !== undefined) {
        ctx.writeStatus(defaultString.status[0])
        if (typeof ctx.data === 'object') {
          ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[1]
          ctx.data = JSON.stringify(ctx.data)
        } else {
          ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[2]
          ctx.data = ctx.data.toString()
        }
        writeHeaders(ctx, ctx.headers)
        ctx.end(ctx.data)
        return
      }
      ctx.writeStatus(defaultString.status[1])
      writeHeaders(ctx, ctx.headers)
      ctx.end()
      return
    }
    ctx.writeStatus(`${ctx.error.statusCode.toString()} ${ctx.error.statusMessage || ''}`)
    writeHeaders(ctx, ctx.headers)
    if (!isHttpServerError(ctx.error)) {
      ctx.end(ctx.error.message)
      return
    }
    ctx.end()
    logger.error({
      ...ctx.error,
      stack: ctx.error.stack,
    }, ctx.error.message)
  }

  for (const method of ['GET    ', 'HEAD   ', 'DEL    ', 'ANY    ', 'POST   ', 'PUT    ', 'PATCH  ', 'OPTIONS']) {
    METHOD[method.trim()] = (path: string, ...routerHandles: RouterHandle[]) => {
      if (routerIndex.rootPath) path = `${routerIndex.rootPath}${path === '/' ? '' : path}`

      logger.debug(` |-- %s %s`, method, path)

      if (routerIndex.middlewares) routerIndex.middlewares = routerHandles.concat(routerIndex.middlewares)
      const len = routerHandles.length
      if (len === 0) routerHandles.push(() => { })

      app[method.trim().toLowerCase()](path, async (ctx: Context, req: HttpRequest) => {
        ctx.onAborted(() => { ctx.aborted = true })
        ctx.headers = {}
        try {
          let i = 0
          let proms
          do {
            proms = routerHandles[i](ctx, req)
            if (proms instanceof Promise) await proms
          } while (++i < len)
        } catch (err) {
          ctx.error = toHttpError(err)
        }

        if (!ctx.aborted) {
          ctx.cork(() => responseData(ctx))
        }
      })
    }
  }

  logger.debug('(*) Routers')
  routerIndex.routers.forEach(r => r.default(METHOD))

}

export function handle(opts = {} as { params?: string[], query?: boolean, body?: BodyParser }) {
  return async (ctx: Context, req: HttpRequest) => {
    if (opts.params) {
      ctx.params = {}
      for (const [i, name] of opts.params.entries()) {
        ctx.params[name] = req.getParameter(i)
      }
    }
    if (opts.query) ctx.query = parse(req.getQuery())
    if (opts.body === BodyParser.JSON) ctx.body = await jsonParser(ctx)
  }
}

export enum BodyParser {
  JSON = 1
}

export type Method = {
  GET(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
  HEAD(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
  DEL(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
  ANY(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
  POST(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
  PUT(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
  PATCH(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
  OPTIONS(path: string, ...routerHandles: RouterHandle[]): void | Promise<void>
}
