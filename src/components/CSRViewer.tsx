import { Alert, Chip, Divider, useTheme } from "@mui/material";
import { CodeCopier } from "./CodeCopier";
import { KeyValueLabel } from "./KeyValue";
import { X509 } from "utils/crypto/x509";
import { parseCSR } from "utils/crypto/csr";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";

interface CSRViewerProps {
    csr: string
}

export const CSRViewer: React.FC<CSRViewerProps> = ({ csr }) => {
    return (
        <Grid container spacing={1}>
            <Grid xs={12}>
                <CodeCopier code={csr} />
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
                    </>
                )
            }
        </Grid>
    );
};

interface CSRDecoderProps {
    csr: string
}

export const CSRDecoder: React.FC<CSRDecoderProps> = ({ csr }) => {
    const theme = useTheme();

    const [csrProps, setCsrProps] = useState<X509 | undefined>();
    const [isValidCSR, setIsValid] = useState<boolean>(false);

    useEffect(() => {
        const run = async () => {
            if (csr !== undefined) {
                try {
                    const csrInfo = await parseCSR(csr);
                    setCsrProps(csrInfo);
                    setIsValid(true);
                } catch (err) {
                    console.log(err);
                    setIsValid(false);
                }
            }
        };

        run();
    }, [csr]);

    return (
        <Grid container spacing={1}>
            {
                isValidCSR && (
                    <>
                        <Grid xs={12}>
                            <Alert severity="info">Decoded Certificate Request</Alert>
                        </Grid>
                        <Grid xs={6} container flexDirection={"column"} spacing={2}>
                            <Grid>
                                <KeyValueLabel label="Subject" value={
                                    <Grid container spacing={1}>
                                        <Grid>
                                            <Chip label={`CN = ${csrProps!.subject.cn}`} />
                                        </Grid>
                                        {
                                            csrProps!.subject.country && (
                                                <Grid>
                                                    <Chip label={`C = ${csrProps!.subject.country}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.state && (
                                                <Grid>
                                                    <Chip label={`ST = ${csrProps!.subject.state}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.city && (
                                                <Grid>
                                                    <Chip label={`L = ${csrProps!.subject.city}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.o && (
                                                <Grid>
                                                    <Chip label={`O = ${csrProps!.subject.o}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.ou && (
                                                <Grid>
                                                    <Chip label={`OU = ${csrProps!.subject.ou}`} />
                                                </Grid>
                                            )
                                        }
                                    </Grid>
                                } />
                            </Grid>
                            <Grid>
                                <KeyValueLabel label="Subject Alternative Name" value={
                                    <Grid container spacing={1}>
                                        {
                                            csrProps?.subjectAltName.dnss.map((dnsAltName: string, idx: number) => (
                                                <Grid key={idx}>
                                                    <Chip label={`DNS = ${dnsAltName}`} />
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                } />
                            </Grid>
                        </Grid>
                        <Grid xs={6}>
                            <KeyValueLabel label="Public Key Algorithm" value={<Chip label={`${csrProps!.publicKey.keyType} ${csrProps!.publicKey.keySize}`} />} />
                        </Grid>
                    </>
                )
            }
        </Grid>
    );
};
