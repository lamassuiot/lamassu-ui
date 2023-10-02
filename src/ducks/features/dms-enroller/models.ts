import { KeyStrength, KeyType } from "../cas/models";
export class DMSManagerInfo {
    public build_version!: string
    public build_time!: string
    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class GetDMSsListAPIResponse {
    public total_dmss!: number
    public dmss!: Array<DMS>

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export type DMS = {
    name: string
    creation_timestamp: Date
    status: DMSStatus
    status_color: string
    cloud_dms: boolean
    aws: {
        shadow_type: string
    },
    remote_access_identity: {
        authorized_cas: Array<string>
        key_metadata: {
            bits: number
            strength: KeyStrength
            strength_color: string
            type: KeyType
        }

        subject: {
            common_name?: string
            country?: string
            locality?: string
            organization?: string
            organization_unit?: string
            state?: string
        }

        certificate: string
        certificate_request: string
    }

    identity_profile: {
        general_setting: {
            enrollment_mode: string
        },
        enrollment_settings: {
            authentication_mode: string
            allow_new_auto_enrollment: boolean
            tags: Array<string>
            icon: string
            color: string
            authorized_ca: string
            bootstrap_cas: Array<string>
            chain_validation_level: number,
            registration_mode: string
        },
        reenrollment_settings: {
            allow_expired_renewal: boolean
            preventive_renewal_interval: string
            additional_validation_cas: string[]
        },
        ca_distribution_settings: {
            include_authorized_ca: boolean
            include_lamassu_downstream_ca: boolean
            include_bootstrap_cas: boolean
            managed_cas: string[]
        }
        aws_iotcore_publish: boolean
    }
}

export const ODMSStatus = {
    PENDING_APPROVAL: "PENDING_APPROVAL",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    EXPIRED: "EXPIRED",
    REVOKED: "REVOKED"
};

export type DMSStatus = typeof ODMSStatus[keyof typeof ODMSStatus];
