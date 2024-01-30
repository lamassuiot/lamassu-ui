import { Divider, Grid, IconButton, MenuItem } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { Select } from "components/LamassuComponents/dui/Select";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import React, { useState } from "react";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import CloseIcon from "@mui/icons-material/Close";

const RSAKeySizes = [2048, 3072, 4096];
const defaultRSAKeySize = RSAKeySizes[RSAKeySizes.length - 1];

const ECKeySizes = [256, 384, 521];
const defaultECKeySizes = ECKeySizes[ECKeySizes.length - 1];

export interface X509Value {
    keyMetadata: {
        type: "RSA" | "ECDSA",
        size: number
    }
    subject: {
        cn: undefined | string,
        country: undefined | string,
        state: undefined | string,
        locality: undefined | string,
        o: undefined | string,
        ou: undefined | string,
    }
    sanDNSs: string[]
}

interface X509FormProps {
    value: X509Value
    onChange: (newVal: X509Value) => void
}

const X509Form: React.FC<X509FormProps> = ({ value, onChange }) => {
    const [newSanDNS, setNewSanDNS] = useState<string | undefined>();

    const validateCSRGenInputs = false;

    const keySizesOptions = value.keyMetadata.type === "RSA" ? RSAKeySizes : ECKeySizes;

    return (
        <Grid container spacing={3} flexDirection={"column"}>
            <Grid item container spacing={2}>
                <Grid item xs={12}>
                    <SubsectionTitle>Subject Public Key Information</SubsectionTitle>
                </Grid>
                <Grid item xs={6}>
                    <Select label="Key Type" value={value.keyMetadata.type} onChange={(ev) => {
                        switch (ev.target.value) {
                        case "ECDSA":
                            onChange({ ...value, keyMetadata: { type: ev.target.value, size: defaultECKeySizes } });
                            break;

                        case "RSA":
                            onChange({ ...value, keyMetadata: { type: ev.target.value, size: defaultRSAKeySize } });
                            break;

                        default:
                            onChange({ ...value, keyMetadata: { ...value.keyMetadata, type: "RSA" } });
                            break;
                        }
                    }}>
                        <MenuItem value="RSA">RSA</MenuItem>
                        <MenuItem value="ECDSA">ECDSA</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={6}>
                    <Select label="Key Size" value={value.keyMetadata.size} onChange={(ev) => {
                        switch (typeof ev.target.value) {
                        case "number":
                            onChange({ ...value, keyMetadata: { ...value.keyMetadata, size: ev.target.value } });
                            break;

                        default:
                            onChange({ ...value, keyMetadata: { ...value.keyMetadata, size: 4096 } });
                            break;
                        }
                    }}>
                        {
                            keySizesOptions.map((kSize, idx) => {
                                return <MenuItem key={idx} value={kSize}>{kSize}</MenuItem>;
                            })
                        }

                    </Select>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Divider />
            </Grid>
            <Grid item container spacing={2}>
                <Grid item xs={12}>
                    <SubsectionTitle>Subject</SubsectionTitle>
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Common Name" value={value.subject.cn} onChange={ev => onChange({ ...value, subject: { ...value.subject, cn: ev.target.value } })} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField label="Country" value={value.subject.country} onChange={ev => onChange({ ...value, subject: { ...value.subject, country: ev.target.value } })} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField label="State / Province" value={value.subject.state} onChange={ev => onChange({ ...value, subject: { ...value.subject, state: ev.target.value } })} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField label="Locality" value={value.subject.locality} onChange={ev => onChange({ ...value, subject: { ...value.subject, locality: ev.target.value } })} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField label="Organization" value={value.subject.o} onChange={ev => onChange({ ...value, subject: { ...value.subject, o: ev.target.value } })} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField label="Organization Unit" value={value.subject.ou} onChange={ev => onChange({ ...value, subject: { ...value.subject, ou: ev.target.value } })} />
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Divider />
            </Grid>

            <Grid item container spacing={2}>
                <Grid item xs={12}>
                    <SubsectionTitle>Extension Request - Subject Alternative Name</SubsectionTitle>
                </Grid>
                <Grid item xs={12} container flexDirection={"column"}>
                    {
                        value.sanDNSs.map((dns, idx) => {
                            return (
                                <Grid key={idx} item container spacing={2}>
                                    <Grid item xs={1}>
                                        DNS
                                    </Grid>
                                    <Grid item xs container spacing={1}>
                                        <Grid item xs="auto">
                                            <IconButton size="small" aria-label="delete" color="primary" sx={{ fontSize: "10px" }} onClick={() => {
                                                const newArray = [...value.sanDNSs];
                                                newArray.splice(idx, 1);
                                                onChange({ ...value, sanDNSs: [...newArray] });
                                            }}>
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        </Grid>
                                        <Grid item xs>
                                            {dns}
                                        </Grid>
                                    </Grid>
                                </Grid>

                            );
                        })
                    }
                </Grid>
                <Grid item xs={12} container alignItems={"end"} spacing={2}>
                    <Grid item xs>
                        <TextField label="Subject Alternative Name" value={newSanDNS} onChange={ev => setNewSanDNS(ev.target.value)} />
                    </Grid>
                    <Grid item xs="auto">
                        <MonoChromaticButton disabled={newSanDNS === undefined || newSanDNS === ""} onClick={() => {
                            if (newSanDNS) {
                                onChange({ ...value, sanDNSs: [...value.sanDNSs, newSanDNS] });
                                setNewSanDNS("");
                            }
                        }}>Add</MonoChromaticButton>
                    </Grid>
                </Grid>
            </Grid>
        </Grid >
    );
};

export default X509Form;
