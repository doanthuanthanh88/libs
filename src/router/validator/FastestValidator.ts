import { MethodOptions } from "@/router/method"
import * as FValidator from 'fastest-validator'
import { badRequest } from "@/error/HttpError"
import { IValidator } from "./IValidator"
import { Context } from "../Context"


export class FastestValidator implements IValidator {
  private validator = new (FValidator as any)()

  constructor(opts?: {
    debug?: boolean,
    messages?: FValidator.MessagesType,
  }) {
    this.validator = new (FValidator as any)(opts)
  }

  prepare(opts: MethodOptions) {
    for (const k in opts.validateSchema) {
      opts.validateSchema[k] = this.validator.compile(opts.validateSchema[k])
    }
  }

  validate(validate: any, ctx: Context) {
    for (const k in validate) {
      const errors = validate[k](ctx[k])
      if (errors !== true) throw badRequest(errors.map(e => e.message).join('\n'), ctx[k])
    }
  }
}
