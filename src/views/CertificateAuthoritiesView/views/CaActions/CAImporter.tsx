import { Grid, useTheme } from "@mui/material";
import React, { useState } from "react";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { LoadingButton, Alert } from "@mui/lab";
import moment, { Moment } from "moment";
import CertificateImporter from "components/LamassuComponents/composed/Certificates/CertificateImporter";
import { CryptoEngine } from "ducks/features/cav3/apicalls";
import CryptoEngineSelector from "components/LamassuComponents/lamassu/CryptoEngineSelector";
import { useForm } from "react-hook-form";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import * as duration from "components/utils/duration";
import { FormDateInput } from "components/LamassuComponents/dui/form/DateInput";
import { CATimeline } from "views/CertificateAuthoritiesView/components/CATimeline";
import { X509Certificate, parseCRT } from "components/utils/cryptoUtils/crt";

const keyPlaceHolder = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIOUXa254YMYXWksCADpHFdJ+ly+nrQFsa0ozEuTZXmP5oAoGCCqGSM49
AwEHoUQDQgAEuLp+SvdUZJTXqCHivs3BpwfkKSAZl9ug9590zn7Hec2dLZj1tPG6
uywNx1FjrBpX2j6DBnyp1owBUY0Y1RVWpw==
-----END EC PRIVATE KEY-----
`;

type FormData = {
    cryptoEngine: string
    id: string
    certificate: string
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

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            cryptoEngine: "",
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

    const [selectedCryptoEngine, setSelectedCryptoEngine] = useState<CryptoEngine>(defaultEngine);

    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleImport = async () => {
        setIsLoading(true);
        try {
            // const issuanceDuration = moment.duration(issuanceDur, "days").asSeconds();
            // await importCA(window.btoa(crt!), window.btoa(privKey!), `${issuanceDuration}`);
        } catch (error) {
            console.log(error);

            setHasError(true);
        }
        setIsLoading(false);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <CryptoEngineSelector value={selectedCryptoEngine} onSelect={engine => {
                    if (Array.isArray(engine)) {
                        if (engine.length > 0) {
                            setSelectedCryptoEngine(engine[0]);
                        }
                    } else {
                        setSelectedCryptoEngine(engine);
                    }
                }} />
            </Grid>

            <Grid item xs={12} >
                <FormTextField label="CA ID" name={"id"} control={control} disabled />
            </Grid>

            <Grid item xs container spacing={1}>
                <CertificateImporter onChange={async (crt) => {
                    const parsedCrt = await parseCRT(crt);
                    setValue("parsedCertificate", parsedCrt);
                    setValue("certificate", crt);
                }} />
            </Grid>

            <Grid item xs container>
                <Grid item xs={12} >
                    <FormTextField fullWidth label="Private Key" name={"privateKey"} control={control} multiline placeholder={keyPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "450px", width: "100%" }} />
                </Grid>
            </Grid>

            <Grid item container spacing={1}>
                <Grid item xs={12}>
                    <SubsectionTitle>Issuance Expiration Settings</SubsectionTitle>
                </Grid>
                {
                    watchIssuanceExpiration.type === "duration" && (
                        <Grid item xs={12} xl={4}>
                            <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="issuerExpiration.duration" error={!duration.validDurationRegex(watchIssuanceExpiration.duration)} />
                        </Grid>
                    )
                }
                {
                    watchIssuanceExpiration.type === "date" && (
                        <Grid item xs={12} xl={4}>
                            <FormDateInput label="Expiration Date" control={control} name="issuerExpiration.date" />
                        </Grid>
                    )
                }
            </Grid>

            <Grid item container spacing={2} flexDirection={"column"}>
                <Grid item>
                    <SubsectionTitle>Timeline</SubsectionTitle>
                </Grid>
                <Grid item>
                    {
                        watchAll.parsedCertificate && (
                            <CATimeline
                                caExpiration={watchAll.parsedCertificate.notAfter}
                                issuanceDuration={watchIssuanceExpiration.type === "duration" ? watchIssuanceExpiration.duration : (watchIssuanceExpiration.type === "date" ? watchIssuanceExpiration.date : "")}
                            />
                        )
                    }
                </Grid>
            </Grid>

            <Grid item xs={12}>
                <LoadingButton loading={isLoading} variant="contained" disabled={!watchAll.certificate || !watchAll.privateKey} onClick={() => handleImport()}>Import CA</LoadingButton>
            </Grid>

            <Grid item xs={12}>
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

export default CertificateImporter;
