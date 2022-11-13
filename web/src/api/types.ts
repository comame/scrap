export type apis = {
    "/notes.get": [notesGetRequest, notesGetResponse]
    "/tags.all": [empty, tagsAllResponse]
}

type empty = {}

export type request<T extends keyof apis> = apis[T][0]
export type response<T extends keyof apis> = apis[T][1]
export type errorResponse<T extends keyof apis> = apis[T][2] extends undefined
    ? "bad_request" | "unauthorized"
    : "bad_request" | "unauthorized" | apis[T][2]

export type note = {
    id: string
    category: string
    creator: string
    create_date: string
    update_date: string
    can_read: permission
    can_write: permission
    tags: string[]
    title: string
    content: string
}

export type noteMetadata = Pick<
    note,
    | "category"
    | "creator"
    | "create_date"
    | "update_date"
    | "can_read"
    | "can_write"
    | "tags"
>

export type permission =
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

type notesGetRequest = {
    id: string
}

type notesGetResponse = {
    value: note
}

type tagsAllResponse = {
    value: string[]
}
