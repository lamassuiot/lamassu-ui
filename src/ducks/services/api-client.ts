import AuthService from "auths/AuthService";

interface apiRequestProps {
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: object |Blob,
    query?: string,
    headers?: object,
    controller?: AbortController
}

export const apiRequest = async ({ method = "GET", url, data, headers = {}, controller = new AbortController() }: apiRequestProps) => {
    const token = AuthService.getToken();

    const parseErrorResponse = async (resp: Response) => {
        const msg = "StatusCode=" + resp.status + " " + resp.statusText;
        try {
            const errMsg = await response.json();
            return msg + " " + errMsg.err;
        } catch (error) {
            return msg;
        }
    };

    let body;
    if (data instanceof Blob) {
        body = data;
    } else if (data) {
        body = JSON.stringify(data);
    }

    const response = await fetch(url, {
        method,
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(method === "POST" && { "Content-Type": "application/json" }),
            ...headers
        },
        signal: controller.signal,
        ...(body && { body })
    });

    if (response.status >= 200 && response.status < 300) {
        if (response.headers.has("Content-Type") && response.headers.get("Content-Type")!.includes("application/json")) {
            const json = await response.json();
            return json;
        }

        if (response.headers.has("Content-Type") && response.headers.get("Content-Type")!.includes("application/pkix-crl")) {
            const buffer = await response.blob();
            return buffer;
        }

        if (response.headers.has("Content-Type") && response.headers.get("Content-Type")!.includes("application/octet-stream")) {
            const buffer = await response.blob();
            return buffer;
        }

        const text = await response.text();
        return text;
    }
    throw Error(await parseErrorResponse(response));
};

export type QueryParameters = {
    filters?: string[]
    page?: number
    pageSize?: number
    sortMode?: "asc" | "desc"
    sortField?: string,
    bookmark?: string
}

export interface ListRequest extends QueryParameters { }

export interface ListResponse<T> {
    list: T[]
    next: string
}

export const queryParametersToURL = (params?: QueryParameters): string => {
    if (!params) {
        return "";
    }

    if (params.bookmark && params.bookmark !== "") {
        return "?bookmark=" + params.bookmark;
    }

    const query: string[] = [];

    if (params.sortField !== undefined && params.sortMode !== undefined) {
        query.push(`sort_by=${params.sortField}`);
        query.push(`sort_mode=${params.sortMode}`);
    }

    if (params.page && params.page > 0) {
        query.push(`page=${params.page}`);
    }

    if (params.pageSize && params.pageSize > 0) {
        query.push(`page_size=${params.pageSize}`);
    }

    if (params.filters) {
        params.filters.forEach(f => {
            query.push(`filter=${f}`);
        });
    }

    if (query.length > 0) {
        return "?" + query.join("&");
    }

    return "";
};

export const errorToString = (err: any): string => {
    if (typeof err === "string") {
        return err;
    } else if (err instanceof Error) {
        return err.message;
    } else if (err instanceof Object) {
        return JSON.stringify(err);
    }
    return "";
};

export interface APIServiceInfo{
    build: string,
    build_time: string,
    version: string
}
