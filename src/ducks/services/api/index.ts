import { map } from "rxjs/operators";
import { from as rxjsFrom } from "rxjs";
import { failed, success } from "ducks/actionTypes";
import { getToken } from "./token";
import { QueryParameters } from "ducks/models";

export const queryParametersToURL = (params: QueryParameters): string => {
    if (params.bookmark !== "") {
        return "?bookmark=" + params.bookmark;
    }

    const query: string[] = [];
    if (params.sortField !== "") {
        query.push(`sort_by=${params.sortField}`);
        query.push(`sort_mode=${params.sortMode}`);
    }

    if (params.limit > 0) {
        query.push(`page_size=${params.limit}`);
    }

    params.filters.forEach(f => {
        query.push(`filter=${f}`);
    });

    return "?" + query.join("&");
};

interface apiRequestProps {
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: object,
    query?: string,
    headers?: object
}

export const apiRequest = async ({ method = "GET", url, data, query, headers = {} }: apiRequestProps) => {
    const token = getToken();

    // await new Promise(r => setTimeout(r, 2000));
    console.log(Date.now(), method, url);
    if (query) {
        url = url + "?" + data;
    }

    const parseErrorResponse = async (resp: Response) => {
        try {
            let msg = "StatusCode: " + resp.status + " " + resp.statusText + ". ";
            const errMsg = await resp.text();
            msg = msg + " " + errMsg;
            return msg;
        } catch (error) {
            console.log(error);
            return "";
        }
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                Authorization: "Bearer " + token,
                ...(method === "POST" && { "Content-Type": "application/json" }),
                ...headers
            },
            ...({ body: JSON.stringify(data) })
        });
        // OR you can do this
        if (response.status >= 200 && response.status < 300) {
            if (response.headers.has("Content-Type") && response.headers.get("Content-Type")!.includes("application/json")) {
                const json = await response.json();
                return json;
            }

            const text = await response.text();
            return text;
        }
        throw Error(await parseErrorResponse(response));
    } catch (e: any) {
        if (e instanceof TypeError) {
            throw new Error(e.message);
        } else {
            throw e;
        }
    }
};

export const makeRequestWithActions = (fetchPromise: Promise<any>, actionType: string, meta = {}) =>
    rxjsFrom(fetchPromise).pipe(
        map((data) => {
            // console.log(data && !data.error);
            if (data && !data.error) {
                return {
                    type: success(actionType),
                    payload: data.json,
                    meta
                };
            }
            return {
                type: failed(actionType),
                payload: data.error,
                meta
            };
        })
    );

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
