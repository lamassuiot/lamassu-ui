export class CAInfo {
    public build_version!: string
    public build_time!: string
    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class CryptoEngineSupportedKey {
    public type!: string
    public minimum_size!: number
    public maximum_size!: number
    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class CryptoEngine {
    public provider!: string
    public cryptoki_version!: string
    public manufacturer!: string
    public model!: string
    public library!: string
    public supported_key_types!: Array<CryptoEngineSupportedKey>
    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class GetCAsListAPIResponse {
    public total_cas!: number
    public cas!: Array<CertificateAuthority>

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class CAStats {
    public issued_certificates!: number
    public cas!: number
    public scan_date!: Date
}

export class CertificateAuthority {
    public certificate!: string

    public key_metadata!: {
        bits: number
        strength: KeyStrength
        strength_color: string
        type: KeyType
    }

    public name!: string
    public serial_number!: string
    public status!: CAStatus
    public status_color!: string
    public subject!: {
        common_name: string
        country: string
        locality: string
        organization: string
        organization_unit: string
        state: string
    }

    public valid_from!: number
    public valid_to!: number

    public issuance_duration!: number
    public ca_expiration!: number
    public with_private_key!: boolean

    public total_issued_certificates!: number
    public issued_certs!: Array<Certificate>

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class Certificate {
    public certificate!: string

    public key_metadata!: {
        bits: number
        strength: KeyStrength
        strength_color: string
        type: KeyType
    }

    public serial_number!: string
    public status!: CAStatus
    public status_color!: string
    public subject!: {
        common_name: string
        country: string
        locality: string
        organization: string
        organization_unit: string
        state: string
    }

    public valid_from!: number
    public valid_to!: number

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export const OKeyStrength = {
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW"
};

export const OKeyType = {
    RSA: "RSA",
    ECDSA: "ECDSA"
};

export const OCAStatus = {
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    ABOUT_TO_EXPIRED: "ABOUT_TO_EXPIRED",
    REVOKED: "REVOKED"
};

export type KeyStrength = typeof OKeyStrength[keyof typeof OKeyStrength];
export type KeyType = typeof OKeyType[keyof typeof OKeyType];
export type CAStatus = typeof OCAStatus[keyof typeof OCAStatus];

export class SignResponse {
    public certificate!: string
    public ca_certificate!: string

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class SignPayloadResponse {
    public signature!: string
    public signing_algorithm!: string

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class VerifyPayloadResponse {
    public verification!: boolean

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}
