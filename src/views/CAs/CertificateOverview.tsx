import { } from "@mui/system";
import { CAFetchViewer } from "components/CAs/CAStandardFetchViewer";
import { CATimeline } from "./CATimeline";
import { CertificateAuthority, CryptoEngine } from "ducks/features/cas/models";
import { CryptoEngineViewer } from "components/CryptoEngines/CryptoEngineViewer";
import { IconButton, Skeleton, Typography, useTheme } from "@mui/material";
import { TextField } from "components/TextField";
import { X509Certificate, parseCRT } from "utils/crypto/crt";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

interface Props {
    caData: CertificateAuthority
    engines: CryptoEngine[]
}

export const CertificateOverview: React.FC<Props> = ({ caData, engines }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [parsedCertificate, setParsedCertificate] = useState<X509Certificate | undefined>();

    useEffect(() => {
        const run = async () => {
            const crt = await parseCRT(window.atob(caData.certificate.certificate));
            setParsedCertificate(crt);
        };
        run();
    }, []);

    const certificateSubject = {
        country: "Country",
        state: "State / Province",
        locality: "Locality",
        organization: "Organization",
        organization_unit: "Organization Unit",
        common_name: "Common Name"
    };

    const certificateProperties: any = {
        serialNumber: {
            title: "Serial Number",
            value: caData.certificate.serial_number
        },
        validFrom: {
            title: "Valid From",
            value: moment(caData.certificate.valid_from).format("D MMMM YYYY")
        },
        validTo: {
            title: "Valid To",
            value: moment(caData.certificate.valid_to).format("D MMMM YYYY")
        }
    };

    if (!parsedCertificate) {
        return <>
            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
        </>;
    }

    for (const [key, value] of parsedCertificate?.extensions) {
        certificateProperties[key] = {
            title: key,
            value
        };
    }

    return (
        <Grid container columns={12} spacing={2} sx={{ width: "100%" }}>
            {
                caData.certificate.type !== "EXTERNAL" && (
                    <>
                        <Grid xs height={"75px"}>
                            <CATimeline
                                caIssuedAt={moment(caData.certificate.valid_from)}
                                caExpiration={moment(caData.certificate.valid_to)}
                                issuanceDuration={caData.validity.type === "Duration" ? caData.validity.duration : (caData.validity.type === "Time" ? caData.validity.time : "")}
                            />
                        </Grid>
                    </>
                )
            }
            {
                caData.certificate.issuer_metadata.id !== caData.id && (
                    <Grid xs={12} container flexDirection={"column"}>
                        <Grid>
                            <Typography variant="h4">Parent CA</Typography>
                        </Grid>
                        <Grid flexDirection={"column"} spacing={1}>
                            <CAFetchViewer id={caData.certificate.issuer_metadata.id} />
                        </Grid>
                    </Grid>
                )
            }
            {
                caData.certificate.type !== "EXTERNAL" && (
                    <Grid xs={12} container flexDirection={"column"}>
                        <Grid>
                            <Typography variant="h4">Crypto Engine</Typography>
                        </Grid>
                        <Grid flexDirection={"column"} spacing={1}>
                            <CryptoEngineViewer engine={engines.find(engine => engine.id === caData.certificate.engine_id)!} withDebugMetadata />
                        </Grid>
                    </Grid>
                )
            }

            <Grid xs={12} container flexDirection={"column"}>
                <Grid xs={12}>
                    <Typography variant="h4">CA Settings</Typography>
                </Grid>
                <Grid xs={12} container spacing={1}>
                    <Grid container xs={12} spacing={1} alignItems={"end"}>
                        <Grid xs>
                            <TextField label="Issuance Expiration" value={caData.validity.type + ": " + (caData.validity.type === "Duration" ? caData.validity.duration : moment(caData.validity.time).format("D MMMM YYYY HH:mm"))} fullWidth disabled />
                        </Grid>
                        <Grid xs={"auto"}>
                            <IconButton onClick={() => {
                                navigate("/cas/edit/" + caData.id);
                            }}>
                                <EditIcon/>
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Grid xs={12} md={6} container flexDirection={"column"}>
                <Grid xs={12}>
                    <Typography variant="h4">Subject</Typography>
                </Grid>
                <Grid xs={12} container flexDirection={"column"} spacing={1}>
                    {
                        Object.keys(certificateSubject).map(key => (
                            <Grid key={key}>
                                {/* @ts-ignore} */}
                                <TextField label={certificateSubject[key]} value={caData.certificate.subject[key]} fullWidth disabled />
                            </Grid>
                        ))
                    }
                </Grid>
            </Grid>
            <Grid xs={12} md={6} container>
                <Grid xs={12}>
                    <Typography variant="h4">Other Properties</Typography>
                </Grid>
                <Grid xs={12} container flexDirection={"column"} spacing={1}>
                    {
                        Object.keys(certificateProperties).map(key => (
                            <Grid key={key}>
                                <TextField label={certificateProperties[key].title} value={certificateProperties[key].value} fullWidth disabled />
                            </Grid>
                        ))
                    }
                </Grid>
            </Grid>
        </Grid>
    );
};
