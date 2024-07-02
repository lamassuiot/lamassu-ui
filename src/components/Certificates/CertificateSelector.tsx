import { CACustomFetchViewer } from "components/CAs/CACustomFetchViewer";
import { Certificate } from "ducks/features/cas/models";
import { CertificateViewer } from "./CertificateViewer";
import { GenericSelector } from "../GenericSelector";
import { QueryParameters } from "ducks/services/api-client";
import React from "react";
import apicalls from "ducks/apicalls";

type Props = {
    limitSelection?: string // CNs
    onSelect: (item: Certificate | Certificate[] | undefined) => void
    value?: Certificate | Certificate[]
    label: string
    multiple: boolean
}

export const CertificateSelector: React.FC<Props> = (props: Props) => {
    return (
        <GenericSelector
            fetcher={async (query, controller) => {
                let params : QueryParameters = {};
                if (props.limitSelection !== undefined) {
                    params = {
                        ...params,
                        filters: ["subject.common_name[equal]" + props.limitSelection]
                    };
                }

                const resp = await apicalls.cas.getCertificates(params);

                const list: Certificate[] = resp.list;

                return new Promise<Certificate[]>(resolve => {
                    resolve(list);
                });
            }}
            label={props.label}
            multiple={props.multiple}
            optionID={(item) => item.serial_number}
            optionLabel={(item) => item.serial_number}
            onSelect={(item) => {
                props.onSelect(item);
            }}
            renderOption={(props, cert, selected) => (
                <CACustomFetchViewer
                    id={cert.issuer_metadata.id}
                    renderer={(ca) => {
                        return <CertificateViewer certificate={cert} issuerCA={ca} />;
                    }}

                />
            )}
            value={props.value}
        />
    );
};
