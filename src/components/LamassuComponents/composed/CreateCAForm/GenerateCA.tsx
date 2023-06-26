import { Divider, Grid, LinearProgress, MenuItem } from "@mui/material";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { Select } from "components/LamassuComponents/dui/Select";
import { TextField } from "components/LamassuComponents/dui/TextField";
import React, { useState } from "react";
import X509Form, { X509Value } from "../X509Form";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";

const GenerateCA = () => {
    const [loadingCryptoMaterial, setLoadingCryptoMaterial] = useState(false);
    const [x509FromValue, setX509FromValue] = useState<X509Value>({
        keyMetadata: {
            size: 4096,
            type: "RSA"
        },
        subject: {
            cn: "",
            country: "",
            state: "",
            locality: "",
            o: "",
            ou: ""
        },
        sanDNSs: []
    });

    const [validityPeriod, setValidityPeriod] = useState({
        caLifespan: {
            value: 2,
            units: "y"
        },
        issuedCertificates: {
            value: 90,
            units: "d"
        }
    });

    const validateCSRGenInputs = false;

    return (
        <Grid container spacing={3} flexDirection={"column"}>
            <Grid item container flexDirection={"column"} spacing={1}>
                <Grid item>
                    <SubsectionTitle>Crypto Engine</SubsectionTitle>
                </Grid>
                <Grid item container spacing={2}>
                    <Grid item xs="auto" container alignItems={"center"} justifyContent={"center"}>
                        <Grid item>
                            <img src={process.env.PUBLIC_URL + "/assets/img/aws/secrets-manager.svg"} height={"75px"} />
                        </Grid>
                    </Grid>
                    <Grid item xs container spacing={1}>
                        <Grid item xs={6}>
                            <KeyValueLabel label="Manufacturer" value="Amazon Web Services" />
                        </Grid>
                        <Grid item xs={6}>
                            <KeyValueLabel label="Service" value="AWS Secrets Manager" />
                        </Grid>
                        <Grid item xs={6}>
                            <KeyValueLabel label="Version" value="XXX" />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item>
                <Divider />
            </Grid>
            <Grid item>
                <X509Form value={x509FromValue} onChange={newVal => setX509FromValue(newVal)} />
            </Grid>

            <Grid item>
                <Divider />
            </Grid>

            <Grid item container spacing={2}>
                <Grid item xs={12}>
                    <SubsectionTitle>CA Validity Period</SubsectionTitle>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Value" value={validityPeriod.caLifespan.value} type="number" onChange={ev => setValidityPeriod({ ...validityPeriod, caLifespan: { ...validityPeriod.caLifespan, value: parseInt(ev.target.value) } })} />
                </Grid>
                <Grid item xs={6}>
                    <Select label="Key Size" value={validityPeriod.caLifespan.units} onChange={(ev: any) => { setValidityPeriod({ ...validityPeriod, caLifespan: { ...validityPeriod.caLifespan, units: ev.target.value || "y" } }); }}>
                        <MenuItem value="m">Minute</MenuItem>
                        <MenuItem value="h">Hour</MenuItem>
                        <MenuItem value="d">Day</MenuItem>
                        <MenuItem value="w">Week</MenuItem>
                        <MenuItem value="y">Year</MenuItem>
                    </Select>
                </Grid>
            </Grid>

            <Grid item>
                <Divider />
            </Grid>

            <Grid item container spacing={2}>
                <Grid item xs={12}>
                    <SubsectionTitle>Issued Certificates Validity Period</SubsectionTitle>
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Value" value={validityPeriod.issuedCertificates.value} type="number" onChange={ev => setValidityPeriod({ ...validityPeriod, caLifespan: { ...validityPeriod.caLifespan, value: parseInt(ev.target.value) } })} />
                </Grid>
                <Grid item xs={6}>
                    <Select label="Key Size" value={validityPeriod.issuedCertificates.units} onChange={(ev: any) => { setValidityPeriod({ ...validityPeriod, caLifespan: { ...validityPeriod.issuedCertificates, units: ev.target.value || "d" } }); }}>
                        <MenuItem value="m">Minute</MenuItem>
                        <MenuItem value="h">Hour</MenuItem>
                        <MenuItem value="d">Day</MenuItem>
                        <MenuItem value="w">Week</MenuItem>
                        <MenuItem value="y">Year</MenuItem>
                    </Select>
                </Grid>
            </Grid>

            <Grid item>
                <Divider />
            </Grid>

            <Grid item container spacing={2}>
                <Grid item xs={12}>
                    <SubsectionTitle>IoT Platform Integrations</SubsectionTitle>
                </Grid>
                <Grid item xs={12}>
                    <LinearProgress />
                </Grid>
            </Grid>

            <Grid item container flexDirection={"column"} spacing={2}>
                <Grid item>
                    {
                        loadingCryptoMaterial && (
                            <LinearProgress />
                        )
                    }
                </Grid>
                <Grid item>
                    <MonoChromaticButton disabled={validateCSRGenInputs || loadingCryptoMaterial} onClick={async () => {
                        setLoadingCryptoMaterial(true);

                        setLoadingCryptoMaterial(false);
                    }}>Create CA</MonoChromaticButton>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default GenerateCA;
