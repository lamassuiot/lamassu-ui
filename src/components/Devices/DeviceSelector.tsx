import { Device } from "ducks/features/devices/models";
import { GenericSelector } from "../GenericSelector";
import React from "react";
import apicalls from "ducks/apicalls";

type Props = {
    limitSelection?: string[] // IDs
    onSelect: (item: Device | Device[] | undefined) => void
    value?: Device | Device[]
    label: string
    multiple: boolean
}

export const DeviceSelector: React.FC<Props> = (props: Props) => {
    return (
        <GenericSelector
            fetcher={async (query, controller) => {
                const resp = await apicalls.devices.getDevices();

                let list: Device[] = resp.list;
                if (props.limitSelection !== undefined) {
                    list = resp.list.filter(item => props.limitSelection?.includes(item.id));
                }

                return new Promise<Device[]>(resolve => {
                    resolve(list);
                });
            }}
            label={props.label}
            multiple={props.multiple}
            optionID={(item) => item.id}
            optionLabel={(item) => item.id}
            onSelect={(item) => {
                props.onSelect(item);
            }}
            value={props.value}
        />
    );
};
