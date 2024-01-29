import { Field, FieldType } from "components/FilterInput";

export enum DeviceStatus {
    NoIdentity = "NO_IDENTITY",
    Active = "ACTIVE",
    RenewalWindow = "RENEWAL_PENDING",
    AboutToExpire = "EXPIRING_SOON",
    Expired = "EXPIRED",
    Revoked = "REVOKED",
    Decommissioned = "DECOMMISSIONED",
}

export const deviceStatusToColor = (status: DeviceStatus): string | [string, string] => {
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
    tags: string[];
    status: DeviceStatus;
    icon: string;
    icon_color: string;
    creation_timestamp: string;
    metadata: { [key: string]: any };
    dms_owner: string;
    events: { [key: string]: DeviceEvent };
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

export const slotStatusToColor = (status: SlotStatus): string | [string, string] => {
    switch (status) {
    case SlotStatus.Active:
        return "green";
    case SlotStatus.RenewalWindow:
        return ["#000000", "#F1DB3D"];
    case SlotStatus.AboutToExpire:
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
    events: { [key: string]: DeviceEvent };
}

export enum DeviceEventType {
    Created = "CREATED",
    Provisioned = "PROVISIONED",
    ReProvisioned = "RE-PROVISIONED",
    Renewed = "RENEWED",
    ShadowUpdated = "SHADOW-UPDATED",
    StatusUpdated = "STATUS-UPDATED",
    Decommissioned = "DECOMMISSIONED",
}

export type DeviceEvent = {
    type: DeviceEventType;
    description: string;
}

export type CreateDevicePayload = {
    id: string,
    tags: string[],
    metadata: { [key: string]: any },
    dms_id: string,
    icon: string,
    icon_color: string,
}

export const deviceFields: Field[] = [
    { key: "id", label: "ID", type: FieldType.String },
    { key: "dms_owner", label: "DMS Owner", type: FieldType.String },
    { key: "status", label: "Status", type: FieldType.Enum, fieldOptions: Object.values(DeviceStatus) },
    { key: "creation_ts", label: "Expires At", type: FieldType.Date },
    { key: "tags", label: "Tags", type: FieldType.StringArray }
];
