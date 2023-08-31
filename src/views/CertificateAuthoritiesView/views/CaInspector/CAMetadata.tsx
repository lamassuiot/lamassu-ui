import React from "react";
import { useTheme } from "@mui/system";
import { Grid } from "@mui/material";
import { CertificateAuthority, updateMetadata } from "ducks/features/cav3/apicalls";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { MultiKeyValueInput } from "components/LamassuComponents/dui/MultiKeyValueInput";

interface Props {
    caData: CertificateAuthority
}

export const CAMetadata: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();

    return (
        <Grid item container sx={{ width: "100%" }} spacing={0} flexDirection={"column"}>
            <Grid item>
                <SubsectionTitle>Metadata</SubsectionTitle>
            </Grid>
            <Grid item container flexDirection={"column"}>
                <MultiKeyValueInput label="" value={caData.metadata} onChange={(meta) => {
                    updateMetadata(caData.id, meta);
                }} />
            </Grid>
        </Grid >
    );
};
