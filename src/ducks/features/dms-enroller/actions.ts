import { createAsyncAction } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { DMS, GetDMSsListAPIResponse } from "./models";

export const actionTypes = {
    GET_DMS_LIST: "GET_DMS_LIST",
    CREATE_DMS: "CREATE_DMS",
    APPROVE_DMS_REQUEST: "APPROVE_DMS_REQUEST",
    DECLINE_DMS_REQUEST: "DECLINE_DMS_REQUEST",
    REVOKE_DMS: "REVOKE_DMS"
};

export type GetDMSsAction = {
    sortMode: "asc" | "desc",
    sortField: string,
    limit: number,
    offset: number,
    filterQuery: Array<string>,
}

export const getDMSListAction = createAsyncAction(
    [actionTypes.GET_DMS_LIST, (req: GetDMSsAction) => req],
    [success(actionTypes.GET_DMS_LIST), (req: GetDMSsListAPIResponse) => { return req; }],
    [failed(actionTypes.GET_DMS_LIST), (req: Error) => req]
)();

export type CreateDMSForm= {
    subject: {
        country: string,
        state: string,
        locality: string,
        organization: string,
        organization_unit: string,
        common_name: string
    },
    key_metadata: {
        type: "RSA" | "EC",
        bits: number
    }
}
export type CreateDMSRequest = {
    dmsName: string
    form: CreateDMSForm
}

export type CreateDMSRequestSuccess = {
    dms: DMS
    priv_key: string
}

export const createDMSWithFormAction = createAsyncAction(
    [actionTypes.CREATE_DMS, (req: CreateDMSRequest) => req],
    [success(actionTypes.CREATE_DMS), (req: CreateDMSRequestSuccess) => req],
    [failed(actionTypes.CREATE_DMS), (req: Error) => req]
)();

export type ApproveDMSRequest = {
    dmsID: string
    status: "APPROVED"
    authorized_cas: Array<string>
}

export const approveDMSRequestAction = createAsyncAction(
    [actionTypes.APPROVE_DMS_REQUEST, (req: ApproveDMSRequest) => req],
    [success(actionTypes.APPROVE_DMS_REQUEST), (req: any) => req],
    [failed(actionTypes.APPROVE_DMS_REQUEST), (req: Error) => req]
)();

export type RevokeDMSRequest = {
    dmsID: string
    status: "REVOKED"
}

export const revokeDMSAction = createAsyncAction(
    [actionTypes.REVOKE_DMS, (req: RevokeDMSRequest) => req],
    [success(actionTypes.REVOKE_DMS), (req: any) => req],
    [failed(actionTypes.REVOKE_DMS), (req: Error) => req]
)();

export type DeclineDMSRequest = {
    dmsID: string
    status: "DENIED"
}

export const declineDMSRequestAction = createAsyncAction(
    [actionTypes.DECLINE_DMS_REQUEST, (req: DeclineDMSRequest) => req],
    [success(actionTypes.DECLINE_DMS_REQUEST), (req: any) => req],
    [failed(actionTypes.DECLINE_DMS_REQUEST), (req: Error) => req]
)();
