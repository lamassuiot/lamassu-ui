import React from "react";
import { getCAs, getEngines } from "ducks/features/cav3/apicalls";
import { GenericSelector } from "./GenericSelector";
import CAViewer from "./CAViewer";
import { FetchViewer } from "./FetchViewer";
import { CertificateAuthority, CryptoEngine, casFilters } from "ducks/features/cav3/models";

type Props = {
    limitSelection?:string[] // CA IDs
    onSelect: (ca: CertificateAuthority | CertificateAuthority[] | undefined) => void
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
                    filtrableProps={casFilters}
                    fetcher={async (filters) => {
                        const casResp = await getCAs({
                            limit: 25,
                            bookmark: "",
                            filters: filters.map(filter => { return `${filter.propertyField.key}[${filter.propertyOperator}]${filter.propertyValue}`; }),
                            sortField: "",
                            sortMode: "asc"
                        });

                        let cas = casResp.list;
                        if (props.limitSelection !== undefined) {
                            cas = cas.filter(ca => props.limitSelection?.includes(ca.id));
                        }

                        return new Promise<CertificateAuthority[]>(resolve => {
                            resolve(cas);
                        });
                    }}
                    label={props.label}
                    selectLabel={props.selectLabel}
                    multiple={props.multiple}
                    optionID={(ca) => ca.id}
                    optionRenderer={(ca) => <CAViewer caData={ca} engine={engines.find(eng => eng.id === ca.engine_id)!} elevation={false} />}
                    onSelect={(ca) => { props.onSelect(ca); }}
                    value={props.value} />
            );
        }}
    />;
};

export default CASelectorV2;
