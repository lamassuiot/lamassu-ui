export type QueryParameters = {
    bookmark: string
    filters: string[]
    limit: number
    sortMode: "asc" | "desc"
    sortField: string
}

export interface ListRequest extends QueryParameters { }

export interface ListResponse<T> {
    next: string,
    list: T[]
}
