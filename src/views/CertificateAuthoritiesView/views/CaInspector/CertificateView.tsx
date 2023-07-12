import { useAppSelector } from "ducks/hooks";
import React from "react";
import * as caSelector from "ducks/features/cas/reducer";
import { useTheme } from "@mui/system";
import { Grid } from "@mui/material";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";

interface Props {
    caName: string
}

export const CertificateView: React.FC<Props> = ({ caName }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const caData = useAppSelector((state) => caSelector.getCA(state, caName)!);
    const decodedCert = window.atob(caData.certificate);

    return (
        <Grid item container sx={{ width: "100%" }} spacing={1}>
            <CodeCopier code={decodedCert} />
        </Grid>
    );
};
