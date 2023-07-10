import { createAsyncAction } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { DMS, DMSManagerInfo, GetDMSsListAPIResponse } from "./models";

export const actionTypes = {
    GET_INFO_DMS_MANAGER_API: "GET_INFO_DMS_MANAGER_API",
    GET_DMS: "GET_DMS",
    GET_DMS_LIST: "GET_DMS_LIST",
    CREATE_DMS: "CREATE_DMS",
    APPROVE_DMS_REQUEST: "APPROVE_DMS_REQUEST",
    DECLINE_DMS_REQUEST: "DECLINE_DMS_REQUEST",
    REVOKE_DMS: "REVOKE_DMS",
    UPDATE_AUTHORIZE_CAS: "UPDATE_AUTHORIZE_CAS"
};

export const getInfoAction = createAsyncAction(
    [actionTypes.GET_INFO_DMS_MANAGER_API, () => { }],
    [success(actionTypes.GET_INFO_DMS_MANAGER_API), (req: DMSManagerInfo) => req],
    [failed(actionTypes.GET_INFO_DMS_MANAGER_API), (req: Error) => req]
)();
export type GetDMSAction = {name: string}

export const getDMSAction = createAsyncAction(
    [actionTypes.GET_DMS, (req: GetDMSAction) => req],
    [success(actionTypes.GET_DMS), (req: DMS) => { return req; }],
    [failed(actionTypes.GET_DMS), (req: Error) => req]
)();

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

export type CreateDMSRequestSuccess = {
    dms: DMS
    private_key: string
}

export const createDMSWithFormAction = createAsyncAction(
    [actionTypes.CREATE_DMS, (req: any) => req],
    [success(actionTypes.CREATE_DMS), (req: CreateDMSRequestSuccess) => req],
    [failed(actionTypes.CREATE_DMS), (req: Error) => req]
)();

export type ApproveDMSRequest = {
    dmsName: string
    status: "APPROVED"
    authorized_cas: Array<string>
}

export const approveDMSRequestAction = createAsyncAction(
    [actionTypes.APPROVE_DMS_REQUEST, (req: ApproveDMSRequest) => req],
    [success(actionTypes.APPROVE_DMS_REQUEST), (req: any) => req],
    [failed(actionTypes.APPROVE_DMS_REQUEST), (req: Error) => req]
)();

export type UpdateAuthorizedCAsRequest = {
    dmsName: string
    authorized_cas: Array<string>
}
export const UpdateAuthorizedCAsAction = createAsyncAction(
    [actionTypes.UPDATE_AUTHORIZE_CAS, (req: UpdateAuthorizedCAsRequest) => req],
    [success(actionTypes.UPDATE_AUTHORIZE_CAS), (req: any) => req],
    [failed(actionTypes.UPDATE_AUTHORIZE_CAS), (req: Error) => req]
)();

export type RevokeDMSRequest = {
    dmsName: string
    status: "REVOKED"
}

export const revokeDMSAction = createAsyncAction(
    [actionTypes.REVOKE_DMS, (req: RevokeDMSRequest) => req],
    [success(actionTypes.REVOKE_DMS), (req: any) => req],
    [failed(actionTypes.REVOKE_DMS), (req: Error) => req]
)();

export type DeclineDMSRequest = {
    dmsName: string
    status: "REJECTED"
}

export const declineDMSRequestAction = createAsyncAction(
    [actionTypes.DECLINE_DMS_REQUEST, (req: DeclineDMSRequest) => req],
    [success(actionTypes.DECLINE_DMS_REQUEST), (req: any) => req],
    [failed(actionTypes.DECLINE_DMS_REQUEST), (req: Error) => req]
)();
