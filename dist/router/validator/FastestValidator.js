"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FValidator = require("fastest-validator");
const HttpError_1 = require("../../error/HttpError");
class FastestValidator {
    constructor(opts) {
        this.validator = new FValidator();
        this.validator = new FValidator(opts);
    }
    prepare(opts) {
        for (const k in opts.validateSchema) {
            opts.validateSchema[k] = this.validator.compile(opts.validateSchema[k]);
        }
    }
    validate(validate, ctx) {
        for (const k in validate) {
            const errors = validate[k](ctx[k]);
            if (errors !== true)
                throw HttpError_1.badRequest(errors.map(e => e.message).join('\n'), ctx[k]);
        }
    }
}
exports.FastestValidator = FastestValidator;
//# sourceMappingURL=FastestValidator.js.map