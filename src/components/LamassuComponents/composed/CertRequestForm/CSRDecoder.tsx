import { Box, Grid, Typography, useTheme } from "@mui/material";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { Chip } from "components/LamassuComponents/dui/Chip";
import React, { useEffect, useState } from "react";
import { parseCSR } from "components/utils/cryptoUtils/csr";
import { X509 } from "components/utils/cryptoUtils/x509";

interface CSRDecoderProps {
    csr: string
}

const CSRDecoder: React.FC<CSRDecoderProps> = ({ csr }) => {
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
                        <Grid item xs={12}>
                            <Box sx={{ background: theme.palette.primary.light, padding: "5px 10px", borderRadius: "5px" }}>
                                <Typography fontSize="0.8rem">Decoded Certificate Request</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} container flexDirection={"column"} spacing={2}>
                            <Grid item>
                                <KeyValueLabel label="Subject" value={
                                    <Grid container spacing={1}>
                                        <Grid item>
                                            <Chip label={`CN = ${csrProps!.subject.cn}`} />
                                        </Grid>
                                        {
                                            csrProps!.subject.country && (
                                                <Grid item>
                                                    <Chip label={`C = ${csrProps!.subject.country}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.state && (
                                                <Grid item>
                                                    <Chip label={`ST = ${csrProps!.subject.state}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.city && (
                                                <Grid item>
                                                    <Chip label={`L = ${csrProps!.subject.city}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.o && (
                                                <Grid item>
                                                    <Chip label={`O = ${csrProps!.subject.o}`} />
                                                </Grid>
                                            )
                                        }
                                        {
                                            csrProps!.subject.ou && (
                                                <Grid item>
                                                    <Chip label={`OU = ${csrProps!.subject.ou}`} />
                                                </Grid>
                                            )
                                        }
                                    </Grid>
                                } />
                            </Grid>
                            <Grid item>
                                <KeyValueLabel label="Subject Alternative Name" value={
                                    <Grid container spacing={1}>
                                        {
                                            csrProps?.subjectAltName.dnss.map((dnsAltName: string, idx: number) => (
                                                <Grid item key={idx}>
                                                    <Chip label={`DNS = ${dnsAltName}`} />
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                } />
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <KeyValueLabel label="Public Key Algorithm" value={<Chip label={`${csrProps!.publicKey.keyType} ${csrProps!.publicKey.keySize}`} />} />
                        </Grid>
                    </>
                )
            }
        </Grid >
    );
};

export default CSRDecoder;
