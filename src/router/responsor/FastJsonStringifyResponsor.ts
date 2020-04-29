import * as fastJsonStringify from 'fast-json-stringify'
import { IResponsor } from './IResponsor'
import { MethodOptions } from '../method'
import { Context } from '../Context'

export class FastJsonStringifyResponsor implements IResponsor {

  constructor(private opts?: fastJsonStringify.Options) { }

  prepare(opts: MethodOptions) {
    opts.responsorSchema = fastJsonStringify(opts.responsorSchema, Object.assign({}, this.opts, opts.responsorOptions)) as any
  }

  serialize(responsorSchema: any, data: any): any {
    return responsorSchema(data)
  }
}