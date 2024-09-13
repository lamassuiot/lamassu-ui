import { Alert, Typography, useTheme } from "@mui/material";
import { KeyValueLabel } from "components/KeyValue";
import { X509Certificate, parseCRT } from "utils/crypto/crt";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { useEffect, useState } from "react";
import moment from "moment";

interface CertificateDecoderProps {
    crtPem: string
}

const CertificateDecoder: React.FC<CertificateDecoderProps> = ({ crtPem }) => {
    const theme = useTheme();

    const [crtProps, setCrtProps] = useState<X509Certificate | undefined>();
    const [isValid, setIsValid] = useState<boolean>(false);

    useEffect(() => {
        const run = async () => {
            if (crtPem !== undefined) {
                try {
                    const crtInfo = await parseCRT(crtPem);
                    setCrtProps(crtInfo);
                    setIsValid(true);
                } catch (err) {
                    console.log(err);
                    setIsValid(false);
                }
            }
        };

        run();
    }, [crtPem]);

    return (
        <Grid container spacing={1}>
            {
                isValid && (
                    <>
                        <Grid xs={12}>
                            <Alert severity="info">Decoded Certificate</Alert>
                        </Grid>
                        <Grid xs={12}>
                            <KeyValueLabel label="Serial Number" value={
                                <Label>{crtProps!.serialNumber}</Label>
                            } />
                        </Grid>
                        <Grid xs={12}>
                            <KeyValueLabel label="Public Key Algorithm" value={
                                <Label>{`${crtProps!.publicKey.keyType} ${crtProps!.publicKey.keySize}`}</Label>
                            } />
                        </Grid>
                        <Grid xs={12}>
                            <KeyValueLabel label="Subject" value={
                                <Grid container spacing={1}>
                                    <Grid>
                                        <Label>{`CN = ${crtProps!.subject.cn}`}</Label>
                                    </Grid>
                                    {
                                        crtProps!.subject.country && (
                                            <Grid>
                                                <Label>{`C = ${crtProps!.subject.country}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.state && (
                                            <Grid>
                                                <Label>{`ST = ${crtProps!.subject.state}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.city && (
                                            <Grid>
                                                <Label>{`L = ${crtProps!.subject.city}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.o && (
                                            <Grid>
                                                <Label>{`O = ${crtProps!.subject.o}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.subject.ou && (
                                            <Grid>
                                                <Label>{`OU = ${crtProps!.subject.ou}`}</Label>
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            } />
                        </Grid>

                        {
                            crtProps && crtProps?.subjectAltName.dnss.length > 0 && (
                                <Grid xs={12}>
                                    <KeyValueLabel label="Subject Alternative Name" value={
                                        <Grid container spacing={1}>
                                            {
                                                crtProps?.subjectAltName.dnss.map((dnsAltName: string, idx: number) => (
                                                    <Grid key={idx}>
                                                        <Label>{`DNS = ${dnsAltName}`}</Label>
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    } />
                                </Grid>
                            )
                        }

                        <Grid xs={6}>
                            <KeyValueLabel label="Valid From" value={
                                <Grid container spacing={1} alignItems={"center"}>
                                    <Grid>
                                        <Label>{crtProps!.notBefore.format("DD/MM/YYYY HH:mm")}</Label>
                                    </Grid>
                                    <Grid>
                                        <Typography sx={{ fontSize: "12px" }}>{moment.duration(crtProps!.notBefore.diff(moment())).humanize(true)}</Typography>
                                    </Grid>
                                </Grid>
                            } />
                        </Grid>
                        <Grid xs={6}>
                            <KeyValueLabel label="Valid To" value={
                                <Grid container spacing={1} alignItems={"center"}>
                                    <Grid>
                                        <Label>{crtProps!.notAfter.format("DD/MM/YYYY HH:mm")}</Label>
                                    </Grid>
                                    <Grid>
                                        <Typography sx={{ fontSize: "12px" }}>{moment.duration(crtProps!.notAfter.diff(moment())).humanize(true)}</Typography>
                                    </Grid>
                                </Grid>
                            } />
                        </Grid>
                        <Grid xs={12}>
                            <KeyValueLabel label="Issuer" value={
                                <Grid container spacing={1}>
                                    <Grid>
                                        <Label>{`CN = ${crtProps!.issuer.cn}`}</Label>
                                    </Grid>
                                    {
                                        crtProps!.issuer.country && (
                                            <Grid>
                                                <Label>{`C = ${crtProps!.issuer.country}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.state && (
                                            <Grid>
                                                <Label>{`ST = ${crtProps!.issuer.state}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.city && (
                                            <Grid>
                                                <Label>{`L = ${crtProps!.issuer.city}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.o && (
                                            <Grid>
                                                <Label>{`O = ${crtProps!.issuer.o}`}</Label>
                                            </Grid>
                                        )
                                    }
                                    {
                                        crtProps!.issuer.ou && (
                                            <Grid>
                                                <Label>{`OU = ${crtProps!.issuer.ou}`}</Label>
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            } />
                        </Grid>
                    </>
                )
            }
        </Grid>
    );
};

export { CertificateDecoder };
