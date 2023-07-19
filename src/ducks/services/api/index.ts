import { map } from "rxjs/operators";
import { from as rxjsFrom } from "rxjs";
import { failed, success } from "ducks/actionTypes";
import { getToken } from "./token";

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
            let msg = "StatusCode=" + resp.status + " " + resp.statusText;
            const errMsg = await response.text();
            msg = msg + " " + errMsg;
            return msg;
        } catch (error) {
            console.log(error);
            return "";
        }
    };

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
        console.log("no JSOn");

        const text = await response.text();
        return text;
    }
    throw Error(await parseErrorResponse(response));
};

export const makeRequestWithActions = (fetchPromise: Promise<any>, actionType: string, meta = {}) =>
    rxjsFrom(fetchPromise).pipe(
        map((data) => {
            console.log(data);
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
