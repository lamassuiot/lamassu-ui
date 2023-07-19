import React, { useEffect, useState } from "react";
import { Skeleton, Alert } from "@mui/lab";

import { Grid, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as dmsApiCalls from "ducks/features/dms-enroller/apicalls";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { parseCertificateBundle } from "components/utils/cryptoUtils/x509";
import CertificateDecoder from "components/LamassuComponents/composed/CreateCAForm/CertificateDecoder";

interface Props {
    dmsName: string
}

export const DMSCACertificates: React.FC<Props> = ({ dmsName }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [rawCACerts, setRawCACerts] = useState("");
    const [pemCACerts, setPemCACerts] = useState("");
    const [decodedCerts, setDecodedCerts] = useState<string[]>([]);

    useEffect(() => {
        const run = async () => {
            const respRaw = await dmsApiCalls.getESTCACerts(dmsName);
            const respPem = await dmsApiCalls.getESTCACerts(dmsName, true);
            setRawCACerts(respRaw);
            setPemCACerts(respPem);
            const decCABundle = parseCertificateBundle(respPem);
            setDecodedCerts(decCABundle);
            setLoading(false);
        };

        run();
    }, []);

    return (
        <Grid container spacing={"40px"}>
            <Grid item xs flexDirection={"column"} container spacing={2}>
                <Grid item>
                    <SubsectionTitle>RAW PKCS7 CA CERTS</SubsectionTitle>
                </Grid>
                <Grid item>
                    <Alert severity="info" sx={{ width: "fit-content" }}>
                        Obtain CACerts using cURL
                        <CodeCopier code={`curl ${window._env_.LAMASSU_DMS_MANAGER_API}/.well-known/est/${dmsName}/cacerts`} enableCopy={false} />
                    </Alert>
                </Grid>
                <Grid item>
                    {
                        loading
                            ? (
                                <>
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                </>
                            )
                            : (
                                <CodeCopier code={rawCACerts} />
                            )
                    }
                </Grid>
            </Grid>
            <Grid item xs flexDirection={"column"} container spacing={2}>
                <Grid item>
                    <SubsectionTitle>PEM FORMAT CA CERTS</SubsectionTitle>
                </Grid>
                <Grid item>
                    <Alert severity="info" sx={{ width: "fit-content" }}>
                        Obtain CACerts using cURL
                        <CodeCopier code={`curl ${window._env_.LAMASSU_DMS_MANAGER_API}/.well-known/est/${dmsName}/cacerts \\\n\t-H "Accept: application/x-pem-file"`} enableCopy={false} />
                    </Alert>
                </Grid>
                <Grid item>
                    {
                        loading
                            ? (
                                <>
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                </>
                            )
                            : (
                                <CodeCopier code={pemCACerts} enableDownload={true} downloadFileName={`${dmsName}-trust-cas.crt'`} />
                            )
                    }
                </Grid>
            </Grid>
            <Grid item xs={3} flexDirection={"column"} container spacing={2}>
                <Grid item>
                    <SubsectionTitle>PARSED CAs</SubsectionTitle>
                </Grid>
                <Grid item>
                    {
                        loading
                            ? (
                                <>
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                </>
                            )
                            : (
                                <Grid container flexDirection={"column"} spacing={2}>
                                    {
                                        decodedCerts.map((cert, idx) => (
                                            <Grid item key={idx}>
                                                <CertificateDecoder crt={cert}/>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            )
                    }
                </Grid>
            </Grid>
        </Grid>
    );
};
