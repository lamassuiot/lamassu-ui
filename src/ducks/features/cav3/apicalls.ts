import { apiRequest } from "ducks/services/api";
import * as models from "./models";

const queryParametersToURL = (params: models.QueryParameters): string => {
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

export const getStats = async (): Promise<models.CAStats> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/stats"
    }) as Promise<models.CAStats>;
};

export const getEngines = async (): Promise<models.CryptoEngine[]> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/engines"
    }) as Promise<models.CryptoEngine[]>;
};

export const getCAs = async (params: models.QueryParameters): Promise<models.List<models.CertificateAuthority>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas${queryParametersToURL(params)}`
    }) as Promise<models.List<models.CertificateAuthority>>;
};

export const getCA = async (caID: string): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}`
    }) as Promise<models.CertificateAuthority>;
};

export const getIssuedCertificatesByCA = async (caID: string): Promise<models.List<models.Certificate>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}/models.Certificates`
    }) as Promise<models.List<models.Certificate>>;
};

export const createCA = async (payload: models.CreateCAPayload): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas`,
        data: payload
    }) as Promise<models.CertificateAuthority>;
};

export const importCA = async (id: string, engineID: string, certificateB64: string, privKeyB64: string, expiration: models.ExpirationFormat): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/import`,
        data: {
            id: id,
            engine_id: engineID,
            private_key: privKeyB64,
            ca: certificateB64,
            ca_chain: [],
            ca_type: "IMPORTED",
            issuance_expiration: expiration
        }
    });
};

export const importReadOnlyCA = async (certificateB64: string): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/import`,
        data: {
            ca: certificateB64,
            ca_chain: [],
            ca_type: "EXTERNAL"
        }
    });
};

export const updateMetadata = async (caName: string, metadata: any): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caName}/metadata`,
        data: {
            metadata: metadata
        }
    });
};

export const signPayload = async (caName: string, message: string, messageType: string, algorithm: string): Promise<models.SignPayloadResponse> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/cas/" + caName + "/signature/sign",
        data: {
            message: message,
            message_type: messageType,
            signing_algorithm: algorithm
        }
    });
};

export const verifyPayload = async (caName: string, signature: string, message: string, messageType: string, algorithm: string): Promise<models.VerifyPayloadResponse> => {
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

export const signCertificateRequest = async (caName: string, csr: string): Promise<models.Certificate> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/cas/" + caName + "/models.Certificates/sign",
        data: {
            csr: csr,
            sign_verbatim: true
        }
    });
};

export const updateCertificateStatus = async (certSerial: string, status: models.CertificateStatus, revocationReason?: string): Promise<models.Certificate> => {
    const body: any = {
        status: status
    };

    if (body.status === models.CertificateStatus.Revoked) {
        body.revocation_reason = revocationReason;
    }
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/models.Certificates/${certSerial}/status`,
        data: body
    });
};

export const updateCAStatus = async (caID: string, status: models.CertificateStatus, revocationReason?: string): Promise<models.CertificateAuthority> => {
    const body: any = {
        status: status
    };

    if (body.status === models.CertificateStatus.Revoked) {
        body.revocation_reason = revocationReason;
    }

    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}/status`,
        data: body
    });
};
