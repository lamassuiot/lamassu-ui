import React from "react";
import { getCAs, getEngines } from "ducks/features/cav3/apicalls";
import { GenericSelector } from "./GenericSelector";
import CAViewer from "./CAViewer";
import { FetchViewer } from "./FetchViewer";
import { FieldType } from "components/FilterInput";
import { CertificateAuthority, CryptoEngine } from "ducks/features/cav3/models";

type Props = {
    onSelect: (ca: CertificateAuthority | CertificateAuthority[]) => void
    value?: CertificateAuthority | CertificateAuthority[]
    label: string
    selectLabel: string
    multiple: boolean
}

const CASelectorV2: React.FC<Props> = (props: Props) => {
    return <FetchViewer
        fetcher={() => getEngines()}
        errorPrefix={"Could not fetch engines"}
        renderer={(engines: CryptoEngine[]) => {
            return (
                <GenericSelector
                    searchBarFilterKey="id"
                    filtrableProps={[
                        { key: "id", label: "CA ID", type: FieldType.String },
                        { key: "status", label: "Status", type: FieldType.Enum, fieldOptions: ["ACTIVE", "EXPIRED", "REVOKED"] },
                        { key: "valid_to", label: "Expires At", type: FieldType.Date },
                        { key: "valid_from", label: "Valid From", type: FieldType.Date }
                    ]}
                    fetcher={async (filters) => {
                        const casResp = await getCAs({
                            limit: 25,
                            bookmark: "",
                            filters: filters.map(filter => { return `${filter.propertyField.key}[${filter.propertyOperator}]${filter.propertyValue}`; }),
                            sortField: "",
                            sortMode: "asc"
                        });
                        return new Promise<CertificateAuthority[]>(resolve => {
                            resolve(casResp.list);
                        });
                    }}
                    label={props.label}
                    selectLabel={props.selectLabel}
                    multiple={props.multiple}
                    optionID={(ca) => ca.id}
                    optionRenderer={(ca) => <CAViewer caData={ca} engine={engines.find(eng => eng.id === ca.engine_id)!} elevation={false} />}
                    onSelect={(ca) => { console.log(ca); props.onSelect(ca); }}
                    value={props.value} />
            );
        }}
    />;
};

export default CASelectorV2;
