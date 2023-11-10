import React from "react";
import { FetchViewer } from "./FetchViewer";
import { getEngines } from "ducks/features/cav3/apicalls";
import { Alert } from "@mui/material";
import { CryptoEngine } from "ducks/features/cav3/models";
import { CryptoEngineViewer, CryptoEngineViewerProps } from "./CryptoEngineViewer";

interface Props extends Omit<CryptoEngineViewerProps, "engine"> {
    engineID?: string,
    defaultEngine?: boolean
}

export const CryptoEngineFetchViewer: React.FC<Props> = ({ engineID, defaultEngine = false, ...rest }) => {
    return (
        <FetchViewer fetcher={() => getEngines()} renderer={(engines) => {
            let engine: CryptoEngine | undefined;
            if (defaultEngine) {
                engine = engines.find(engine => engine.default);
            } else {
                engine = engines.find(engine => engine.id === engineID);
            }

            if (engine) {
                return (
                    <CryptoEngineViewer engine={engine} {...rest} />
                );
            }
            return (
                <Alert severity="warning">
                    {`Could not find engine "${engineID}"`}
                </Alert>
            );
        }} />

    );
};
