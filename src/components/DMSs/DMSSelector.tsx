import { DMS } from "ducks/features/dmss/models";
import { DMSViewer } from "./DMSViewer";
import { GenericSelector } from "../GenericSelector";
import React from "react";
import apicalls from "ducks/apicalls";

type Props = {
    limitSelection?: string[] // IDs
    onSelect: (item: DMS | DMS[] | undefined) => void
    value?: DMS | DMS[]
    label: string
    multiple: boolean
}

export const DMSSelector: React.FC<Props> = (props: Props) => {
    return (
        <GenericSelector
            fetcher={async (query, controller) => {
                const resp = await apicalls.dmss.getDMSs();

                let list: DMS[] = resp.list;
                if (props.limitSelection !== undefined) {
                    list = resp.list.filter(item => props.limitSelection?.includes(item.id));
                }

                return new Promise<DMS[]>(resolve => {
                    resolve(list);
                });
            }}
            label={props.label}
            multiple={props.multiple}
            optionID={(item) => item.id}
            optionLabel={(item) => item.id}
            renderOption={(props, dms, selected) => (
                <DMSViewer dms={dms}/>
            )}
            onSelect={(item) => {
                props.onSelect(item);
            }}
            value={props.value}
        />
    );
};
