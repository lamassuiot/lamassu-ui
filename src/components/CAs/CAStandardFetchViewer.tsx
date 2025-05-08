import { CACustomFetchViewer } from "./CACustomFetchViewer";
import { FetchHandle } from "components/FetchViewer";
import CAViewer, { Props as CAProps } from "./CAViewer";
import React, { ReactElement, Ref, useEffect } from "react";
import apicalls from "ducks/apicalls";
import { CryptoEngine } from "ducks/features/cas/models";

interface Props extends Omit<CAProps, "caData" | "engine"> {
    id: string
    engines?: CryptoEngine[]
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    const [engines, setEngines] = React.useState<CryptoEngine[]>();
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (!props.engines || props.engines.length === 0) {
            setLoading(true);
            apicalls.cas.getEngines()
                .then(setEngines)
                .finally(() => setLoading(false));
        } else {
            setEngines(props.engines);
        }
    }, [props.engines]);

    if (!engines && loading) return <>Loading engines...</>;
    if (!engines) return <>Could not load engines</>;

    return (
        <CACustomFetchViewer
            id={props.id}
            renderer={(ca) => {
                const engine = engines.find(eng => eng.id === ca.certificate.engine_id);
                if (engine) {
                    return <CAViewer {...props} caData={ca} engine={engine} />;
                }
                return <>Could not match engine</>;
            }}
        />
    );
};

export const CAFetchViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
