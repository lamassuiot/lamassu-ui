import { CertificateAuthority } from "ducks/features/cas/models";
import { FetchHandle, FetchViewer } from "components/FetchViewer";
import { Typography } from "@mui/material";
import React, { ReactElement, Ref, useEffect } from "react";
import apicalls from "ducks/apicalls";

type Props = {
    id: string
    renderer: (item: CertificateAuthority) => React.ReactElement
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    if (props.id === "") {
        return <Typography sx={{ fontStyle: "italic" }}>Unspecified</Typography>;
    }

    useEffect(() => {
        // @ts-ignore
        if (ref && ref.current) {
            // @ts-ignore
            ref.current.refresh();
        }
    }, [props.id]);

    return (
        <FetchViewer
            fetcher={(controller) => { return apicalls.cas.getCA(props.id); }}
            renderer={(item: CertificateAuthority) => props.renderer(item)}
            ref={ref}
        />
    );
};

export const CACustomFetchViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
