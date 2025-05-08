import { Alert, Typography, useTheme } from "@mui/material";
import { CATimeline } from "./CATimeline";
import { CertificateAuthority, CryptoEngine, ExpirationFormat } from "ducks/features/cas/models";
import { FormTextField } from "components/forms/Textfield";
import { LoadingButton } from "@mui/lab";
import { X509Certificate, parseCRT } from "utils/crypto/crt";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router-dom";
import CertificateImporter from "components/CRTImporter";
import CryptoEngineSelector from "components/CryptoEngines/CryptoEngineSelector";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useState } from "react";
import apicalls from "ducks/apicalls";
import moment, { Moment } from "moment";
import { FormExpirationInput } from "components/forms/Expiration";

const keyPlaceHolder = `-----BEGIN PRIVATE KEY-----
MHcCAQEEIOUXa254YMYXWksCADpHFdJ+ly+nrQFsa0ozEuTZXmP5oAoGCCqGSM49
AwEHoUQDQgAEuLp+SvdUZJTXqCHivs3BpwfkKSAZl9ug9590zn7Hec2dLZj1tPG6
uywNx1FjrBpX2j6DBnyp1owBUY0Y1RVWpw==
-----END PRIVATE KEY-----
`;

type FormData = {
    cryptoEngine: CryptoEngine
    parentCA: CertificateAuthority | undefined
    id: string
    certificate: string | undefined
    parsedCertificate: X509Certificate | undefined
    privateKey: string
    issuerExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: string
    },
};

interface CAImporterProps {
    defaultEngine: CryptoEngine
}

export const CAImporter: React.FC<CAImporterProps> = ({ defaultEngine }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const { preselectedCAParent, engines } = useOutletContext<{
        preselectedCAParent: CertificateAuthority | undefined;
        engines: CryptoEngine[];
        }>();

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            cryptoEngine: defaultEngine,
            parentCA: preselectedCAParent,
            id: window.crypto.randomUUID(),
            certificate: "",
            parsedCertificate: undefined,
            privateKey: "",
            issuerExpiration: {
                type: "duration",
                duration: "100d",
                date: moment().add(100, "days")
            }
        }
    });

    const watchIssuanceExpiration = watch("issuerExpiration");
    const watchAll = watch();

    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleImport = handleSubmit(async (data) => {
        setIsLoading(true);
        let issuanceDur: ExpirationFormat;

        if (data.issuerExpiration.type === "duration") {
            issuanceDur = {
                type: "Duration",
                duration: data.issuerExpiration.duration
            };
        } else {
            issuanceDur = {
                type: "Time",
                time: data.issuerExpiration.date.format()
            };
        }
        try {
            await apicalls.cas.importCA(data.id, data.cryptoEngine.id, window.btoa(data.certificate!), window.btoa(data.privateKey), issuanceDur, data.parentCA ? data.parentCA.id : "");
            navigate(`/cas/${data.id}`);
        } catch (error) {
            console.log(error);
            setHasError(true);
        }
        setIsLoading(false);
    });

    return (
        <Grid container spacing={2}padding={"10px 0"}>
            <Grid xs={12}>
                <CryptoEngineSelector value={watchAll.cryptoEngine} onSelect={engine => {
                    if (Array.isArray(engine)) {
                        if (engine.length > 0) {
                            setValue("cryptoEngine", engine[0]);
                        }
                    } else if (engine) {
                        setValue("cryptoEngine", engine);
                    }
                }} />
            </Grid>

            <Grid xs={12} >
                <FormTextField label="CA ID" name={"id"} control={control} disabled />
            </Grid>
            <Grid xs={12}>
                <CertificateImporter onChange={async (crt) => {
                    if (crt !== undefined) {
                        const parsedCrt = await parseCRT(crt);
                        setValue("parsedCertificate", parsedCrt);
                        setValue("certificate", crt);
                    } else {
                        setValue("parsedCertificate", undefined);
                        setValue("certificate", undefined);
                    }
                }} />
            </Grid>
            <Grid xs={12}>
                <FormTextField fullWidth label="Private Key" name={"privateKey"} control={control} multiline placeholder={keyPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "450px", width: "100%" }} />
            </Grid>

            <Grid xs={12} container spacing={1}>
                <Grid xs={12}>
                    <Typography variant="h4">Issuance Expiration Settings</Typography>
                </Grid>
                <Grid xs={12}>
                    <FormExpirationInput control={control} name="issuerExpiration"/>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ width: "100%" }}>
                <Grid xs={12}>
                    <Typography variant="h4">Timeline</Typography>
                </Grid>
                <Grid xs={12}>
                    {
                        watchAll.parsedCertificate && (
                            <CATimeline
                                caIssuedAt={watchAll.parsedCertificate.notBefore}
                                caExpiration={watchAll.parsedCertificate.notAfter}
                                issuanceDuration={watchIssuanceExpiration.type === "duration" ? watchIssuanceExpiration.duration : (watchIssuanceExpiration.type === "date" ? watchIssuanceExpiration.date : "")}
                            />

                        )
                    }
                </Grid>
            </Grid>

            <Grid xs={12}>
                <LoadingButton loading={isLoading} variant="contained" disabled={!watchAll.certificate || !watchAll.privateKey} onClick={() => handleImport()}>Import CA</LoadingButton>
            </Grid>

            <Grid xs={12}>
                {
                    hasError && (
                        <Alert severity="error">
                            Could not import CA
                        </Alert>
                    )
                }
            </Grid>

        </Grid>
    );
};
