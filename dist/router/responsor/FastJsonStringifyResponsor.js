"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastJsonStringify = require("fast-json-stringify");
class FastJsonStringifyResponsor {
    constructor(opts) {
        this.opts = opts;
    }
    prepare(opts) {
        opts.responsorSchema = fastJsonStringify(opts.responsorSchema, Object.assign({}, this.opts, opts.responsorOptions));
    }
    serialize(responsorSchema, data) {
        return responsorSchema(data);
    }
}
exports.FastJsonStringifyResponsor = FastJsonStringifyResponsor;
//# sourceMappingURL=FastJsonStringifyResponsor.js.map