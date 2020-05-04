import { Context } from "../Context"
import { badRequest } from "../../error/HttpError"
import * as FValidator from 'fastest-validator'
import * as FastestValidator from 'fastest-validator'

export type Validator = {
  params?: FastestValidator.ValidationSchema | FastestValidator.ValidationSchema[]
  query?: FastestValidator.ValidationSchema | FastestValidator.ValidationSchema[]
  body?: FastestValidator.ValidationSchema | FastestValidator.ValidationSchema[]
}

export function validator(schema: Validator, opts?: {
  debug?: boolean,
  messages?: FValidator.MessagesType,
}) {
  const fvalidator = new (FValidator as any)(opts)

  for (const k in schema) {
    schema[k] = fvalidator.compile(schema[k])
  }
  return (ctx: Context) => {
    for (const k in schema) {
      const errors = schema[k](ctx[k])
      if (errors !== true) throw badRequest(errors.map(e => e.message).join('\n'), ctx[k])
    }
  }
}
