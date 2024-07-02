import { CertificateDecoder } from "./Certificates/CertificateDecoder";
import { Divider, useTheme } from "@mui/material";
import { TextField } from "components/TextField";
import { parseCRT } from "utils/crypto/crt";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";

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

    useEffect(() => {
        const run = async () => {
            if (crt) {
                try {
                    await parseCRT(crt);
                    onChange(crt);
                } catch (err) {
                    console.log(err);
                }
            }
        };
        run();
    }, [crt]);

    return (
        <Grid xs container spacing={1}>
            <Grid xs={12}>
                <TextField error={!crt} helperText="Certificate can not be empty" spellCheck={false} label="x509 PEM Certificate" value={crt} onChange={(ev) => setCrt(ev.target.value)} multiline placeholder={crtPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "500px", width: "100%" }} />
            </Grid>
            {
                crt && (
                    <>
                        <Grid xs={12}>
                            <Divider />
                        </Grid>
                        <Grid xs={12}>
                            <CertificateDecoder crtPem={crt} />
                        </Grid>
                    </>
                )
            }
        </Grid>
    );
};

export default CertificateImporter;
