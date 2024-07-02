import { Certificate } from "ducks/features/cas/models";
import { CodeCopier } from "components/CodeCopier";
import { useTheme } from "@mui/system";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";

interface Props {
    certificate: Certificate
}

export const CertificateView: React.FC<Props> = ({ certificate }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const decodedCert = window.window.atob(certificate.certificate);

    return (
        <Grid container sx={{ width: "100%" }} spacing={1}>
            <CodeCopier code={decodedCert} enableDownload downloadFileName={certificate.subject.common_name + ".crt"}/>
        </Grid>
    );
};
