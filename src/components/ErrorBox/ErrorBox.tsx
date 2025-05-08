import { Alert, Box, Paper } from "@mui/material";
import { errorToString } from "ducks/services/api-client";
import React, { useEffect } from "react";

interface ErrorBoxProps {
    error?: any;
    errorPrefix?: string;
}

export const ErrorBox:React.FC<ErrorBoxProps> = ({ error, errorPrefix }) => {
    const [err, setErr] = React.useState<any | undefined>(undefined);

    useEffect(() => {
        if (error) {
            setErr(errorToString(error));
        }
    }, [error]);

    return (
        <Box component={Paper} sx={{ padding: 2, margin: 2 }}>
            <Alert severity="error">
                { errorPrefix || "Could not fetch" }
                { typeof err === "string" &&
                    err.length > 1 &&
                    <>: {err}</>
                }

            </Alert>
        </Box>
    );
};
