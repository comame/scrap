import { useState } from "react"
import { apis, errorResponse, request, response } from "./types"

export async function fetchApi<T extends keyof apis>(
    endpoint: T,
    body: request<T>
): Promise<
    | {
          data: response<T>
      }
    | {
          error: errorResponse<T>
      }
> {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body }),
    }).then((res) => res.json())
    if ("error" in res) {
        return {
            error: res.error,
        }
    } else {
        return { data: res }
    }
}

const successResponses: Map<string, any> = new Map()
const errorResponses: Map<string, any> = new Map()

export function useSuspendApi<T extends keyof apis>(
    endpoint: T,
    body: request<T>,
    key: string = endpoint
):
    | {
          data: response<T>
          mutate: () => void
      }
    | { error: errorResponse<T>; mutate: () => void } {
    const fetcher = (body: any = {}) =>
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...body }),
        })
            .then((res) => res.json())
            .then((json) => {
                if ("error" in json) {
                    errorResponses.set(key, json.error)
                } else {
                    successResponses.set(key, json)
                }
            })

    const cached = successResponses.get(key)
    const error = errorResponses.get(key)

    const [_s, update] = useState(false)
    const mutate = () => {
        successResponses.delete(key)
        errorResponses.delete(key)
        update((v) => !v)
    }

    if (cached) {
        return {
            data: cached,
            mutate,
        }
    } else if (error) {
        return {
            error,
            mutate,
        }
    } else {
        throw fetcher(body)
    }
}

const mocks: {
    [T in keyof apis]: response<T>
} = {
    "/notes.get": {
        value: {
            id: "test",
            category: "category",
            creator: "comame",
            create_date: "2022-11-13",
            update_date: "2022-11-13",
            can_read: { target: "any" },
            can_write: { target: "me" },
            tags: [ ],
            title: "メモです",
            content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n".repeat(
                    5
                ),
        },
    },
    "/tags.all": {
        value: ["blog", "network", "Kubernetes"],
    },
}

export function _useSuspendApi<T extends keyof apis>(
    endpoint: T,
    _body: request<T>,
    _key: string = endpoint
):
    | {
          data: response<T>
          mutate: () => void
      }
    | { error: errorResponse<T>; mutate: () => void } {
    return {
        data: mocks[endpoint],
        mutate: () => {},
    }
}
