import React, { useEffect, useState } from "react";
import { TextField, TextFiledProps } from "./TextField";

interface TimedTextFiledProps extends Omit<TextFiledProps, "onChange"> {
    onChange?: (newChange: string) => void,
}

const TimedTextFiled: React.FC<TimedTextFiledProps> = ({ onChange, ...rest }) => {
    const [fastTypeQuery, setFastTypeQuery] = useState(rest.value);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onChange && typeof (fastTypeQuery) === "string") {
                onChange(fastTypeQuery);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [fastTypeQuery, onChange]);

    return <TextField {...rest} fullWidth={true} style={{ fontSize: "0.85rem" }} value={fastTypeQuery} onChange={(ev: any) => setFastTypeQuery(ev.target.value)} />;
};

export { TimedTextFiled }; export type { TimedTextFiledProps };
