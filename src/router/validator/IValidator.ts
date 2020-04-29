import { MethodOptions } from "../method"
import { Context } from "../Context"

export interface IValidator {
  prepare(opts: MethodOptions): void
  validate(opts: any, ctx: Context): void
}
