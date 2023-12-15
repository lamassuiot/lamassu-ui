import React from "react";
import { getCertificates } from "ducks/features/cav3/apicalls";
import { GenericSelector } from "./GenericSelector";
import { Certificate, certificateFilters } from "ducks/features/cav3/models";
import CertificateViewer from "./CertificateViewer";
import { Filter } from "components/FilterInput";

type Props = {
    onSelect: (ca: Certificate | Certificate[] | undefined) => void
    value?: Certificate | Certificate[]
    label: string
    selectLabel: string
    multiple: boolean
    filters?: Filter[]
}

export const CertificateSelector: React.FC<Props> = (props: Props) => {
    return (
        <GenericSelector
            searchBarFilterKey="serial_number"
            filtrableProps={certificateFilters}
            filters={props.filters}
            fetcher={async (filters) => {
                const casResp = await getCertificates({
                    limit: 25,
                    bookmark: "",
                    filters: filters.map(filter => { return `${filter.propertyField.key}[${filter.propertyOperator}]${filter.propertyValue}`; }),
                    sortField: "",
                    sortMode: "asc"
                });

                const certs = casResp.list;

                return new Promise<Certificate[]>(resolve => {
                    resolve(certs);
                });
            }}
            label={props.label}
            selectLabel={props.selectLabel}
            multiple={props.multiple}
            optionID={(cert) => cert.serial_number}
            optionRenderer={(cert) => <CertificateViewer elevation={false} certificate={cert}/>}
            onSelect={(cert) => { props.onSelect(cert); }}
            value={props.value} />
    );
};
