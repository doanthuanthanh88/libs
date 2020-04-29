import { MethodOptions } from "../method"
import { Context } from "../Context"

export interface IResponsor {
  prepare(opts: MethodOptions): void
  serialize(opts: any, ctx: any): any
}
