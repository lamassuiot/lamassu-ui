import { Box, Grid, Typography, useTheme } from "@mui/material";
import { Chip } from "components/LamassuComponents/dui/Chip";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";

import moment from "moment";
import React, { useEffect, useState } from "react";
import { X509Certificate, parseCRT } from "components/utils/cryptoUtils/crt";

interface CertificateDecoderProps {
    crt: string
}

const CertificateDecoder: React.FC<CertificateDecoderProps> = ({ crt }) => {
    const theme = useTheme();

    const [crtProps, setCrtProps] = useState<X509Certificate | undefined>();
    const [isValid, setIsValid] = useState<boolean>(false);

    useEffect(() => {
        const run = async () => {
            if (crt !== undefined) {
                try {
                    const crtInfo = await parseCRT(crt);
                    setCrtProps(crtInfo);
                    setIsValid(true);
                } catch (err) {
                    console.log(err);

                    setIsValid(false);
                }
            }
        };

        run();
    }, [crt]);

    return (
        <Grid container spacing={1}>
            {
                isValid && (
                    <>
                        <Grid item xs={12}>
                            <Box sx={{ background: theme.palette.primary.light, padding: "5px 10px", borderRadius: "5px" }}>
                                <Typography fontSize="0.8rem">Decoded Certificate</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <KeyValueLabel label="Serial Number" value={<Chip label={crtProps!.serialNumber} />} />
                        </Grid>
                        <Grid item xs={12}>
                            <KeyValueLabel label="Public Key Algorithm" value={<Chip label={`${crtProps!.publicKey.keyType} ${crtProps!.publicKey.keySize}`} />} />
                        </Grid>
                        <Grid item xs={6}>
                            <KeyValueLabel label="Subject" value={
                                <Grid container spacing={1}>
                                    <Grid item>
                                        <Chip label={`CN = ${crtProps!.subject.cn}`} />
                                    </Grid>
                                    {
                                        crtProps!.subject.country && (
                                            <Grid item>
                                                <Chip label={`C = ${crtProps!.subject.country}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.state && (
                                            <Grid item>
                                                <Chip label={`ST = ${crtProps!.subject.state}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.city && (
                                            <Grid item>
                                                <Chip label={`L = ${crtProps!.subject.city}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.o && (
                                            <Grid item>
                                                <Chip label={`O = ${crtProps!.subject.o}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.ou && (
                                            <Grid item>
                                                <Chip label={`OU = ${crtProps!.subject.ou}`} />
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            } />
                        </Grid>

                        <Grid item xs={6}>
                            <KeyValueLabel label="Subject Alternative Name" value={
                                <Grid container spacing={1}>
                                    {
                                        crtProps?.subjectAltName.dnss.map((dnsAltName: string, idx: number) => (
                                            <Grid item key={idx}>
                                                <Chip label={`DNS = ${dnsAltName}`} />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            } />
                        </Grid>

                        <Grid item xs={6}>
                            <KeyValueLabel label="Valid From" value={
                                <Grid container spacing={1} alignItems={"center"}>
                                    <Grid item>
                                        <Chip label={crtProps!.notBefore.format("DD/MM/YYYY HH:mm")} />
                                    </Grid>
                                    <Grid item>
                                        <Typography sx={{ fontSize: "12px" }}>{moment.duration(crtProps!.notBefore.diff(moment())).humanize(true)}</Typography>
                                    </Grid>
                                </Grid>
                            } />
                        </Grid>
                        <Grid item xs={6}>
                            <KeyValueLabel label="Valid To" value={
                                <Grid container spacing={1} alignItems={"center"}>
                                    <Grid item>
                                        <Chip label={crtProps!.notAfter.format("DD/MM/YYYY HH:mm")} />
                                    </Grid>
                                    <Grid item>
                                        <Typography sx={{ fontSize: "12px" }}>{moment.duration(crtProps!.notAfter.diff(moment())).humanize(true)}</Typography>
                                    </Grid>
                                </Grid>
                            } />
                        </Grid>
                        <Grid item xs={12}>
                            <KeyValueLabel label="Issuer" value={
                                <Grid container spacing={1}>
                                    <Grid item>
                                        <Chip label={`CN = ${crtProps!.issuer.cn}`} />
                                    </Grid>
                                    {
                                        crtProps!.issuer.country && (
                                            <Grid item>
                                                <Chip label={`C = ${crtProps!.issuer.country}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.state && (
                                            <Grid item>
                                                <Chip label={`ST = ${crtProps!.issuer.state}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.city && (
                                            <Grid item>
                                                <Chip label={`L = ${crtProps!.issuer.city}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.o && (
                                            <Grid item>
                                                <Chip label={`O = ${crtProps!.issuer.o}`} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.ou && (
                                            <Grid item>
                                                <Chip label={`OU = ${crtProps!.issuer.ou}`} />
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            } />
                        </Grid>
                    </>
                )
            }
        </Grid >
    );
};

export default CertificateDecoder;
