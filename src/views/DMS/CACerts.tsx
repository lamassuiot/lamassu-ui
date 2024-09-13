import React, { useEffect, useState } from "react";

import { Alert, Skeleton, Typography, useTheme } from "@mui/material";
import { CertificateDecoder } from "components/Certificates/CertificateDecoder";
import { CodeCopier } from "components/CodeCopier";
import { parseCertificateBundle } from "utils/crypto/x509";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import apicalls from "ducks/apicalls";

interface Props {
    dmsID: string
}

export const DMSCACertificates: React.FC<Props> = ({ dmsID }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [rawCACerts, setRawCACerts] = useState("");
    const [pemCACerts, setPemCACerts] = useState("");
    const [decodedCerts, setDecodedCerts] = useState<string[]>([]);

    useEffect(() => {
        const run = async () => {
            const respRaw = await apicalls.est.getESTCACerts(dmsID);
            const respPem = await apicalls.est.getESTCACerts(dmsID, true);
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
            <Grid xs flexDirection={"column"} container spacing={2}>
                <Grid>
                    <Typography variant="h4">RAW PKCS7 CA CERTS</Typography>
                </Grid>
                <Grid>
                    <Alert severity="info" sx={{ width: "fit-content" }}>
                        Obtain CACerts using cURL
                        <CodeCopier code={`curl ${window._env_.LAMASSU_DMS_MANAGER_API}/.well-known/est/${dmsID}/cacerts`} enableCopy={false} />
                    </Alert>
                </Grid>
                <Grid>
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
                                <CodeCopier code={rawCACerts} fontSize={10} />
                            )
                    }
                </Grid>
            </Grid>
            <Grid xs flexDirection={"column"} container spacing={2}>
                <Grid>
                    <Typography variant="h4">PEM FORMAT CA CERTS</Typography>
                </Grid>
                <Grid>
                    <Alert severity="info" sx={{ width: "fit-content" }}>
                        Obtain CACerts using cURL
                        <CodeCopier code={`curl ${window._env_.LAMASSU_DMS_MANAGER_API}/.well-known/est/${dmsID}/cacerts \\\n\t-H "Accept: application/x-pem-file"`} enableCopy={false} />
                    </Alert>
                </Grid>
                <Grid>
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
                                <CodeCopier code={pemCACerts} enableDownload={true} downloadFileName={`${dmsID}-trust-cas.crt`} fontSize={10} />
                            )
                    }
                </Grid>
            </Grid>
            <Grid xs={3} flexDirection={"column"} container spacing={2}>
                <Grid>
                    <Typography variant="h4">PARSED CAs</Typography>
                </Grid>
                <Grid>
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
                                            <Grid key={idx}>
                                                <CertificateDecoder crtPem={cert}/>
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
