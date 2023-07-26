import { Divider, Grid, useTheme } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import React, { useEffect, useState } from "react";
import CertificateDecoder from "./CertificateDecoder";
import { parseCRT } from "components/utils/cryptoUtils/crt";

const crtPlaceHolder = `-----BEGIN CERTIFICATE REQUEST-----
MIIBNzCB3QIBADBTMVEwCQYDVQQLEwJJVDAUBgNVBAoTDUxLUyAtIElrZXJsYW4w
CQYDVQQGEwJFUzAPBgNVBAgTCEdpcHV6a29hMBIGA1UEAxMLTGFtYXNzdSBJb1Qw
WTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAT9GpFufUkIQ0JBFVhN55diPm/UWamx
YwDMAxw/TmgX6aBFzbsJOc8GIqyIzUxUWSdAo32OGrfnCfQza6DHmy2JoCgwJgYJ
KoZIhvcNAQkOMRkwFzAVBgNVHREEDjAMggpsYW1hc3N1LmlvMAoGCCqGSM49BAMC
A0kAMEYCIQCrBQ/UOec1aHPeKE962EvIvzqZitQAeSf6yCzElTZ9IAIhALUMuz+0
C3Rzdw39eIksMyCphq82zihsSZpa8pZPWz6v
-----END CERTIFICATE REQUEST-----`;

interface CertificateImporterProps {
    onChange: (crt: string) => void
}

const CertificateImporter: React.FC<CertificateImporterProps> = ({ onChange }) => {
    const theme = useTheme();

    const [crt, setCrt] = useState<string | undefined>();

    // const validateCertWithKey = () => {
    //     if (!crt || !privKey) {
    //         return false;
    //     }

    //     const certificate = pkijs.Certificate.fromBER(fromPEM(crt));
    //     const privateKey = pkijs.PrivateKeyInfo.fromBER(fromPEM(privKey));

    //     // Get the public key values from the private key and certificate
    //     const privateKeyPublicValue = privateKey.publicKey;
    //     const certificatePublicValue = certificate.subjectPublicKeyInfo.subjectPublicKey;

    //     // Compare the public key values to check if they match
    //     const privateKeyMatchesCertificate = privateKeyPublicValue.isEqual(certificatePublicValue);
    // };

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
        <Grid item xs container spacing={1}>
            <Grid item xs={12}>
                <TextField error={!crt} helperText="Certificate can not be empty" spellCheck={false} label="x509 PEM Certificate" value={crt} onChange={(ev) => setCrt(ev.target.value)} multiline placeholder={crtPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "500px", width: "100%" }} />
            </Grid>
            {
                crt && (
                    <>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <CertificateDecoder crtPem={crt} />
                        </Grid>
                    </>
                )
            }
        </Grid>
    );
};

export default CertificateImporter;
