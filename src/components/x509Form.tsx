import { Button, Chip, Divider, Typography } from "@mui/material";
import { Select } from "components/Select";
import { TextField } from "./TextField";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState } from "react";
import { SANExtension, SANExtensionType } from "utils/crypto/x509";

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
    san: SANExtension[]
}

interface X509FormProps {
    value: X509Value
    onChange: (newVal: X509Value) => void
}

const X509Form: React.FC<X509FormProps> = ({ value, onChange }) => {
    const [newSan, setNewSan] = useState<{ type: SANExtensionType, value: string }>({ type: SANExtensionType.DNSName, value: "" });

    const keySizesOptions = value.keyMetadata.type === "RSA" ? RSAKeySizes : ECKeySizes;

    return (
        <Grid container spacing={3}>
            <Grid xs={12} container spacing={2}>
                <Grid xs={12}>
                    <Typography variant="h4">Subject Public Key Information</Typography>
                </Grid>
                <Grid xs={6}>
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
                    }}
                    options={[
                        { value: "RSA", render: "RSA" },
                        { value: "ECDSA", render: "ECDSA" }
                    ]} />
                </Grid>
                <Grid xs={6}>
                    <Select label="Key Size" value={value.keyMetadata.size} onChange={(ev) => {
                        switch (typeof ev.target.value) {
                        case "number":
                            onChange({ ...value, keyMetadata: { ...value.keyMetadata, size: ev.target.value } });
                            break;
                        }
                    }} options={
                        keySizesOptions.map((kSize, idx) => {
                            return { value: kSize, render: kSize.toString() };
                        })
                    } />
                </Grid>
            </Grid>
            <Grid xs={12}>
                <Divider />
            </Grid>

            <Grid xs={12} container spacing={2}>
                <Grid xs={12}>
                    <Typography variant="h4">Subject</Typography>
                </Grid>
                <Grid xs={12}>
                    <TextField label="Common Name" value={value.subject.cn} onChange={ev => onChange({ ...value, subject: { ...value.subject, cn: ev.target.value } })} />
                </Grid>
                <Grid xs={12} md={4}>
                    <TextField label="Country" value={value.subject.country} onChange={ev => onChange({ ...value, subject: { ...value.subject, country: ev.target.value } })} />
                </Grid>
                <Grid xs={12} md={4}>
                    <TextField label="State / Province" value={value.subject.state} onChange={ev => onChange({ ...value, subject: { ...value.subject, state: ev.target.value } })} />
                </Grid>
                <Grid xs={12} md={4}>
                    <TextField label="Locality" value={value.subject.locality} onChange={ev => onChange({ ...value, subject: { ...value.subject, locality: ev.target.value } })} />
                </Grid>
                <Grid xs={12} md={6}>
                    <TextField label="Organization" value={value.subject.o} onChange={ev => onChange({ ...value, subject: { ...value.subject, o: ev.target.value } })} />
                </Grid>
                <Grid xs={12} md={6}>
                    <TextField label="Organization Unit" value={value.subject.ou} onChange={ev => onChange({ ...value, subject: { ...value.subject, ou: ev.target.value } })} />
                </Grid>
            </Grid>

            <Grid xs={12}>
                <Divider />
            </Grid>

            <Grid xs={12} container spacing={2}>
                <Grid xs={12}>
                    <Typography variant="h4">Extension Request - Subject Alternative Name</Typography>
                </Grid>
                <Grid xs={12} container flexDirection={"column"}>
                    {
                        value.san.map((sanExt, idx) => {
                            let sanExtVal = "";
                            switch (sanExt.type) {
                            case "DNSName":
                                sanExtVal = sanExt.DNSName!;
                                break;
                            case "IPAddress":
                                sanExtVal = sanExt.IPAddress!;
                                break;

                            case "URI":
                                sanExtVal = sanExt.URI!;
                                break;

                            case "Rfc822Name":
                                sanExtVal = sanExt.rfc822Name!;
                                break;

                            default:
                                break;
                            }
                            return (
                                <Grid key={idx} container spacing={1}>
                                    <Grid xs="auto">
                                        <Chip label={`${sanExt.type}: ${sanExtVal}`} onDelete={() => {
                                            const newArray = [...value.san];
                                            newArray.splice(idx, 1);
                                            onChange({ ...value, san: [...newArray] });
                                        }} />
                                    </Grid>
                                </Grid>
                            );
                        })
                    }
                </Grid>
                <Grid xs={12} container alignItems={"end"} spacing={2}>
                    <Grid xs={3}>
                        <Select label="Subject Alternative Name Type" value={newSan?.type} options={[
                            { value: SANExtensionType.DNSName, render: "DNS" },
                            { value: SANExtensionType.Rfc822Name, render: "Email" },
                            { value: SANExtensionType.IPAddress, render: "IP Address" },
                            { value: SANExtensionType.URI, render: "URI" }
                        ]} onChange={ev => {
                            const type = ev.target.value as SANExtensionType;
                            setNewSan({ ...newSan, type });
                        }} />
                    </Grid>
                    <Grid xs>
                        <TextField label="Subject Alternative Name Value" value={newSan?.value} onChange={ev => {
                            setNewSan({ ...newSan, value: ev.target.value });
                        }} />
                    </Grid>
                    <Grid xs="auto">
                        <Button disabled={newSan === undefined} onClick={() => {
                            if (newSan) {
                                const san: SANExtension = { type: newSan.type };
                                switch (newSan.type) {
                                case SANExtensionType.DNSName:
                                    san.DNSName = newSan.value;
                                    break;
                                case SANExtensionType.IPAddress:
                                    san.IPAddress = newSan.value;
                                    break;
                                case SANExtensionType.URI:
                                    san.URI = newSan.value;
                                    break;
                                case SANExtensionType.Rfc822Name:
                                    san.rfc822Name = newSan.value;
                                    break;
                                default:
                                    break;
                                }

                                onChange({ ...value, san: [...value.san, san] });
                                setNewSan({ ...newSan, value: "" });
                            }
                        }}>Add</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default X509Form;
