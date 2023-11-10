export type DMS = {
    id: string,
    name: string,
    metadata: { [key: string]: any },
    creation_ts: string,
    settings: DMSSettings,
}

export type DMSSettings = {
    enrollment_settings: EnrollmentSettings,
    reenrollment_settings: ReEnrollmentSettings,
    ca_distribution_settings: CADistributionSettings,
}

export enum EnrollmentProtocols {
    EST = "EST_RFC7030",
}

export enum EnrollmentRegistrationMode {
    PreRegistration = "PRE_REGISTRATION",
    JITP = "JITP",
}

export enum ESTAuthMode {
    NoAuth = "NO_AUTH",
    ClientCertificate = "CLIENT_CERTIFICATE",
}

export type AuthOptionsClientCertificate = {
    validation_cas: string[],
    chain_level_validation: number
}
export type EST7030Settings = {
    auth_mode: ESTAuthMode,
    client_certificate_settings: AuthOptionsClientCertificate,
}

export type EnrollmentSettings = {
    protocol: EnrollmentProtocols,
    est_rfc7030_settings: EST7030Settings,
    device_provisioning_profile: {
        icon: string,
        icon_color: string,
        metadata: { [key: string]: any },
        tags: string[],
    },
    enrollment_ca: string,
    enable_replaceable_enrollment: boolean,
    registration_mode: EnrollmentRegistrationMode,
}

export type ReEnrollmentSettings = {
    additional_validation_cas: string[],
    reenrollment_delta: string,
    enable_expired_renewal: boolean,
    preventive_delta: string,
    critical_delta: string,
}

export type CADistributionSettings = {
    include_system_ca: boolean,
    include_enrollment_ca: boolean,
    managed_cas: string[]
}

// /////////////////

export type CreateUpdateDMSPayload = {
    id: string,
    name: string,
    metadata: { [key: string]: any },
    settings: DMSSettings,
}
