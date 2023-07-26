import { apiRequest } from "ducks/services/api";
import { Moment } from "moment";

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
    status: "ACTIVE"
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
    metadata: any
    issuer_metadata: {
        ca_name: string
        serial_number: string
    },
}

export interface CertificateAuthority extends Certificate {
    id: string,
    metadata: any
    issuance_expiration: {
        type: "Duration" | "Time"
        duration: string
        time: Moment
    },
    type: "MANAGED"
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

export const getIssuedCertificates = async (): Promise<List<Certificate>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas/certificates`
    }) as Promise<List<Certificate>>;
};

type CreateCAPayload = {
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
    issuance_expiration: {
        type: string
        duration: string
        time: string
    }
}

export const createCA = async (payload: CreateCAPayload): Promise<CreateCAPayload> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_CA_API}/v1/cas`,
        data: payload
    }) as Promise<CreateCAPayload>;
};
