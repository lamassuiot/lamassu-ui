import React, { useEffect } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useAuth } from "react-oidc-context";
import { ColoredButton } from "components/LamassuComponents/ColoredButton";

export const LoggedOutView = () => {
    const auth = useAuth();
    const theme = useTheme();

    useEffect(() => {
        auth.removeUser();
    }, []);

    return (
        <Box sx={{ padding: "30px", width: "100%", height: "100%" }}>
            <Grid container alignItems={"center"} justifyContent={"center"} flexDirection={"column"} spacing={"10px"}>
                <Grid item>
                    <Typography>You are logged out</Typography>
                </Grid>
                <Grid item>
                    <ColoredButton customtextcolor={theme.palette.primary.main} customcolor={theme.palette.primary.light} variant="contained" color="primary" onClick={() => {
                        auth.signinRedirect();
                    }}>
                        Log In
                    </ColoredButton>
                </Grid>
            </Grid>
        </Box>
    );
};
