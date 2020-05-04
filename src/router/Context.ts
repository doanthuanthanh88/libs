import { HttpResponse } from "uWebSockets.js"

export interface Context<B = any> extends HttpResponse {
  // req: HttpRequest
  // res: HttpResponse
  // error: HttpError
  // data: any
  // state: any
  body?: B
  query?: { [key: string]: any }
  params?: { [key: string]: any }
  headers: { [key: string]: any }
}
