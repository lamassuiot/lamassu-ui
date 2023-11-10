import { createAction, createAsyncAction, deprecated } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { CertificateAuthority } from "./models";
import { ListRequest, ListResponse } from "ducks/models";
const { createStandardAction } = deprecated;

export const actionTypes = {
    GET_CAS: "GET_CAS",
    GET_CA_BY_ID: "GET_CA_BY_ID",

    CREATE_CA_SUCCESS: "CREATE_CA",
    IMPORT_CA_WITH_KEY_SUCCESS: "IMPORT_CA_WITH_KEY",
    IMPORT_CA_READONLY_SUCCESS: "IMPORT_CA_READONLY",
    UPDATE_CA_METADATA_SUCCESS: "UPDATE_CA_METADATA",
    REVOKE_CA_SUCCESS: "REVOKE_CA",
    GET_CA_SUCCESS: "GET_CA"
};

export const getCAs = createAsyncAction(
    actionTypes.GET_CAS,
    success(actionTypes.GET_CAS),
    failed(actionTypes.GET_CAS)
)<ListRequest, ListResponse<CertificateAuthority>, Error>();

export const getCAByID = createAsyncAction(
    actionTypes.GET_CA_BY_ID,
    success(actionTypes.GET_CA_BY_ID),
    failed(actionTypes.GET_CA_BY_ID)
)<string, CertificateAuthority, Error>();

export const createCA = createAction(actionTypes.CREATE_CA_SUCCESS, action => {
    return (id: string) => action(undefined, id);
})();
export const importCAWithKey = createAction(actionTypes.IMPORT_CA_WITH_KEY_SUCCESS, action => {
    return (id: string) => action(undefined, id);
})();
export const importCAReadonly = createAction(actionTypes.IMPORT_CA_READONLY_SUCCESS, action => {
    return (id: string) => action(undefined, id);
})();
export const updateCAMetadata = createStandardAction(actionTypes.UPDATE_CA_METADATA_SUCCESS)<string>();
export const revokeCA = createStandardAction(actionTypes.REVOKE_CA_SUCCESS)<string>();
