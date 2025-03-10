import { Certificate } from "ducks/features/cas/models";
import { FetchViewer } from "components/FetchViewer";
import { GenericSelector } from "../GenericSelector";
import CAViewer from "./CAViewer";
import React from "react";
import apicalls from "ducks/apicalls";
import { QueryParameters } from "ducks/services/api-client";

type Props = {
    limitSelection?: string[] // IDs
    onSelect: (item: Certificate | Certificate[] | undefined) => void
    value?: Certificate | Certificate[] | undefined
    label: string
    multiple: boolean
}

export const CASelector: React.FC<Props> = (props: Props) => {
    return (
        <FetchViewer
            fetcher={async () => { return apicalls.cas.getEngines(); }}
            renderer={(engines) => {
                return <GenericSelector
                    fetcher={async (query, controller) => {
                        let params: QueryParameters | undefined;
                        if (query !== "") {
                            params = {
                                filters: [`id=[contains]${query}`]
                            };
                        }

                        const resp = await apicalls.cas.getCAs(params);

                        let list: Certificate[] = resp.list;
                        if (props.limitSelection !== undefined) {
                            list = resp.list.filter(item => props.limitSelection?.includes(item.subject_key_id));
                        }

                        return new Promise<Certificate[]>(resolve => {
                            resolve(list);
                        });
                    }}
                    label={props.label}
                    multiple={props.multiple}
                    optionID={(item) => item.subject_key_id}
                    optionLabel={(item) => item.subject_key_id}
                    renderOption={(props, ca, selected) => (
                        <CAViewer elevation={false} caData={ca} engine={engines.find(eng => eng.id === ca.engine_id)!} />
                    )}
                    onSelect={(item) => {
                        props.onSelect(item);
                    }}
                    value={props.value}
                />;
            }}
        />
    );
};
