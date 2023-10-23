import { Moment } from "moment";

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
export type QueryParameters = {
    bookmark: string
    filters: string[]
    limit: number
    sortMode: "asc" | "desc"
    sortField: string
}

export interface ListRequest extends QueryParameters { }

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

export type SignPayloadResponse = {
    signature: string
    signing_algorithm: string
}

export type VerifyPayloadResponse = {
    verification: boolean
}

export type CreateCAPayload = {
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
