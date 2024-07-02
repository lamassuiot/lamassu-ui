import { CryptoEngine } from "ducks/features/cas/models";
import { CryptoEngineViewer } from "./CryptoEngineViewer";
import { GenericSelector } from "components/GenericSelector";
import React from "react";
import apicalls from "ducks/apicalls";

type Props = {
    onSelect: (engine: CryptoEngine | CryptoEngine[] | undefined) => void
    value?: CryptoEngine | CryptoEngine[]
}

const CryptoEngineSelector: React.FC<Props> = (props: Props) => {
    return <GenericSelector
        fetcher={() => apicalls.cas.getEngines()}
        label="Crypto Engine"
        multiple={false}
        optionID={(engine) => engine.id}
        optionLabel={(engine) => engine.name}
        renderOption={(props, engine, selected) => (
            <CryptoEngineViewer engine={engine} />
        )}
        onSelect={(engine) => { props.onSelect(engine); }}
        value={props.value}
    />;
};

export default CryptoEngineSelector;
