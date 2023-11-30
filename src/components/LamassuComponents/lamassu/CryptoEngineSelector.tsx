import React from "react";
import { getEngines } from "ducks/features/cav3/apicalls";
import { GenericSelector } from "./GenericSelector";
import { CryptoEngineViewer } from "./CryptoEngineViewer";
import { CryptoEngine } from "ducks/features/cav3/models";

type Props = {
    onSelect: (engine: CryptoEngine | CryptoEngine[] | undefined) => void
    value?: CryptoEngine | CryptoEngine[]
}

const CryptoEngineSelector: React.FC<Props> = (props: Props) => {
    return <GenericSelector
        searchBarFilterKey="id"
        filtrableProps={[]}
        fetcher={() => getEngines()}
        label="Crypto Engine"
        selectLabel="Select Crypto Engine"
        multiple={false}
        optionID={(engine) => engine.id}
        optionRenderer={(engine) => <CryptoEngineViewer engine={engine} withDebugMetadata />}
        onSelect={(engine) => { props.onSelect(engine); }}
        value={props.value}
    />;
};

export default CryptoEngineSelector;
