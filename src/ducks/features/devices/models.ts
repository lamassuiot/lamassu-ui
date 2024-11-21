import { BasicColor } from "components/Label";

export enum DeviceStatus {
    NoIdentity = "NO_IDENTITY",
    Active = "ACTIVE",
    RenewalWindow = "RENEWAL_PENDING",
    AboutToExpire = "EXPIRING_SOON",
    Expired = "EXPIRED",
    Revoked = "REVOKED",
    Decommissioned = "DECOMMISSIONED",
}

export const deviceStatusToColor = (status: DeviceStatus): BasicColor | [string, string] => {
    switch (status) {
    case DeviceStatus.NoIdentity:
        return ["#ffffff", "#08C2D4"];
    case DeviceStatus.Active:
        return ["#ffffff", "#008000"];
    case DeviceStatus.RenewalWindow:
        return ["#000000", "#F1DB3D"];
    case DeviceStatus.AboutToExpire:
        return ["#444444", "#F88B56"];
    case DeviceStatus.Expired:
        return ["#ffffff", "#8e8e8e"];
    case DeviceStatus.Revoked:
        return ["#ffffff", "#FF0000"];
    case DeviceStatus.Decommissioned:
        return ["#ffffff", "#8F56FE"];
    default:
        return "grey";
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
    tags: string[];
    status: DeviceStatus;
    icon: string;
    icon_color: string;
    creation_timestamp: string;
    metadata: { [key: string]: any };
    dms_owner: string;
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
    RenewalWindow = "RENEWAL_PENDING",
    AboutToExpire = "EXPIRING_SOON",
    Expired = "EXPIRED",
    Revoke = "REVOKED",
}

export const slotStatusToColor = (status: SlotStatus): "success" | "error" | "grey" | [string, string] => {
    switch (status) {
    case SlotStatus.Active:
        return "success";
    case SlotStatus.RenewalWindow:
        return ["#000000", "#F1DB3D"];
    case SlotStatus.AboutToExpire:
        return ["#444444", "#F88B56"];
    case SlotStatus.Expired:
        return "error";
    case SlotStatus.Revoke:
        return "error";
    default:
        return "grey";
    }
};

export type Slot<T extends string> = {
    status: SlotStatus;
    active_version: number;
    type: CryptoSecretType;
    versions: { [key: number]: T };
}

export enum DeviceEventType {
    Created = "CREATED",
    Provisioned = "PROVISIONED",
    ReProvisioned = "RE-PROVISIONED",
    Renewed = "RENEWED",
    ShadowUpdated = "SHADOW-UPDATED",
    StatusUpdated = "STATUS-UPDATED",
    Decommissioned = "DECOMMISSIONED",
    ConnectionUpdated = "CONNECTION-UPDATED",
}

export type DeviceEvent = {
    id: string;
    device_id: string;
    timestamp: string;
    type: DeviceEventType;
    description: string;
    source: string;
    status: DeviceStatus;
    structured_fields: { [key: string]: any };
}

export type CreateDevicePayload = {
    id: string,
    tags: string[],
    metadata: { [key: string]: any },
    dms_id: string,
    icon: string,
    icon_color: string,
}

export type AWSIoTDeviceMetadata = {
    actions: any[]
    groups: string[]
    connection_details: {
        disconnection_reason: string,
        ip_address: string,
        is_connected: boolean,
        latest_connection_update: string
    },
    thing_registered: boolean
}
