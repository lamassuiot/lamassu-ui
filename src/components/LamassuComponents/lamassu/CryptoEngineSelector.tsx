import React from "react";
import { FetchViewer } from "./FetchViewer";
import { CryptoEngine, getEngines } from "ducks/features/cav3/apicalls";
import { MenuItem } from "@mui/material";
import { CryptoEngineViewer } from "./CryptoEngineViewer";
import { Select } from "../dui/Select";

interface Props {
    label?: string
    multiple?: boolean,
    onSelect: (cert: CryptoEngine | CryptoEngine[]) => void;
    value?: CryptoEngine | CryptoEngine[]
}

export const CryptoEngineSelector: React.FC<Props> = ({ multiple = false, label = "Crypto Engine", onSelect, value }) => {
    return (
        <FetchViewer fetcher={() => getEngines()} renderer={(engines) => {
            return (
                <Select helperText="Select a Crypto Engine" label={label} onChange={(ev) => {
                    onSelect(engines.find(engine => engine.id === ev.target.value)!);
                }} value={value}>
                    {
                        engines.map((engine, idx) => (
                            <MenuItem key={idx} value={engine.id}>
                                <CryptoEngineViewer engine={engine}/>
                            </MenuItem>
                        ))
                    }
                </Select>
            );
        }} />
    );
};
