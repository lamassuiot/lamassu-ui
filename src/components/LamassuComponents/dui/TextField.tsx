import { FilledInput, FilledInputProps, useTheme } from "@mui/material";
import React from "react";
import { KeyValueLabel } from "./KeyValueLabel";
import { pSBC } from "components/utils/colors";
import Label from "./typographies/Label";

interface TextFiledProps extends FilledInputProps {
    label: string,
    tooltip?: string | React.ReactNode,
    helperText?: string | React.ReactNode,
}

const TextField: React.FC<TextFiledProps> = ({ label, tooltip, helperText, ...rest }) => {
    const theme = useTheme();
    return (
        <KeyValueLabel label={label} tooltip={tooltip} value={
            <>
                <FilledInput {...rest} {...rest.error && {
                    // endAdornment: <CancelRoundedIcon sx={{ color: theme.palette.error.main }} />,
                    sx: { ...rest.sx, background: pSBC(theme.palette.mode === "dark" ? -0.7 : 0.5, theme.palette.error.main) }
                }} />
                <>
                    {
                        helperText && rest.error && (
                            typeof helperText === "string"
                                ? (
                                    <Label sx={{ color: theme.palette.error.main }}>{helperText}</Label>
                                )
                                : (
                                    { helperText }
                                )
                        )
                    }
                </>
            </>
        } />
    );
};

export { TextField }; export type { TextFiledProps };
