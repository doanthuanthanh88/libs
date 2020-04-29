import { HttpRequest, HttpResponse } from "uWebSockets.js"
import { Context } from "@/router/Context"
import { jsonParser } from "./bodyparser"
import { logger } from '../logger'
import { MethodOptions, Method } from "./method"
import { toHttpError, isHttpServerError, HttpError } from "@/error/HttpError"
import { IResponsor } from "./responsor/IResponsor"
import { IValidator } from "./validator/IValidator"
import { parse } from 'querystring'
import { gzipSync, ZlibOptions } from 'zlib'

export type RouterHandle = (ctx: Context, req: HttpRequest) => any | Promise<any>
export type RawHandle = (res: HttpResponse, req: HttpRequest) => any | Promise<any>
export type GZip = ZlibOptions & { threshold: number }
export enum BodyParser {
  JSON = 1
}

export async function loadRouter(app: any, routerIndex: { gzip?: GZip, rootPath?: string, routers: any[], cors?: boolean, validator?: IValidator, responsor?: IResponsor }) {
  const { validator, responsor, rootPath, gzip, cors, routers } = routerIndex

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

  const handleParams = (req: HttpRequest, params: string[]) => {
    const obj = {}
    for (const [i, name] of params.entries()) {
      obj[name] = req.getParameter(i)
    }
    return obj
  }

  const METHOD = {} as Method

  for (const method of ['GET', 'HEAD', 'DEL', 'ANY', 'POST', 'PUT', 'PATCH', 'OPTIONS']) {
    METHOD[method] = (path: string, opts = {} as MethodOptions, routerHandle?: RouterHandle) => {
      if (rootPath) path = `${rootPath}${path === '/' ? '' : path}`
      if (!routerHandle) {
        routerHandle = opts as RouterHandle
        opts = {}
      } else {
        if (!validator) opts.validateSchema = undefined
        else if (opts.validateSchema) validator.prepare(opts)

        if (!responsor) opts.responsorSchema = undefined
        else if (opts.responsorSchema) responsor.prepare(opts)
      }

      const { query, params, bodyParser, validateSchema, responsorSchema } = opts
      const threshold = gzip?.threshold

      if (opts.prepare) opts.prepare()

      logger.debug(` |-- %s\t%s`, method, path)
      app[method.toLowerCase()](path, async (ctx: Context, req: HttpRequest) => {
        ctx.onAborted(() => { ctx.aborted = true })

        try {
          if (opts.rawHandler) await opts.rawHandler(ctx, req)

          ctx.headers = !cors ? {} : defaultString.cors
          if (query) ctx.query = parse(req.getQuery())
          if (params) ctx.params = handleParams(req, params)

          if (bodyParser === BodyParser.JSON) ctx.body = await jsonParser(ctx)

          if (validateSchema) validator.validate(validateSchema, ctx)

          ctx.data = await routerHandle(ctx, req)

        } catch (err) {
          ctx.error = toHttpError(err)
        }

        if (!ctx.aborted) {
          ctx.cork(() => {
            if (!ctx.error) {
              if (ctx.data !== undefined) {
                ctx.writeStatus(defaultString.status[0])
                if (typeof ctx.data === 'object') {
                  ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[1]
                  ctx.data = !responsorSchema ? JSON.stringify(ctx.data) : responsor.serialize(responsorSchema, ctx.data)
                } else {
                  ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[2]
                  ctx.data = ctx.data.toString()
                }
                if (!threshold || Buffer.byteLength(ctx.data) < threshold) {
                  writeHeaders(ctx, ctx.headers)
                  ctx.end(ctx.data)
                  return
                }
                ctx.headers[defaultString.bodyHeader[6]] = defaultString.bodyHeader[7]
                ctx.headers[defaultString.bodyHeader[3]] = defaultString.bodyHeader[4]
                writeHeaders(ctx, ctx.headers)
                ctx.end(gzipSync(ctx.data, gzip))
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
          })
        }
      })
    }
  }

  if (cors) {
    logger.debug('(*) Enabled CORs')
    // tslint:disable-next-line: no-empty
    METHOD.OPTIONS('/*', () => { })
  }

  if (gzip) logger.debug('(*) Enabled GZip')

  logger.debug('(*) Routers')
  routers.forEach(r => r.default(METHOD))

}
