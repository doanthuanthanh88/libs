"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyparser_1 = require("./bodyparser");
const logger_1 = require("../logger");
const HttpError_1 = require("./../error/HttpError");
const querystring_1 = require("querystring");
const zlib_1 = require("zlib");
var BodyParser;
(function (BodyParser) {
    BodyParser[BodyParser["JSON"] = 1] = "JSON";
})(BodyParser = exports.BodyParser || (exports.BodyParser = {}));
async function loadRouter(app, routerIndex) {
    const { validator, responsor, rootPath, gzip, cors, routers } = routerIndex;
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
    };
    const writeHeaders = (res, headers) => {
        for (const k in headers) {
            res.writeHeader(k, headers[k]);
        }
    };
    const handleParams = (req, params) => {
        const obj = {};
        for (const [i, name] of params.entries()) {
            obj[name] = req.getParameter(i);
        }
        return obj;
    };
    const METHOD = {};
    for (const method of ['GET', 'HEAD', 'DEL', 'ANY', 'POST', 'PUT', 'PATCH', 'OPTIONS']) {
        METHOD[method] = (path, opts = {}, routerHandle) => {
            if (rootPath)
                path = `${rootPath}${path === '/' ? '' : path}`;
            if (!routerHandle) {
                routerHandle = opts;
                opts = {};
            }
            else {
                if (!validator)
                    opts.validateSchema = undefined;
                else if (opts.validateSchema)
                    validator.prepare(opts);
                if (!responsor)
                    opts.responsorSchema = undefined;
                else if (opts.responsorSchema)
                    responsor.prepare(opts);
            }
            const { query, params, bodyParser, validateSchema, responsorSchema } = opts;
            const threshold = gzip?.threshold;
            if (opts.prepare)
                opts.prepare();
            logger_1.logger.debug(` |-- %s\t%s`, method, path);
            app[method.toLowerCase()](path, async (ctx, req) => {
                ctx.onAborted(() => { ctx.aborted = true; });
                try {
                    if (opts.rawHandler)
                        await opts.rawHandler(ctx, req);
                    ctx.headers = !cors ? {} : defaultString.cors;
                    if (query)
                        ctx.query = querystring_1.parse(req.getQuery());
                    if (params)
                        ctx.params = handleParams(req, params);
                    if (bodyParser === BodyParser.JSON)
                        ctx.body = await bodyparser_1.jsonParser(ctx);
                    if (validateSchema)
                        validator.validate(validateSchema, ctx);
                    ctx.data = await routerHandle(ctx, req);
                }
                catch (err) {
                    ctx.error = HttpError_1.toHttpError(err);
                }
                if (!ctx.aborted) {
                    ctx.cork(() => {
                        if (!ctx.error) {
                            if (ctx.data !== undefined) {
                                ctx.writeStatus(defaultString.status[0]);
                                if (typeof ctx.data === 'object') {
                                    ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[1];
                                    ctx.data = !responsorSchema ? JSON.stringify(ctx.data) : responsor.serialize(responsorSchema, ctx.data);
                                }
                                else {
                                    ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[2];
                                    ctx.data = ctx.data.toString();
                                }
                                if (!threshold || Buffer.byteLength(ctx.data) < threshold) {
                                    writeHeaders(ctx, ctx.headers);
                                    ctx.end(ctx.data);
                                    return;
                                }
                                ctx.headers[defaultString.bodyHeader[6]] = defaultString.bodyHeader[7];
                                ctx.headers[defaultString.bodyHeader[3]] = defaultString.bodyHeader[4];
                                writeHeaders(ctx, ctx.headers);
                                ctx.end(zlib_1.gzipSync(ctx.data, gzip));
                                return;
                            }
                            ctx.writeStatus(defaultString.status[1]);
                            writeHeaders(ctx, ctx.headers);
                            ctx.end();
                            return;
                        }
                        ctx.writeStatus(`${ctx.error.statusCode.toString()} ${ctx.error.statusMessage || ''}`);
                        writeHeaders(ctx, ctx.headers);
                        if (!HttpError_1.isHttpServerError(ctx.error)) {
                            ctx.end(ctx.error.message);
                            return;
                        }
                        ctx.end();
                        logger_1.logger.error({
                            ...ctx.error,
                            stack: ctx.error.stack,
                        }, ctx.error.message);
                    });
                }
            });
        };
    }
    if (cors) {
        logger_1.logger.debug('(*) Enabled CORs');
        METHOD.OPTIONS('/*', () => { });
    }
    if (gzip)
        logger_1.logger.debug('(*) Enabled GZip');
    logger_1.logger.debug('(*) Routers');
    routers.forEach(r => r.default(METHOD));
}
exports.loadRouter = loadRouter;
//# sourceMappingURL=index.js.map