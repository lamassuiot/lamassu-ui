import { InputBase } from "@mui/material";
import React, { useEffect, useState } from "react";

interface Props {
    queryPlaceholder: string
    onChange: any
    waitTime?: number
}

export const TimedTextField: React.FC<Props> = ({ queryPlaceholder, onChange, waitTime = 1500 }) => {
    const [fastTypeQuery, setFastTypeQuery] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(fastTypeQuery);
        }, waitTime);

        return () => clearTimeout(timer);
    }, [fastTypeQuery]);

    return <InputBase fullWidth={true} style={{ color: "#555", fontSize: 14 }} placeholder={queryPlaceholder} value={fastTypeQuery} onChange={(ev) => setFastTypeQuery(ev.target.value)} />;
};
