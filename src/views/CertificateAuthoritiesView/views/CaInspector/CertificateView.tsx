import React from "react";
import { useTheme } from "@mui/system";
import { Grid } from "@mui/material";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { Certificate } from "ducks/features/cav3/models";

interface Props {
    certificate: Certificate
}

export const CertificateView: React.FC<Props> = ({ certificate }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const decodedCert = window.window.atob(certificate.certificate);

    return (
        <Grid item container sx={{ width: "100%" }} spacing={1}>
            <CodeCopier code={decodedCert} enableDownload downloadFileName={certificate.subject.common_name + ".crt"}/>
        </Grid>
    );
};
