import React from "react";
import * as caApicalls from "ducks/features/cav3/apicalls";
import CAViewer, { Props as CAViewerProps } from "./CAViewer";
import { FetchViewer } from "./FetchViewer";
import { CertificateAuthority, CryptoEngine } from "ducks/features/cav3/models";

interface Props extends Omit<CAViewerProps, "caData" | "engine"> {
    caName: string,
}

const CAFetchViewer: React.FC<Props> = ({ caName, ...props }) => {
    return <FetchViewer
        fetcher={() => Promise.all([caApicalls.getCA(caName), caApicalls.getEngines()])}
        errorPrefix={`Could not fetch CA "${caName}"`}
        renderer={(item: [CertificateAuthority, CryptoEngine[]]) => {
            const ca = item[0];
            const engine = item[1].find(eng => ca.engine_id === eng.id)!;
            return (
                <CAViewer {...props} caData={ca} engine={engine} />
            );
        }} />;
};

export default CAFetchViewer;
