import { Button, Divider, Grid, MenuItem, useTheme } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import React, { useEffect, useState } from "react";
import { parseCRT } from "components/utils/cryptoUtils/crt";
import { CryptoEngineSelector } from "components/LamassuComponents/lamassu/CryptoEngineSelector";
import { FormDateInput } from "components/LamassuComponents/dui/form/DateInput";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import moment from "moment";
import { useForm } from "react-hook-form";
import CertificateImporter from "components/LamassuComponents/composed/Certificates/CertificateImporter";

const keyPlaceHolder = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIOUXa254YMYXWksCADpHFdJ+ly+nrQFsa0ozEuTZXmP5oAoGCCqGSM49
AwEHoUQDQgAEuLp+SvdUZJTXqCHivs3BpwfkKSAZl9ug9590zn7Hec2dLZj1tPG6
uywNx1FjrBpX2j6DBnyp1owBUY0Y1RVWpw==
-----END EC PRIVATE KEY-----
`;

interface CAImporterProps {
    onCreate: (crt: string, key: string) => void
}

type FormData = {
    cryptoEngine: string
    privateKey: string
    certificate: string
    issuerExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: moment.Moment,
        duration: string
    },
};

const validDurationRegex = (test: string) => {
    const validator = /\d+[ywdhms]{1}/;
    const res = test.match(validator);
    if (res && res[0] === test) {
        return true;
    }
    return false;
};

export const ImportCA: React.FC<CAImporterProps> = ({ onCreate }) => {
    const theme = useTheme();

    const [caName, setCAName] = useState<string>("");

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            cryptoEngine: "",
            privateKey: "",
            certificate: "",
            issuerExpiration: {
                type: "duration",
                duration: "100d",
                date: moment().add(100, "days")
            }
        }
    });

    const watchPrivateKey = watch("privateKey");
    const watchCertificate = watch("certificate");
    const watchIssuanceExpiration = watch("issuerExpiration");

    useEffect(() => {
        const run = async () => {
            if (watchCertificate) {
                const parsedCrt = await parseCRT(watchCertificate);
                if (parsedCrt.subject.cn) {
                    setCAName(parsedCrt.subject.cn);
                }
            }
        };
        run();
    }, [watchCertificate]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <SubsectionTitle>Bring Your Own CA</SubsectionTitle>
            </Grid>

            <Grid item xs={12}>
                <CryptoEngineSelector onSelect={(selectedEngine => console.log(selectedEngine))} />
            </Grid>

            <Grid item xs={12}>
                <TextField label="CA Name" disabled value={caName} />
            </Grid>

            <Grid item xs container spacing={1}>
                <CertificateImporter onChange={(crt) => { setValue("certificate", crt); }} />
            </Grid>

            <Grid item xs container>
                <Grid item xs={12} >
                    <FormTextField error={!watchPrivateKey} helperText="Private Key can not be empty" spellCheck={false} fullWidth label="Private Key" name="privateKey" multiline control={control} placeholder={keyPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "450px", width: "100%" }} />
                </Grid>
            </Grid>

            <Grid item xs={12}>
                <Divider />
            </Grid>

            <Grid item container spacing={2}>
                <Grid item xs={12}>
                    <SubsectionTitle>Issuance Expiration Settings</SubsectionTitle>
                </Grid>
                <Grid item xs={4}>
                    <FormSelect control={control} name="issuerExpiration.type" label="Issuance By">
                        <MenuItem value={"duration"}>Duration</MenuItem>
                        <MenuItem value={"date"}>End Date</MenuItem>
                    </FormSelect>
                </Grid>
                <Grid item xs={9} />
                {
                    watchIssuanceExpiration.type === "duration" && (
                        <Grid item xs={4}>
                            <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="issuerExpiration.duration" error={!validDurationRegex(watchIssuanceExpiration.duration)} />
                        </Grid>
                    )
                }
                {
                    watchIssuanceExpiration.type === "date" && (
                        <Grid item xs={4}>
                            <FormDateInput label="Expiration Date" control={control} name="issuerExpiration.date" />
                        </Grid>
                    )
                }
            </Grid>

            <Grid item sx={{ width: "100%" }}>
                <Divider />
            </Grid>

            <Grid item xs={12}>
                <Button disabled={!watchCertificate || !watchPrivateKey} variant="contained" onClick={() => {

                }}>Import CA</Button>
            </Grid>

        </Grid>
    );
};
