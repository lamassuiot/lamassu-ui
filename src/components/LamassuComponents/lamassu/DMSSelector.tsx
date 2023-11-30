import React from "react";
import { GenericSelector } from "./GenericSelector";
import { DMSViewer } from "./DMSViewer";
import { DMS } from "ducks/features/ra/models";
import { apicalls } from "ducks/apicalls";

type Props = {
    onSelect: (dms: DMS | DMS[] | undefined) => void
    value?: DMS | DMS[]
    label: string
    selectLabel: string
    multiple: boolean
}

const DMSSelector: React.FC<Props> = (props: Props) => {
    return (
        <GenericSelector
            searchBarFilterKey="name"
            filtrableProps={[]}
            fetcher={async () => {
                const dmsResp = await apicalls.dms.getDMSs({
                    bookmark: "",
                    filters: [],
                    limit: 15,
                    sortField: "id",
                    sortMode: "asc"
                });
                return new Promise<DMS[]>(resolve => {
                    resolve(dmsResp.list);
                });
            }}
            label={props.label}
            selectLabel={props.selectLabel}
            multiple={props.multiple}
            optionID={(dms) => dms.name}
            optionRenderer={(dms) => <DMSViewer dms={dms} />}
            onSelect={(dms) => { props.onSelect(dms); }}
            value={props.value}
        />
    );
};

export default DMSSelector;
