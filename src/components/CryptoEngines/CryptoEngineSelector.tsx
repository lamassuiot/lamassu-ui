import { CryptoEngine } from "ducks/features/cas/models";
import { CryptoEngineViewer } from "./CryptoEngineViewer";
import { GenericSelector } from "components/GenericSelector";
import React from "react";
import useCachedEngines from "components/cache/cachedEngines";

type Props = {
    onSelect: (engine: CryptoEngine | CryptoEngine[] | undefined) => void
    value?: CryptoEngine | CryptoEngine[]
}

const CryptoEngineSelector: React.FC<Props> = (props: Props) => {
    const { getEnginesData } = useCachedEngines();

    return (
        <GenericSelector
            fetcher={() => getEnginesData()}
            label="Crypto Engine"
            multiple={false}
            optionID={(engine) => engine.id}
            optionLabel={(engine) => engine.name}
            renderOption={(_props, engine, _selected) => (
                <CryptoEngineViewer engine={engine} />
            )}
            onSelect={(engine) => { props.onSelect(engine); }}
            value={props.value}
        />
    );
};

export default CryptoEngineSelector;
