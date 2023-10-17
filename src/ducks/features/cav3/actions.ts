import { createAction, createAsyncAction } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { CertificateAuthority, List, ListRequest } from "./apicalls";

export const actionTypes = {
    GET_CAS: "GET_CAS",

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
)<ListRequest, List<CertificateAuthority>, Error>();

export const createCA = createAction(actionTypes.CREATE_CA_SUCCESS)();
export const importCAWithKey = createAction(actionTypes.IMPORT_CA_WITH_KEY_SUCCESS)();
export const importCAReadonly = createAction(actionTypes.IMPORT_CA_READONLY_SUCCESS)();
export const updateCAMetadata = createAction(actionTypes.UPDATE_CA_METADATA_SUCCESS)();
export const revokeCA = createAction(actionTypes.REVOKE_CA_SUCCESS)();
