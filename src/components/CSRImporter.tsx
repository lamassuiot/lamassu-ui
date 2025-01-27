import { Button, Divider, useTheme } from "@mui/material";
import { CSRDecoder } from "./CSRViewer";
import { TextField } from "components/TextField";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState } from "react";
import { Profile } from "ducks/features/cas/models";
import { IssuanceProfile } from "./IssuanceProfile";

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
    onCreate: (csr: string, profile: Profile) => void
}

const CSRImporter: React.FC<CSRImporterProps> = ({ onCreate }) => {
    const theme = useTheme();

    const [csr, setCsr] = useState<string | undefined>();
    const [profile, setProfile] = useState<Profile | undefined>();

    return (
        <Grid container spacing={1} sx={{ minWidth: "475px" }}>
            <Grid xs={12} container spacing={2} padding={2}>
                <IssuanceProfile onChange={(profile) => setProfile(profile)} />
            </Grid>
            <Grid xs={12}>
                <TextField label="Paste CSR" value={csr} onChange={(ev) => setCsr(ev.target.value)} multiline placeholder={csrPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem" }} />
            </Grid>
            {
                csr && (
                    <>
                        <Grid xs={12}>
                            <Divider />
                        </Grid>
                        <Grid xs={12}>
                            <CSRDecoder csr={csr} />
                        </Grid>
                        <Grid xs={12}>
                            <Divider />
                        </Grid>
                        <Grid xs={12}>
                            <Button onClick={() => onCreate(csr, profile!)}>Confirm</Button>
                        </Grid>
                    </>
                )
            }
        </Grid>
    );
};

export default CSRImporter;
