import { apiRequest } from "ducks/services/api";
import { CertificateAuthority, GetCAsListAPIResponse, SignPayloadResponse, VerifyPayloadResponse } from "./models";

export const getInfo = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/info"
    });
};

export const getStats = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/stats?force_refresh=true"
    });
};

export const getCryptoEngine = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/cryptoengine"
    });
};

export const getCAs = async (limit: number, offset: number, sortMode: "asc" | "desc", sortField: string, filterQuery: Array<string>): Promise<GetCAsListAPIResponse> => {
    let url = window._env_.LAMASSU_CA_API + `/v1/pki?sort_by=${sortField}.${sortMode}&limit=${limit}&offset=${offset}`;
    filterQuery.forEach(filter => {
        url += `&filter=${filter}`;
    });
    return apiRequest({
        method: "GET",
        url: url
    });
};

export const getCA = async (caName: string): Promise<CertificateAuthority> => {
    const url = window._env_.LAMASSU_CA_API + "/v1/pki/" + caName;
    return apiRequest({
        method: "GET",
        url: url
    });
};

export const getIssuedCerts = async (caName: string, limit: number, offset: number, sortMode: "asc" | "desc", sortField: string, filterQuery: Array<string>): Promise<any> => {
    let url = window._env_.LAMASSU_CA_API + "/v1/pki/" + caName + `/certificates?&sort_by=${sortField}.${sortMode}&limit=${limit}&offset=${offset}`;
    filterQuery.forEach(filter => {
        url += `&filter=${filter}`;
    });
    return apiRequest({
        method: "GET",
        url: url
    });
};

type CreateCA = {
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
    ca_expiration: string,
    issuance_expiration: string
}

export const createCA = async (payload: CreateCA) => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/pki",
        data: payload
    });
};

export const importCA = async (certificateB64: string, privatekeyB64: string, issuanceExpirationSeconds: string) => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/pki/import",
        data: {
            certificate: certificateB64,
            with_private_key: true,
            issuance_expiration: issuanceExpirationSeconds,
            expiration_type: "DURATION",
            private_key: privatekeyB64
        }
    });
};

export const importReadOnlyCA = async (certificateB64: string) => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/pki/import",
        data: {
            certificate: certificateB64,
            with_private_key: false
        }
    });
};

export const revokeCA = async (caName: string) => {
    return apiRequest({
        method: "DELETE",
        url: window._env_.LAMASSU_CA_API + "/v1/pki/" + caName,
        data: {
            revocation_reason: "unspecified"
        }
    });
};

export const revokeCertificate = async (caName: string, serialNumber: string) => {
    return apiRequest({
        method: "DELETE",
        url: window._env_.LAMASSU_CA_API + "/v1/pki/" + caName + "/certificates/" + serialNumber,
        data: {
            revocation_reason: "unspecified"
        }
    });
};
export const signCertificate = async (caName: string, csr: string) : Promise<any> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/pki/" + caName + "/sign",
        data: {
            certificate_request: btoa(csr),
            sign_verbatim: true
        }
    });
};

export const signPayload = async (caName: string, message: string, messageType: string, algorithm: string): Promise<SignPayloadResponse> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/ca/" + caName + "/signature/sign",
        data: {
            message: message,
            message_type: messageType,
            signing_algorithm: algorithm
        }
    });
};

export const verifyPayload = async (caName: string, signature: string, message: string, messageType: string, algorithm: string): Promise<VerifyPayloadResponse> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/ca/" + caName + "/signature/verify",
        data: {
            signature: signature,
            message: message,
            message_type: messageType,
            signing_algorithm: algorithm
        }
    });
};
