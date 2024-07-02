import { FilledInput, FilledInputProps, Typography, useTheme } from "@mui/material";
import { KeyValueLabel } from "./KeyValue";
import React from "react";

export interface TextFieldProps extends FilledInputProps {
    label: string,
    tooltip?: string | React.ReactNode,
    helperText?: string | React.ReactNode,
}

const TextField: React.FC<TextFieldProps> = ({ label, tooltip, helperText, ...rest }) => {
    const theme = useTheme();
    return (
        <KeyValueLabel label={label} tooltip={tooltip} value={
            <>
                <FilledInput {...rest} {...rest.error && {
                    // endAdornment: <CancelRoundedIcon sx={{ color: theme.palette.error.main }} />,
                    sx: { ...rest.sx }
                }} />
                <>
                    {
                        helperText && rest.error && (
                            typeof helperText === "string"
                                ? (
                                    <Typography sx={{ color: theme.palette.error.main }}>{helperText}</Typography>
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

export { TextField };
