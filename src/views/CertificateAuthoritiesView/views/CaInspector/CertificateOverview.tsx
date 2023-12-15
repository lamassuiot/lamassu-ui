import React, { useEffect, useState } from "react";
import moment from "moment";
import { } from "@mui/system";
import { Grid, Skeleton, useTheme } from "@mui/material";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { X509Certificate, parseCRT } from "components/utils/cryptoUtils/crt";
import { CryptoEngineViewer } from "components/LamassuComponents/lamassu/CryptoEngineViewer";
import { CertificateAuthority, CryptoEngine } from "ducks/features/cav3/models";
import CAFetchViewer from "components/LamassuComponents/lamassu/CAFetchViewer";
import { CATimeline } from "views/CertificateAuthoritiesView/components/CATimeline";

interface Props {
    caData: CertificateAuthority
    engines: CryptoEngine[]
}

export const CertificateOverview: React.FC<Props> = ({ caData, engines }) => {
    const theme = useTheme();
    const [parsedCertificate, setParsedCertificate] = useState<X509Certificate | undefined>();
    useEffect(() => {
        const run = async () => {
            const crt = await parseCRT(window.atob(caData.certificate));
            setParsedCertificate(crt);
        };
        run();
    }, []);

    const pars = window.window.atob(caData.certificate);
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
            value: caData.serial_number
        },
        validFrom: {
            title: "Valid From",
            value: moment(caData.valid_from).format("D MMMM YYYY")
        },
        validTo: {
            title: "Valid To",
            value: moment(caData.valid_to).format("D MMMM YYYY")
        },
        issuanceDuration: {
            title: "Issuance Expiration",
            value: caData.issuance_expiration.type + ": " + (caData.issuance_expiration.type === "Duration" ? caData.issuance_expiration.duration : moment(caData.issuance_expiration.time).format("D MMMM YYYY HH:mm"))
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
            value: value
        };
    }

    return (
        <Grid container columns={12} spacing={2}>
            {
                caData.type !== "EXTERNAL" && (
                    <>
                        <Grid item xs height={"75px"}>
                            <CATimeline
                                caIssuedAt={moment(caData.valid_from)}
                                caExpiration={moment(caData.valid_to)}
                                issuanceDuration={caData.issuance_expiration.type === "Duration" ? caData.issuance_expiration.duration : (caData.issuance_expiration.type === "Time" ? caData.issuance_expiration.time : "")}
                            />
                        </Grid>
                    </>
                )
            }
            {
                caData.issuer_metadata.id !== caData.id && (
                    <Grid item xs={12} container flexDirection={"column"}>
                        <Grid item>
                            <SubsectionTitle>Parent CA</SubsectionTitle>
                        </Grid>
                        <Grid item flexDirection={"column"} spacing={1}>
                            <CAFetchViewer caName={caData.issuer_metadata.id} elevation={false} />
                        </Grid>
                    </Grid>
                )
            }
            {
                caData.type !== "EXTERNAL" && (
                    <Grid item xs={12} container flexDirection={"column"}>
                        <Grid item>
                            <SubsectionTitle>Crypto Engine</SubsectionTitle>
                        </Grid>
                        <Grid item flexDirection={"column"} spacing={1}>
                            <CryptoEngineViewer engine={engines.find(engine => engine.id === caData.engine_id)!} withDebugMetadata />
                        </Grid>
                    </Grid>
                )
            }
            <Grid item xs={6} container flexDirection={"column"}>
                <Grid item>
                    <SubsectionTitle>Subject</SubsectionTitle>
                </Grid>
                <Grid item container flexDirection={"column"} spacing={1}>
                    {
                        Object.keys(certificateSubject).map(key => (
                            <Grid key={key} item>
                                {/* @ts-ignore} */}
                                <TextField label={certificateSubject[key]} value={caData.subject[key]} disabled />
                            </Grid>
                        ))
                    }
                </Grid>
            </Grid>
            <Grid item xs={6} container>
                <Grid item>
                    <SubsectionTitle>Other Properties</SubsectionTitle>
                </Grid>
                <Grid item container flexDirection={"column"} spacing={1}>
                    {
                        Object.keys(certificateProperties).map(key => (
                            <Grid key={key} item>
                                {/* @ts-ignore} */}
                                <TextField label={certificateProperties[key].title} value={certificateProperties[key].value} disabled />
                            </Grid>
                        ))
                    }
                </Grid>
            </Grid>
        </Grid >
    );
};
