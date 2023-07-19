import React from "react";
import { Grid, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CAImporter } from "components/LamassuComponents/composed/CreateCAForm/CAImporter";

export const ImportCA = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Grid container>
            <Grid item>
                <CAImporter onCreate={(crt, key) => console.log(crt, key) }/>
            </Grid>
        </Grid>
    );
};
