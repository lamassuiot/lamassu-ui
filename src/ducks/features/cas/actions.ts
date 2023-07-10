import { createAsyncAction, createAction } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { CertificateAuthority, CAStats, GetCAsListAPIResponse, CAInfo, CryptoEngine, SignResponse } from "./models";

export const actionTypes = {
    RESET_CA_REQUEST_STATE: "RESET_CA_REQUEST_STATE",
    GET_INFO_CA_API: "GET_INFO_CA_API",
    GET_CRYPTO_ENGINE: "GET_CRYPTO_ENGINE",
    GET_CA_STATS: "GET_CA_STATS",
    GET_CAS: "GET_CAS",
    GET_ISSUED_CERTS: "GET_ISSUED_CERTS",
    CREATE_CA: "CREATE_CA",
    IMPORT_CA: "IMPORT_CA",
    REVOKE_CA: "REVOKE_CA",
    REVOKE_CERT: "REVOKE_CERT",
    SIGN_CERT: "SIGN_CERT"
};

export const resetStateAction = createAction(
    actionTypes.RESET_CA_REQUEST_STATE
)();

export const getInfoAction = createAsyncAction(
    [actionTypes.GET_INFO_CA_API, () => { }],
    [success(actionTypes.GET_INFO_CA_API), (req: CAInfo) => req],
    [failed(actionTypes.GET_INFO_CA_API), (req: Error) => req]
)();

export const getCryptoEngineAction = createAsyncAction(
    [actionTypes.GET_CRYPTO_ENGINE, () => { }],
    [success(actionTypes.GET_CRYPTO_ENGINE), (req: CryptoEngine) => req],
    [failed(actionTypes.GET_CRYPTO_ENGINE), (req: Error) => req]
)();

export const getStatsAction = createAsyncAction(
    [actionTypes.GET_CA_STATS, () => { }],
    [success(actionTypes.GET_CA_STATS), (req: CAStats) => req],
    [failed(actionTypes.GET_CA_STATS), (req: Error) => req]
)();

export type GetCAsAction = {
    sortMode: "asc" | "desc",
    sortField: string,
    limit: number,
    offset: number,
    filterQuery: Array<string>,
}

export const getCAsAction = createAsyncAction(
    [actionTypes.GET_CAS, (req: GetCAsAction) => req],
    [success(actionTypes.GET_CAS), (req: GetCAsListAPIResponse) => req],
    [failed(actionTypes.GET_CAS), (req: Error) => req]
)();

export type GetIssuedCerts = {
    caName: string,
    sortMode: "asc" | "desc",
    sortField: string,
    limit: number,
    offset: number,
    filterQuery: Array<string>,
}

export type GetIssuedCertsResponse = {
    certificates: Array<CertificateAuthority>
    total_certificates: number
}

export const getIssuedCertsActions = createAsyncAction(
    [actionTypes.GET_ISSUED_CERTS, (req: GetIssuedCerts) => req],
    [success(actionTypes.GET_ISSUED_CERTS), (req: GetIssuedCertsResponse, meta: any) => req, (req: GetIssuedCertsResponse, meta: any) => meta],
    [failed(actionTypes.GET_ISSUED_CERTS), (req: Error) => req]

)();

export type CreateCA = {
    selectedConnectorIDs: Array<string>,
    body: {
        subject: {
            country: string,
            state: string,
            locality: string,
            organization: string,
            organization_unit: string,
            common_name: string
        },
        key_metadata: {
            type: string,
            bits: number
        },
        ca_expiration: string
        issuance_expiration: string,
        expiration_type: "DATE" | "DURATION"
    }
}

export const createCAAction = createAsyncAction(
    [actionTypes.CREATE_CA, (req: CreateCA) => req],
    [success(actionTypes.CREATE_CA), (req: CertificateAuthority) => req],
    [failed(actionTypes.CREATE_CA), (req: Error) => req]
)();

export type ImportCA = {
    caName: string
    selectedConnectorIDs: Array<string>,
    certificateB64: string,
    privatekeyB64: string,
    enroller_ttl: number
}
export const importCAAction = createAsyncAction(
    [actionTypes.IMPORT_CA, (req: ImportCA) => req],
    [success(actionTypes.IMPORT_CA), (req: CertificateAuthority) => req],
    [failed(actionTypes.IMPORT_CA), (req: Error) => req]
)();

export type RevokeCA = {
    caName: string
}
export const revokeCAAction = createAsyncAction(
    [actionTypes.REVOKE_CA, (req: RevokeCA) => req],
    [success(actionTypes.REVOKE_CA), (req: any, meta: RevokeCA) => req, (req: any, meta: RevokeCA) => meta],
    [failed(actionTypes.REVOKE_CA), (req: Error) => req]
)();

export type RevokeCert = {
    caName: string,
    serialNumber: string
}
export const revokeCertAction = createAsyncAction(
    [actionTypes.REVOKE_CERT, (req: RevokeCert) => req],
    [success(actionTypes.REVOKE_CERT), (req: any, meta: RevokeCert) => req, (req: any, meta: RevokeCert) => meta],
    [failed(actionTypes.REVOKE_CERT), (req: Error) => req]
)();
export type SignCert = {
    csr: string,
    caName: string,
}
export const signCertAction = createAsyncAction(
    [actionTypes.SIGN_CERT, (req: SignCert) => req],
    [success(actionTypes.SIGN_CERT), (req: SignResponse) => req],
    [failed(actionTypes.SIGN_CERT), (req: Error) => req]
)();
