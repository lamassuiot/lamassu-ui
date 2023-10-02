import React from "react";
import { CertificateAuthority, CryptoEngine, getCAs, getEngines } from "ducks/features/cav3/apicalls";
import { GenericSelector } from "./GenericSelector";
import CAViewer from "./CAViewer";
import { FetchViewer } from "./FetchViewer";

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
                    fetcher={async () => {
                        const casResp = await getCAs();
                        return new Promise<CertificateAuthority[]>(resolve => {
                            resolve(casResp.list);
                        });
                    }}
                    label={props.label}
                    selectLabel={props.selectLabel}
                    multiple={props.multiple}
                    filterKeys={["id", "subject.common_name"]}
                    optionID={(ca) => ca.id}
                    optionRenderer={(ca) => <CAViewer caData={ca} engine={engines.find(eng => eng.id === ca.engine_id)!} elevation={false}/>}
                    onSelect={(ca) => { console.log(ca); props.onSelect(ca); }}
                    value={props.value} />
            );
        }}
    />;
};

export default CASelectorV2;
