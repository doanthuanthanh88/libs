import { RouterHandle, BodyParser, RawHandle } from '.'
import * as FastestValidator from 'fastest-validator'
import * as fastJsonStringify from 'fast-json-stringify'

export type Validator = {
  params?: FastestValidator.ValidationSchema | FastestValidator.ValidationSchema[]
  query?: FastestValidator.ValidationSchema | FastestValidator.ValidationSchema[]
  body?: FastestValidator.ValidationSchema | FastestValidator.ValidationSchema[]
}
export type MethodOptions = { query?: boolean, params?: string[], validateSchema?: Validator, bodyParser?: BodyParser, responsorSchema?: fastJsonStringify.Schema, responsorOptions?: fastJsonStringify.Options, rawHandler?: RawHandle, prepare?: () => Promise<void> | void } & { [key: string]: any }

export type Method = {

  GET(path: string, routerHandle: RouterHandle): void | Promise<void>
  GET(path: string, opts: MethodOptions, routerHandle: RouterHandle): void | Promise<void>

  HEAD(path: string, routerHandle: RouterHandle): void | Promise<void>
  HEAD(path: string, opts: MethodOptions, routerHandle: RouterHandle): void | Promise<void>

  DEL(path: string, routerHandle: RouterHandle): void | Promise<void>
  DEL(path: string, opts: MethodOptions, routerHandle: RouterHandle): void | Promise<void>

  ANY(path: string, routerHandle: RouterHandle): void | Promise<void>
  ANY(path: string, opts: MethodOptions, routerHandle: RouterHandle): void | Promise<void>

  POST(path: string, routerHandle: RouterHandle): void | Promise<void>
  POST(path: string, opts: MethodOptions, routerHandle: RouterHandle): void | Promise<void>

  PUT(path: string, routerHandle: RouterHandle): void | Promise<void>
  PUT(path: string, opts: MethodOptions, routerHandle: RouterHandle): void | Promise<void>

  PATCH(path: string, routerHandle: RouterHandle): void | Promise<void>
  PATCH(path: string, opts: MethodOptions, routerHandle: RouterHandle): void | Promise<void>

  OPTIONS(path: string, routerHandle: RouterHandle): void | Promise<void>

}
