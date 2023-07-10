import { FilledInput, FilledInputProps } from "@mui/material";
import React from "react";
import { KeyValueLabel } from "./KeyValueLabel";

interface TextFiledProps extends FilledInputProps {
    label: string,
    tooltip?: string | React.ReactNode,
}

const TextField: React.FC<TextFiledProps> = ({ label, tooltip, ...rest }) => {
    return (
        <KeyValueLabel label={label} tooltip={tooltip} value={
            <FilledInput {...rest}/>
        }/>
    );
};

export { TextField }; export type { TextFiledProps };
