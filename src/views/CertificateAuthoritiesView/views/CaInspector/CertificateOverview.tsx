import React from "react";
import moment from "moment";
import { Box, useTheme } from "@mui/system";
import { useAppSelector } from "ducks/hooks";
import * as caSelector from "ducks/features/cas/reducer";
import { Certificate } from "@fidm/x509";
import { capitalizeFirstLetter, uncamelize } from "ducks/reducers_utils";
import { Grid, Typography } from "@mui/material";

interface Props {
    caName: string
}

export const CerificateOverview: React.FC<Props> = ({ caName }) => {
    const theme = useTheme();
    const caData = useAppSelector((state) => caSelector.getCA(state, caName)!);

    const decodedCert = window.atob(caData.certificate.pem_base64);
    const parsaedCert = Certificate.fromPEM(Buffer.from(decodedCert, "utf8"));
    const certificateSubject = {
        country: "Country",
        state: "State / Province",
        locality: "Locality",
        organization: "Organization",
        organization_unit: "Organization Unit",
        common_name: "Common Name"
    };

    const certificateProperties = {
        serialNumber: {
            title: "Serial Number",
            value: chunk(parsaedCert.serialNumber, 2).join("-")
        },
        validFrom: {
            title: "Valid From",
            value: moment(parsaedCert.validFrom).format("D MMMM YYYY")
        },
        validTo: {
            title: "Valid To",
            value: moment(parsaedCert.validTo).format("D MMMM YYYY")
        },
        issuer: {
            title: "Issuer",
            value: parsaedCert.subject.attributes.map(attr => {
                const label = capitalizeFirstLetter(uncamelize(attr.name));
                const value = attr.value;
                return `${label}: ${value}`;
            }).reduce((previousValue, currentValue) => previousValue === "" ? currentValue : previousValue + "; " + currentValue, "")
        },
        sans: {
            title: "SANS",
            value: parsaedCert.dnsNames
        },
        signatureAlgorithm: {
            title: "Signature Algorithm",
            value: parsaedCert.signatureAlgorithm
        },
        ocspServer: {
            title: "OCSP Server",
            value: parsaedCert.ocspServer
        }
    };

    return (
        <Grid item container sx={{ width: "100%" }} spacing={0}>
            <Grid item xs={12} container spacing={4}>
                <Grid item xs={6} container>
                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <Box style={{ marginBottom: 10 }}>
                            <Typography variant="button" style={{ color: theme.palette.text.primary, fontWeight: "600", fontSize: 17 }}>Subject</Typography>
                        </Box>
                        <Box>
                            {
                                Object.keys(certificateSubject).map(key => (
                                    <Grid container sx={{ marginBottom: "15px" }} key={key}>
                                        <Grid item xs={5}>
                                            {/* @ts-ignore} */}
                                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13 }}>{certificateSubject[key]}</Typography>
                                        </Grid>
                                        <Grid item xs={7}>
                                            {/* @ts-ignore} */}
                                            <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>{caData.subject[key]}</Typography>
                                        </Grid>
                                    </Grid>
                                ))
                            }
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6} container>
                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <Box style={{ marginBottom: 10 }}>
                            <Typography variant="button" style={{ color: theme.palette.text.primary, fontWeight: "600", fontSize: 17 }}>Issued</Typography>
                        </Box>
                        <Box>
                            {
                                Object.keys(certificateProperties).map(key => (
                                    <Grid container sx={{ marginBottom: "15px" }} key={key}>
                                        <Grid item xs={5}>
                                            {/* @ts-ignore} */}
                                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13 }}>{certificateProperties[key].title}</Typography>
                                        </Grid>
                                        <Grid item xs={7}>
                                            {/* @ts-ignore} */}
                                            <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13, wordBreak: "break-word" }}>{certificateProperties[key].value}</Typography>
                                        </Grid>
                                    </Grid>
                                ))
                            }
                        </Box>
                    </Box>
                </Grid>
                {/* <Grid item xs={6} container>
                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <Box style={{ marginBottom: 10 }}>
                            <Typography variant="button" style={{ color: theme.palette.text.primary, fontWeight: "600", fontSize: 17 }}>Timeline</Typography>
                        </Box>
                        <Box>
                            <Box>
                                <Typography>Issued certificates have a lifespan of: </Typography>
                                <Typography>The last emission date </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid> */}
            </Grid>
            <Grid item container style={{ marginTop: 20 }} spacing={2}>
                {/* <Grid item xs={3}>
                    <IssuedCertsStatus/>
                </Grid>
                <Grid item xs={3}>
                    <IssuedCertsKeyStrength/>
                </Grid>
                <Grid item xs={6}>
                    <IssuedCertsTimeline />
                </Grid> */}
            </Grid>
        </Grid>
    );
};

function chunk (str: string, n: number) {
    const ret = [];
    let i;
    let len;

    for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
    }

    return ret;
};
