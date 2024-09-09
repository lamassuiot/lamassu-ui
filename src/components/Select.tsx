// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Select as MuiSelect, BaseSelectProps as MuiSelectProps, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { TextField } from "./TextField";
import { grey } from "@mui/material/colors";
import React from "react";

interface SelectProps extends MuiSelectProps {
    label: string
    options: Array<{
        value: any,
        render: string | (() => React.ReactElement)
    }>
}

const Select: React.FC<SelectProps> = ({ ...rest }) => {
    const theme = useTheme();

    const isMobileScreen = useMediaQuery(theme.breakpoints.down("md"));
    return (
        <MuiSelect
            {...rest}
            {...(isMobileScreen ? { native: true } : {})}
            input={<TextField label={rest.label} style={{ background: grey[300], paddingLeft: "10px", borderRadius: "3px", fontSize: 14 }} />}>
            {
                isMobileScreen
                    ? (
                        rest.options.map((option) => (
                            <option key={option.value} value={option.value}>{typeof option.render === "string" ? option.render : option.value}</option>
                        ))
                    )
                    : (
                        rest.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {typeof option.render === "string" ? option.render : option.render()}
                            </MenuItem>
                        ))
                    )
            }
        </MuiSelect>
    );
};

export { Select }; export type { SelectProps };
