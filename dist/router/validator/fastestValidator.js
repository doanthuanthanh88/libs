"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpError_1 = require("../../error/HttpError");
const FValidator = require("fastest-validator");
function validator(schema, opts) {
    const fvalidator = new FValidator(opts);
    for (const k in schema) {
        schema[k] = fvalidator.compile(schema[k]);
    }
    return (ctx) => {
        for (const k in schema) {
            const errors = schema[k](ctx[k]);
            if (errors !== true)
                throw HttpError_1.badRequest(errors.map(e => e.message).join('\n'), ctx[k]);
        }
    };
}
exports.validator = validator;
//# sourceMappingURL=fastestValidator.js.map