import React from "react";
import { CryptoEngine, getEngines } from "ducks/features/cav3/apicalls";
import { GenericSelector } from "./GenericSelector";
import { CryptoEngineViewer } from "./CryptoEngineViewer";

type Props = {
    onSelect: (engine: CryptoEngine | CryptoEngine[]) => void
    value?: CryptoEngine | CryptoEngine[]
}

const CryptoEngineSelector: React.FC<Props> = (props: Props) => {
    return <GenericSelector
        fetcher={() => getEngines()}
        label="Crypto Engine"
        selectLabel="Select Crypto Engine"
        multiple={false}
        filterKeys={["id", "name", "provider", "type"]}
        optionID={(engine) => engine.id}
        optionRenderer={(engine) => <CryptoEngineViewer engine={engine} withDebugMetadata />}
        onSelect={(engine) => { console.log(engine); props.onSelect(engine); }}
        value={props.value}
    />;
};

export default CryptoEngineSelector;
