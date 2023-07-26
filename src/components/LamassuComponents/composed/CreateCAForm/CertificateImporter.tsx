import { Divider, Grid, useTheme } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import React, { useEffect, useState } from "react";
import CertificateDecoder from "./CertificateDecoder";
import { parseCRT } from "components/utils/cryptoUtils/crt";

const crtPlaceHolder = `-----BEGIN CERTIFICATE-----
MIIBNzCB3QIBADBTMVEwCQYDVQQLEwJJVDAUBgNVBAoTDUxLUyAtIElrZXJsYW4w
CQYDVQQGEwJFUzAPBgNVBAgTCEdpcHV6a29hMBIGA1UEAxMLTGFtYXNzdSBJb1Qw
WTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAT9GpFufUkIQ0JBFVhN55diPm/UWamx
YwDMAxw/TmgX6aBFzbsJOc8GIqyIzUxUWSdAo32OGrfnCfQza6DHmy2JoCgwJgYJ
KoZIhvcNAQkOMRkwFzAVBgNVHREEDjAMggpsYW1hc3N1LmlvMAoGCCqGSM49BAMC
A0kAMEYCIQCrBQ/UOec1aHPeKE962EvIvzqZitQAeSf6yCzElTZ9IAIhALUMuz+0
C3Rzdw39eIksMyCphq82zihsSZpa8pZPWz6v
-----END CERTIFICATE-----`;

interface CertificateImporterProps {
    onChange: (crt: string | undefined) => void
}

const CertificateImporter: React.FC<CertificateImporterProps> = ({ onChange }) => {
    const theme = useTheme();

    const [crt, setCrt] = useState<string | undefined>();

    const [isValid, setIsValid] = useState<boolean>(false);

    useEffect(() => {
        const run = async () => {
            if (crt !== undefined) {
                try {
                    await parseCRT(crt);
                    setIsValid(true);
                    onChange(crt);
                } catch (err) {
                    console.log(err);
                    setIsValid(false);
                    onChange(undefined);
                }
            }
        };

        run();
    }, [crt]);

    return (
        <Grid item xs container spacing={1}>
            <Grid item xs={12}>
                <TextField label="x509 PEM Certificate" value={crt} onChange={(ev) => setCrt(ev.target.value)} multiline placeholder={crtPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "500px", width: "100%" }} />
            </Grid>
            {
                crt && (
                    <>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <CertificateDecoder crt={crt} />
                        </Grid>
                    </>
                )
            }
        </Grid>
    );
};

export default CertificateImporter;
