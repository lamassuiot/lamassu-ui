import { CertificateAuthority } from "ducks/features/cas/models";
import { useTheme } from "@mui/system";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import apicalls from "ducks/apicalls";
import { MetadataInput } from "components/forms/MetadataInput";
import { enqueueSnackbar } from "notistack";
import { errorToString } from "ducks/services/api-client";

interface Props {
    caData: CertificateAuthority
    onMetadataChange: (metadata: { [key: string]: any }) => void
}

export const CAMetadata: React.FC<Props> = ({ caData, onMetadataChange }) => {
    const theme = useTheme();

    return (
        <Grid container sx={{ width: "100%" }} spacing={0} flexDirection={"column"}>
            <Grid container flexDirection={"column"}>
                <MetadataInput label="" value={caData.metadata} onChange={async (meta) => {
                    try {
                        await apicalls.cas.updateCAMetadata(caData.id, meta);
                        enqueueSnackbar("CA metadata updated", { variant: "success" });
                        onMetadataChange(meta);
                    } catch (e) {
                        const err = errorToString(e);
                        enqueueSnackbar(`Failed to update CA metadata: ${err}`, { variant: "error" });
                    }
                }} />
            </Grid>
        </Grid>
    );
};
