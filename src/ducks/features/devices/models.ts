export enum DeviceStatus {
    NoIdentity = "NO_IDENTITY",
    Active = "ACTIVE",
    ActiveSlotWithPreventive = "ACTIVE_WITH_WARNS",
    ActiveSlotWithCritical = "ACTIVE_WITH_CRITICAL",
    ActiveSlotWithExpiredRevoked = "REQUIRES_ACTION",
    Decommissioned = "DECOMMISSIONED",
}

export const deviceStatusToColor = (status: DeviceStatus): string | [string, string] => {
    switch (status) {
    case DeviceStatus.NoIdentity:
        return ["#ffffff", "#08C2D4"];
    case DeviceStatus.Active:
        return "green";
    case DeviceStatus.ActiveSlotWithPreventive:
        return ["#000000", "#F1DB3D"];
    case DeviceStatus.ActiveSlotWithCritical:
        return ["#444444", "#F88B56"];
    case DeviceStatus.ActiveSlotWithExpiredRevoked:
        return "red";
    case DeviceStatus.Decommissioned:
        return ["#ffffff", "#8F56FE"];
    default:
        return "gray";
    }
};

export type DeviceStats = {
    total: number
    status_distribution: {
        [key: string]: number;
    }
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
    identity: Slot<string>
    slots: { [key: string]: Slot<string> }
}

export enum CryptoSecretType {
    X509 = "x509",
    Token = "TOKEN",
    SshKey = "SSH_KEY",
    Other = "OTHER"
}

export enum SlotStatus {
    Active = "ACTIVE",
    WarnExpiration = "WARN",
    CriticalExpiration = "CRITICAL",
    Expired = "EXPIRED",
    Revoke = "REVOKED",
}

export const slotStatusToColor = (status: SlotStatus): string | [string, string] => {
    switch (status) {
    case SlotStatus.Active:
        return "green";
    case SlotStatus.WarnExpiration:
        return ["#000000", "#F1DB3D"];
    case SlotStatus.CriticalExpiration:
        return ["#444444", "#F88B56"];
    case SlotStatus.Expired:
        return "red";
    case SlotStatus.Revoke:
        return "red";
    default:
        return "gray";
    }
};

export type Slot<T extends string> = {
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
