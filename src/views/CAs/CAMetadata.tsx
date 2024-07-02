import { CertificateAuthority } from "ducks/features/cas/models";
import { MultiKeyValueInput } from "components/forms/MultiKeyValue";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import apicalls from "ducks/apicalls";
import deepEqual from "fast-deep-equal/es6";

interface Props {
    caData: CertificateAuthority
}

export const CAMetadata: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();

    return (
        <Grid container sx={{ width: "100%" }} spacing={0} flexDirection={"column"}>
            <Grid>
                <Typography>Metadata</Typography>
            </Grid>
            <Grid container flexDirection={"column"}>
                <MultiKeyValueInput label="" value={caData.metadata} onChange={async (meta) => {
                    if (!deepEqual(caData.metadata, meta)) {
                        await apicalls.cas.updateCAMetadata(caData.id, meta);
                    }
                }} />
            </Grid>
        </Grid>
    );
};
