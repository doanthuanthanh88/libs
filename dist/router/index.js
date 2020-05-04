"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyparser_1 = require("./bodyparser");
const logger_1 = require("../logger");
const querystring_1 = require("querystring");
const HttpError_1 = require("../error/HttpError");
async function loadRouter(app, routerIndex) {
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
    const METHOD = {};
    function responseData(ctx) {
        if (!ctx.error) {
            if (ctx.data !== undefined) {
                ctx.writeStatus(defaultString.status[0]);
                if (typeof ctx.data === 'object') {
                    ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[1];
                    ctx.data = JSON.stringify(ctx.data);
                }
                else {
                    ctx.headers[defaultString.bodyHeader[0]] = defaultString.bodyHeader[2];
                    ctx.data = ctx.data.toString();
                }
                writeHeaders(ctx, ctx.headers);
                ctx.end(ctx.data);
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
    }
    for (const method of ['GET    ', 'HEAD   ', 'DEL    ', 'ANY    ', 'POST   ', 'PUT    ', 'PATCH  ', 'OPTIONS']) {
        METHOD[method.trim()] = (path, ...routerHandles) => {
            if (routerIndex.rootPath)
                path = `${routerIndex.rootPath}${path === '/' ? '' : path}`;
            logger_1.logger.debug(` |-- %s %s`, method, path);
            if (routerIndex.middlewares)
                routerIndex.middlewares = routerHandles.concat(routerIndex.middlewares);
            const len = routerHandles.length;
            if (len === 0)
                routerHandles.push(() => { });
            app[method.trim().toLowerCase()](path, async (ctx, req) => {
                ctx.onAborted(() => { ctx.aborted = true; });
                ctx.headers = {};
                try {
                    let i = 0;
                    let proms;
                    do {
                        proms = routerHandles[i](ctx, req);
                        if (proms instanceof Promise)
                            await proms;
                    } while (++i < len);
                }
                catch (err) {
                    ctx.error = HttpError_1.toHttpError(err);
                }
                if (!ctx.aborted) {
                    ctx.cork(() => responseData(ctx));
                }
            });
        };
    }
    logger_1.logger.debug('(*) Routers');
    routerIndex.routers.forEach(r => r.default(METHOD));
}
exports.loadRouter = loadRouter;
function handle(opts = {}) {
    return async (ctx, req) => {
        if (opts.params) {
            ctx.params = {};
            for (const [i, name] of opts.params.entries()) {
                ctx.params[name] = req.getParameter(i);
            }
        }
        if (opts.query)
            ctx.query = querystring_1.parse(req.getQuery());
        if (opts.body === BodyParser.JSON)
            ctx.body = await bodyparser_1.jsonParser(ctx);
    };
}
exports.handle = handle;
var BodyParser;
(function (BodyParser) {
    BodyParser[BodyParser["JSON"] = 1] = "JSON";
})(BodyParser = exports.BodyParser || (exports.BodyParser = {}));
//# sourceMappingURL=index.js.map