"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jsonParser(res) {
    return new Promise((s, e) => {
        let str = '';
        res.onData((ab, isLast) => {
            str += Buffer.from(ab).toString();
            if (isLast) {
                try {
                    s(JSON.parse(str));
                }
                catch (err) {
                    e(err);
                }
                finally {
                    str = null;
                }
            }
        });
    });
}
exports.jsonParser = jsonParser;
//# sourceMappingURL=bodyparser.js.map