import { Certificate } from "ducks/features/cas/models";
import { FetchHandle } from "components/FetchViewer";
import React, { ReactElement, Ref } from "react";
import { CertificateCustomFetchViewer } from "./CertificateCustomFetchViewer";
import { CertificateViewer } from "./CertificateViewer";

type Props = {
    sn: string
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    return (
        <CertificateCustomFetchViewer
            ref={ref}
            renderer={(item: Certificate) => (
                <CertificateViewer certificate={item} />
            )}
            sn={props.sn}
        />
    );
};

export const CertificateStandardFetchViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
