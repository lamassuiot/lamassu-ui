import { Divider, Grid, useTheme } from "@mui/material";
import React, { useState } from "react";
import CSRDecoder from "./CSRDecoder";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { TextField } from "components/LamassuComponents/dui/TextField";

const csrPlaceHolder = `-----BEGIN CERTIFICATE REQUEST-----
MIIBNzCB3QIBADBTMVEwCQYDVQQLEwJJVDAUBgNVBAoTDUxLUyAtIElrZXJsYW4w
CQYDVQQGEwJFUzAPBgNVBAgTCEdpcHV6a29hMBIGA1UEAxMLTGFtYXNzdSBJb1Qw
WTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAT9GpFufUkIQ0JBFVhN55diPm/UWamx
YwDMAxw/TmgX6aBFzbsJOc8GIqyIzUxUWSdAo32OGrfnCfQza6DHmy2JoCgwJgYJ
KoZIhvcNAQkOMRkwFzAVBgNVHREEDjAMggpsYW1hc3N1LmlvMAoGCCqGSM49BAMC
A0kAMEYCIQCrBQ/UOec1aHPeKE962EvIvzqZitQAeSf6yCzElTZ9IAIhALUMuz+0
C3Rzdw39eIksMyCphq82zihsSZpa8pZPWz6v
-----END CERTIFICATE REQUEST-----`;

interface CSRImporterProps {
    onCreate: (csr: string) => void
}

const CSRImporter: React.FC<CSRImporterProps> = ({ onCreate }) => {
    const theme = useTheme();

    const [csr, setCsr] = useState<string | undefined>();

    return (
        <Grid container spacing={1} sx={{ minWidth: "475px" }}>
            <Grid item xs={12}>
                <TextField label="Paste CSR" value={csr} onChange={(ev) => setCsr(ev.target.value)} multiline placeholder={csrPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem" }} />
            </Grid>
            {
                csr && (
                    <>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <CSRDecoder csr={csr} />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <MonoChromaticButton onClick={() => onCreate(csr)}>Confirm</MonoChromaticButton>
                        </Grid>
                    </>
                )
            }
        </Grid >
    );
};

export default CSRImporter;
