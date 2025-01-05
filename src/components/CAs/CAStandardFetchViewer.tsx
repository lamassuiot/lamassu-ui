import { CACustomFetchViewer } from "./CACustomFetchViewer";
import { FetchHandle, FetchViewer } from "components/FetchViewer";
import CAViewer, { Props as CAProps } from "./CAViewer";
import React, { ReactElement, Ref } from "react";
import apicalls from "ducks/apicalls";

interface Props extends Omit<CAProps, "caData" | "engine"> {
    id: string
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    return <CACustomFetchViewer
        id={props.id}
        renderer={(ca) => {
            return <FetchViewer
                fetcher={() => apicalls.cas.getEngines()}
                renderer={(engines) => {
                    const engine = engines.find(eng => eng.id === ca.certificate.engine_id);
                    if (engine) {
                        return <CAViewer {...props} caData={ca} engine={engine} />;
                    }
                    return <>could not fetch engine</>;
                }}
            />;
        }}
    />;
};

export const CAFetchViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
