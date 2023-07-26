import React from "react";
import { CertificateAuthority } from "ducks/features/cas/models";
import * as caApicalls from "ducks/features/cas/apicalls";
import CAViewer, { Props as CAViewerProps } from "./CAViewer";
import { FetchViewer } from "./FetchViewer";

interface Props extends Omit<CAViewerProps, "caData"> {
    caName: string,
}

const CAFetchViewer: React.FC<Props> = ({ caName, ...props }) => {
    return <FetchViewer fetcher={() => caApicalls.getCA(caName)} errorPrefix={`Could not fetch CA "${caName}"`} renderer={(ca: CertificateAuthority) => {
        return (
            <CAViewer {...props} caData={ca} />
        );
    }} />;
};

export default CAFetchViewer;
