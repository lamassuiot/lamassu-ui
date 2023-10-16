import { createAsyncAction } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { CertificateAuthority, List, ListRequest } from "./apicalls";

export const actionTypes = {
    GET_CAS_V3: "GET_CAS_V3",
    CREATE_CA: "CREATE_CA",
    IMPORT_CA: "IMPORT_CA"
};

export const getCAs = createAsyncAction(
    [actionTypes.GET_CAS_V3, (req: GetCAsAction) => req],
    [success(actionTypes.GET_CAS_V3), (req: List<CertificateAuthority>) => req],
    [failed(actionTypes.GET_CAS_V3), (req: Error) => req]
)();

export interface GetCAsAction extends ListRequest {}
