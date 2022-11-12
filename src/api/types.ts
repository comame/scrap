export type apis = {
    "/notes.get": [empty, empty]
}

export type request<T extends keyof apis> = apis[T][0]
export type response<T extends keyof apis> = apis[T][1]
export type errorResponse<T extends keyof apis> = apis[T][2] extends undefined
    ? "bad_request" | "unauthorized"
    : "bad_request" | "unauthorized" | apis[T][2]

export type note = {
    category: string
    creator: string
    create_date: string
    update_date: string
    tags: string[]
    content: string
}

export type permmission =
    | {
          target: "any"
      }
    | {
          target: "me"
      }
    | {
          target: "select"
          users: string[]
      }

type empty = {}
