import { CACustomFetchViewer } from "./CACustomFetchViewer";
import { FetchHandle, FetchViewer } from "components/FetchViewer";
import { SxProps } from "@mui/material";
import CAViewer from "./CAViewer";
import React, { ReactElement, Ref } from "react";
import apicalls from "ducks/apicalls";

type Props = {
    id: string
    sx?: SxProps
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    return <CACustomFetchViewer
        id={props.id}
        renderer={(ca) => {
            return <FetchViewer
                fetcher={() => apicalls.cas.getEngines()}
                renderer={(engines) => {
                    const engine = engines.find(eng => eng.id === ca.engine_id);
                    if (engine) {
                        return <CAViewer caData={ca} engine={engine} sx={props.sx} />;
                    }
                    return <>could not fetch engine</>;
                }}
            />;
        }}
    />;
};

export const CAFetchViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
