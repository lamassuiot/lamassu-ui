import { CertificateAuthority } from "ducks/features/cas/models";
import { FetchViewer } from "components/FetchViewer";
import { GenericSelector } from "../GenericSelector";
import CAViewer from "./CAViewer";
import React from "react";
import apicalls from "ducks/apicalls";
import { QueryParameters } from "ducks/services/api-client";

type Props = {
    limitSelection?: string[] // IDs
    onSelect: (item: CertificateAuthority | CertificateAuthority[] | undefined) => void
    value?: CertificateAuthority | CertificateAuthority[] | undefined
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

                        let list: CertificateAuthority[] = resp.list;
                        if (props.limitSelection !== undefined) {
                            list = resp.list.filter(item => props.limitSelection?.includes(item.id));
                        }

                        return new Promise<CertificateAuthority[]>(resolve => {
                            resolve(list);
                        });
                    }}
                    label={props.label}
                    multiple={props.multiple}
                    optionID={(item) => item.id}
                    optionLabel={(item) => item.id}
                    renderOption={(props, ca, selected) => (
                        <CAViewer elevation={false} caData={ca} engine={engines.find(eng => eng.id === ca.certificate.engine_id)!} />
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
