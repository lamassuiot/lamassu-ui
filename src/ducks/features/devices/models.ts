export enum DeviceStatus {
    NoIdentity = "NO_IDENTITY",
    Active = "ACTIVE",
    ActiveSlotWithPreventive = "ACTIVE_WITH_WARNS",
    ActiveSlotWithCritical = "ACTIVE_WITH_CRITICAL",
    ActiveSlotWithExpiredRevoked = "REQUIRES_ACTION",
    Decommissioned = "DECOMMISSIONED",
}

export type Device = {
    id: string;
    alias: string;
    tags: string[];
    status: DeviceStatus;
    icon: string;
    icon_color: string;
    creation_ts: string;
    metadata: { [key: string]: any };
    dms_owner: string;
    logs: { [key: string]: LogMsg };
    identity: Slot<SlotType>
    slots: { [key: string]: Slot<SlotType> }
}

export enum CryptoSecretType {
    X509 = "x509",
    Token = "TOKEN",
    SshKey = "SSH_KEY",
    Other = "OTHER"
}

type SlotType = {}

export enum SlotStatus {
    Active = "ACTIVE",
    WarnExpiration = "WARN",
    CriticalExpiration = "CRITICAL",
    Expired = "EXPIRED",
    Revoke = "REVOKED",
}

export type Slot<T extends SlotType> = {
    status: SlotStatus;
    active_version: number;
    type: CryptoSecretType;
    versions: { [key: number]: T };
    logs: { [key: string]: LogMsg };
}

export enum LogCriticality {
    Info = "INFO",
    Warn = "WARN",
    Error = "ERROR"
}

export type LogMsg = {
    message: string;
    Criticality: LogCriticality;
}

export type CreateDevicePayload = {
    id: string,
    alias: string,
    tags: string[],
    metadata: { [key: string]: any },
    dms_id: string,
    icon: string,
    icon_color: string,
}
