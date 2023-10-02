import { apiRequest } from "ducks/services/api";
import { Moment } from "moment";
import { SignPayloadResponse, VerifyPayloadResponse } from "../cas/models";

export interface CAStats {
    cas: {
        total: number,
        engine_distribution: {
            [key: string]: number;
        },
        status_distribution: {
            [key: string]: number;
        }
    },
    certificates: {
        total: number,
        ca_distribution: {
            [key: string]: number;
        },
        status_distribution: {
            [key: string]: number;
        }
    }
}

export enum CertificateStatus {
    Active = "ACTIVE",
    Revoked = "REVOKED",
    Expired = "EXPIRED",
}

export const getStats = async (): Promise<CAStats> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/stats"
    }) as Promise<CAStats>;
};
export interface CryptoEngine {
    type: "GOLANG" | "AWS_SECRETS_MANAGER" | "AWS_KMS",
    id: string
    default: boolean
    security_level: number,
    provider: string
    name: string
    metadata: Map<string, string | number | boolean>
    supported_key_types: Array<{
        type: "RSA" | "ECDSA",
        sizes: number[],
    }>
}
export const getEngines = async (): Promise<CryptoEngine[]> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/engines"
    }) as Promise<CryptoEngine[]>;
};

export type Certificate = {
    status: CertificateStatus
    serial_number: string
    certificate: string
    key_metadata: {
        type: "ECDSA" | "RSA"
        bits: number
        strength: "HIGH"
    }
    subject: {
        common_name: string
        organization: string
        organization_unit: string
        country: string
        state: string
        locality: string
    }
    valid_from: Moment
    valid_to: Moment
    revocation_timestamp: Moment
    revocation_reason: string
    metadata: any
    issuer_metadata: {
        ca_name: string
        serial_number: string
    },
}

export interface CertificateAuthority extends Certificate {
    engine_id: string,
    id: string,
    metadata: any
    issuance_expiration: {
        type: "Duration" | "Time"
        duration: string
        time: Moment
    },
    type: "MANAGED" | "EXTERNAL" | "IMPORTED"
    creation_ts: Moment
}

export interface List<T> {
    next: string,
    list: T[]
}

export const getCAs = async (): Promise<List<CertificateAuthority>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas`
    }) as Promise<List<CertificateAuthority>>;
};

export const getCA = async (caID: string): Promise<CertificateAuthority> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}`
    }) as Promise<CertificateAuthority>;
};

export const getIssuedCertificatesByCA = async (caID: string): Promise<List<Certificate>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}/certificates`
    }) as Promise<List<Certificate>>;
};

type CreateCAPayload = {
    engine_id: string | undefined
    subject: {
        common_name: string
        organization: string
        organization_unit: string
        country: string
        state: string
        locality: string
    },
    key_metadata: {
        type: string
        bits: number
    },
    ca_type: string
    ca_expiration: {
        type: string
        duration: string
        time: string
    }
    issuance_expiration: ExpirationFormat
}
export type ExpirationFormat = {
    type: "Duration" | "Time"
    duration?: string
    time?: string
}

export const createCA = async (payload: CreateCAPayload): Promise<CreateCAPayload> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas`,
        data: payload
    }) as Promise<CreateCAPayload>;
};

export const importCA = async (id: string, engineID: string, certificateB64: string, privKeyB64: string, expiration: ExpirationFormat) => {
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

export const importReadOnlyCA = async (certificateB64: string) => {
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

export const updateMetadata = async (caName: string, metadata: any) => {
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caName}/metadata`,
        data: {
            metadata: metadata
        }
    });
};

export const signPayload = async (caName: string, message: string, messageType: string, algorithm: string): Promise<SignPayloadResponse> => {
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

export const signCertificateRequest = async (caName: string, csr: string): Promise<Certificate> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CA_API + "/v1/cas/" + caName + "/certificates/sign",
        data: {
            csr: csr,
            sign_verbatim: true
        }
    });
};

export const updateCertificateStatus = async (certSerial: string, status: CertificateStatus, revocationReason?: string): Promise<Certificate> => {
    const body: any = {
        status: status
    };

    if (body.status === CertificateStatus.Revoked) {
        body.revocation_reason = revocationReason;
    }
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_CA_API}/v1/certificates/${certSerial}/status`,
        data: body
    });
};

export const updateCAStatus = async (caID: string, status: CertificateStatus, revocationReason?: string): Promise<CertificateAuthority> => {
    const body: any = {
        status: status
    };

    if (body.status === CertificateStatus.Revoked) {
        body.revocation_reason = revocationReason;
    }

    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/${caID}/status`,
        data: body
    });
};
