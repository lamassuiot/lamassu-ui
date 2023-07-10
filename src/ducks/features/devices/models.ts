import { KeyStrength, KeyType } from "../cas/models";
export class DeviceManagerInfo {
    public build_version!: string
    public build_time!: string
    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class GetDeviceListAPIResponse {
    public total_devices!: number
    public devices!: Array<Device>

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export class SlotCertificate {
    public key_metadata!: {
        bits: number
        strength: KeyStrength
        strength_color: string
        type: KeyType
    }

    public status!: string
    public status_color!: string

    public ca_name!: string
    public certificate!: string
    public serial_number!: string
    public valid_from!: Date
    public valid_to!: Date

    public revocation_timestamp!: Date
    public revocation_reason!: string

    public subject!: {
        common_name?: string
        country?: string
        locality?: string
        organization?: string
        organization_unit?: string
        state?: string
    }
}

export class DeviceSlot {
    public id!: string
    public active_certificate!: SlotCertificate
    public archive_certificates!: Array<SlotCertificate>
}

export class Device {
    public id!: string
    public alias!: string
    public description!: string
    public tags!: Array<string>
    public slots!: Array<DeviceSlot>
    public icon_name!: string
    public icon_color!: string
    public icon_color_fg!: string
    public icon_color_bg!: string
    public status!: DeviceStatus
    public status_color!: DeviceStatus
    public dms_name!: string

    public creation_timestamp!: Date

    constructor (args?: {}) {
        console.log(args);

        Object.assign(this, args);
        const splitColors = this.icon_color.split("-");
        console.log(splitColors);

        if (splitColors.length === 2) {
            this.icon_color_bg = splitColors[0];
            this.icon_color_fg = splitColors[1];
        } else {
            this.icon_color_bg = this.icon_color;
            this.icon_color_fg = this.icon_color;
        }
    }
}

export class DevicesStats {
    public stats!: {
        devices_stats: any
        slots_stats: any
    }

    public scan_date!: Date

    constructor (args?: {}) {
        Object.assign(this, args);
    }
}

export const ODeviceStatus = {
    PENDING_PROVISIONING: "PENDING_PROVISIONING",
    FULLY_PROVISIONED: "FULLY_PROVISIONED",
    PROVISIONED_WITH_WARNINGS: "PROVISIONED_WITH_WARNINGS",
    REQUIRES_ACTION: "REQUIRES_ACTION",
    DECOMMISSIONED: "DECOMMISSIONED"
};

export const OSlotCertificateStatus = {
    ACTIVE: "ACTIVE",
    ABOUT_TO_EXPIRE: "ABOUT_TO_EXPIRE",
    EXPIRED: "EXPIRED",
    REVOKED: "REVOKED"
};

export type SlotCertificateStatus = typeof OSlotCertificateStatus[keyof typeof OSlotCertificateStatus];
export type DeviceStatus = typeof ODeviceStatus[keyof typeof ODeviceStatus];
