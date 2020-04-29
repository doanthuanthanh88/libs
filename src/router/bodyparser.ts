import { HttpResponse } from "uWebSockets.js"

export function jsonParser(res: HttpResponse) {
  return new Promise<any>((s, e) => {
    let str = ''
    res.onData((ab, isLast) => {
      str += Buffer.from(ab).toString()
      if (isLast) {
        try {
          s(JSON.parse(str))
        } catch (err) {
          e(err)
        } finally {
          str = null
        }
      }
    })

  })
}
