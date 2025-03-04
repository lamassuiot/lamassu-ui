import * as models from "./models";
import { APIServiceInfo, ListResponse, QueryParameters, apiRequest, queryParametersToURL } from "ducks/services/api-client";

export const getApiInfo = async (): Promise<APIServiceInfo> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/health`
    }) as Promise<APIServiceInfo>;
};

export const getStats = async (): Promise<models.CAStats> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/stats"
    }) as Promise<models.CAStats>;
};

export const getStatsByCA = async (id: string): Promise<models.CAStatsByCA> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/stats/" + id
    }) as Promise<models.CAStatsByCA>;
};

export const getEngines = async (): Promise<models.CryptoEngine[]> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/engines"
    }) as Promise<models.CryptoEngine[]>;
};

export const getCAs = async (params?: QueryParameters): Promise<ListResponse<models.CertificateAuthority>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas${queryParametersToURL(params)}`
    }) as Promise<ListResponse<models.CertificateAuthority>>;
};

export const getCA = async (caID: string): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}`
    }) as Promise<models.CertificateAuthority>;
};

export const getIssuedCertificatesByCA = async (caID: string, params?: QueryParameters): Promise<ListResponse<models.Certificate>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}/certificates${queryParametersToURL(params)}`
    }) as Promise<ListResponse<models.Certificate>>;
};

export const getCertificate = async (sn: string): Promise<models.Certificate> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/certificates/${sn}`
    }) as Promise<models.Certificate>;
};

export const getCertificates = async (params?: QueryParameters): Promise<ListResponse<models.Certificate>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/certificates${queryParametersToURL(params)}`
    }) as Promise<ListResponse<models.Certificate>>;
};

export const createCA = async (payload: models.CreateCAPayload): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas`,
        data: payload
    }) as Promise<models.CertificateAuthority>;
};

export const importCA = async (id: string, engineID: string, certificateB64: string, privKeyB64: string, expiration: models.ExpirationFormat, parentCAID: string): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/import`,
        data: {
            id,
            engine_id: engineID,
            private_key: privKeyB64,
            ca: certificateB64,
            ca_chain: [],
            ca_type: "IMPORTED",
            issuance_expiration: expiration,
            parent_id: parentCAID
        }
    });
};
export const deleteCA = async (id: string): Promise<{}> => {
    return apiRequest({
        method: "DELETE",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${id}`
    }) as Promise<{}>;
};

export const importReadOnlyCA = async (id: string, certificateB64: string): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/import`,
        data: {
            id,
            ca: certificateB64,
            ca_chain: [],
            ca_type: "EXTERNAL"
        }
    });
};

export const updateCAMetadata = async (caName: string, metadata: any): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caName}/metadata`,
        data: {
            patches: [
                {
                    op: "add",
                    path: "",
                    value: metadata
                }
            ]
        }
    });
};

export const updateCertificateMetadata = async (certSN: string, metadata: any): Promise<models.Certificate> => {
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/certificates/${certSN}/metadata`,
        data: {
            patches: [
                {
                    op: "add",
                    path: "",
                    value: metadata
                }
            ]
        }
    });
};

export const updateCAIssuanceExpiration = async (caID: string, expiration: models.ExpirationFormat): Promise<models.CertificateAuthority> => {
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}/issuance-expiration`,
        data: expiration
    });
};

export const signPayload = async (caName: string, message: string, messageType: "raw" | "hash", algorithm: string): Promise<models.SignPayloadResponse> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/cas/" + caName + "/signature/sign",
        data: {
            message,
            message_type: messageType,
            signature_algorithm: algorithm
        }
    });
};

export const verifyPayload = async (caName: string, signature: string, message: string, messageType: "raw" | "hash", algorithm: string): Promise<models.VerifyPayloadResponse> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/cas/" + caName + "/signature/verify",
        data: {
            signature,
            message,
            message_type: messageType,
            signature_algorithm: algorithm
        }
    });
};

export const signCertificateRequest = async (caName: string, csr: string, profile: models.Profile): Promise<models.Certificate> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/cas/" + caName + "/certificates/sign",
        data: {
            csr,
            profile
        }
    });
};

export const importCertificate = async (crt: string): Promise<models.Certificate> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/certificates/import",
        data: {
            certificate: crt,
            metadata: {}
        }
    });
};

export const updateCertificateStatus = async (certSerial: string, status: models.CertificateStatus, revocationReason?: string): Promise<models.Certificate> => {
    const body: any = {
        status
    };

    if (body.status === models.CertificateStatus.Revoked) {
        body.revocation_reason = revocationReason;
    }
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/certificates/${certSerial}/status`,
        data: body
    });
};

export const updateCAStatus = async (caID: string, status: models.CertificateStatus, revocationReason?: string): Promise<models.CertificateAuthority> => {
    const body: any = {
        status
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
