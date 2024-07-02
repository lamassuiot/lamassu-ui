import { Moment } from "moment";

export enum RevocationReason {
    AACompromise = "AACompromise",
    AffiliationChanged = "AffiliationChanged",
    CACompromise = "CACompromise",
    CertificateHold = "CertificateHold",
    CessationOfOperation = "CessationOfOperation",
    KeyCompromise = "KeyCompromise",
    PrivilegeWithdrawn = "PrivilegeWithdrawn",
    RemoveFromCrl = "RemoveFromCrl",
    Superseded = "Superseded",
    Unspecified = "Unspecified",
    WeakAlgorithmOrKey = "WeakAlgorithmOrKey",
}

export const getRevocationReasonDescription = (reason: RevocationReason): string => {
    switch (reason) {
    case RevocationReason.AACompromise:
        return "It is known, or suspected, that aspects of the Attribute Authority (AA) validated in the attribute certificate have been compromised.";
    case RevocationReason.AffiliationChanged:
        return "The subject's name, or other validated information in the certificate, has changed without anything being compromised.";
    case RevocationReason.CACompromise:
        return "The private key, or another validated portion of a Certificate Authority (CA) certificate, is suspected to have been compromised.";
    case RevocationReason.CertificateHold:
        return "The certificate is temporarily suspended, and may either return to service or become permanently revoked in the future.";
    case RevocationReason.CessationOfOperation:
        return "The certificate is no longer needed, but nothing is suspected to be compromised.";
    case RevocationReason.KeyCompromise:
        return "The private key, or another validated portion of an end-entity certificate, is suspected to have been compromised.";
    case RevocationReason.PrivilegeWithdrawn:
        return "A privilege contained within the certificate has been withdrawn.";
    case RevocationReason.RemoveFromCrl:
        return "The certificate was revoked with CertificateHold on a base Certificate Revocation List (CRL) and is being returned to service on a delta CRL.";
    case RevocationReason.Superseded:
        return "The certificate has been superseded, but without anything being compromised.";
    case RevocationReason.Unspecified:
        return "Revocation occurred for a reason that has no more specific value.";
    case RevocationReason.WeakAlgorithmOrKey:
        return "The certificate key uses a weak cryptographic algorithm, or the key is too short, or the key was generated in an unsafe manner.";

    default:
        return "";
    }
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
    level: number
    issuer_metadata: {
        level: number
        id: string
        serial_number: string
    },
}

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

export interface CAStatsByCA {
    [key: string]: number
};

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

export type SignPayloadResponse = {
    signed_data: string
}

export type VerifyPayloadResponse = {
    valid: boolean
}

export type CreateCAPayload = {
    parent_id: string | undefined
    id: string | undefined
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
