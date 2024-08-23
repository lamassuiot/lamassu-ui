import { Certificate } from "ducks/features/cas/models";
import { FetchHandle, FetchViewer } from "components/FetchViewer";
import { Typography } from "@mui/material";
import React, { ReactElement, Ref } from "react";
import apicalls from "ducks/apicalls";

type Props = {
    sn: string
    renderer: (item: Certificate) => React.ReactElement
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    if (props.sn === "") {
        return <Typography sx={{ fontStyle: "italic" }}>Unspecified</Typography>;
    }

    return (
        <FetchViewer
            fetcher={(controller) => { return apicalls.cas.getCertificate(props.sn); }}
            renderer={(item: Certificate) => props.renderer(item)}
            ref={ref}
        />
    );
};

export const CertificateCustomFetchViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
