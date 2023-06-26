import { Select as MuiSelect, SelectProps as MuiSelectProps } from "@mui/material";
import React from "react";
import { TextField } from "./TextField";

interface SelectProps extends MuiSelectProps {
    label: string,
    tooltip?: string | React.ReactNode,
}

const Select: React.FC<SelectProps> = ({ label, tooltip, ...rest }) => {
    return (
        <MuiSelect
            {...rest}
            input={<TextField label={label} tooltip={tooltip}/>}>
        </MuiSelect>
    );
};

export { Select }; export type { SelectProps };
