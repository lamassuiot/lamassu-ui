// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Select as MuiSelect, BaseSelectProps as MuiSelectProps } from "@mui/material";
import { TextField } from "./TextField";
import { grey } from "@mui/material/colors";
import React from "react";

interface SelectProps extends MuiSelectProps {
    label: string
}

const Select: React.FC<SelectProps> = ({ ...rest }) => {
    return (
        <MuiSelect
            {...rest}
            input={<TextField label={rest.label} style={{ background: grey[300], paddingLeft: "10px", borderRadius: "3px", fontSize: 14 }}/>}>
        </MuiSelect>
    );
};

export { Select }; export type { SelectProps };
