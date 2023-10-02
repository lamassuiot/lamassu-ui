import React from "react";
import { GenericSelector } from "./GenericSelector";
import { DMS } from "ducks/features/dms-enroller/models";
import { getDMSList } from "ducks/features/dms-enroller/apicalls";
import { DMSViewer } from "./DMSViewer";

type Props = {
    onSelect: (dms: DMS | DMS[]) => void
    value?: DMS | DMS[]
    label: string
    selectLabel: string
    multiple: boolean
}

const DMSSelector: React.FC<Props> = (props: Props) => {
    return (
        <GenericSelector
            fetcher={async () => {
                const dmsResp = await getDMSList(100, 0, "asc", "", []);
                console.log(dmsResp);
                return new Promise<DMS[]>(resolve => {
                    resolve(dmsResp.dmss);
                });
            }}
            label={props.label}
            selectLabel={props.selectLabel}
            multiple={props.multiple}
            filterKeys={["name"]}
            optionID={(dms) => dms.name}
            optionRenderer={(dms) => <DMSViewer dms={dms} />}
            onSelect={(dms) => { console.log(dms); props.onSelect(dms); }}
            value={props.value}
        />
    );
};

export default DMSSelector;
