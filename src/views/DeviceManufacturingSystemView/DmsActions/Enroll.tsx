import React, { useState } from "react";

import { Grid, useTheme } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";

export const DmsList = () => {
    const theme = useTheme();

    const [dms, setDMS] = useState<string | undefined>();
    const [crt, setCrt] = useState<string | undefined>();
    const [key, setKey] = useState<string | undefined>();

    return (
        <Grid container>
            <Grid item xs={6}>
                <TextField label="dms" multiline value={dms} onChange={(ev) => setDMS(ev.target.value)} />
            </Grid>
            <Grid item xs={6}>
                <TextField label="crt" multiline value={crt} onChange={(ev) => setCrt(ev.target.value)} />
            </Grid>
            <Grid item xs={6}>
                <TextField label="key" multiline value={key} onChange={(ev) => setKey(ev.target.value)} />
            </Grid>
            <Grid item xs={12}>
                <MonoChromaticButton onClick={() => {}}>Enroll</MonoChromaticButton>
            </Grid>
        </Grid>
    );
};
