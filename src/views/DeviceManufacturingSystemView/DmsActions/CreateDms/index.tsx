import React, { useState } from "react";

import { Button, Chip, Dialog, DialogContent, DialogTitle, Divider, Grid, MenuItem, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "ducks/hooks";
import * as dmsSelector from "ducks/features/dms-enroller/reducer";
import { useDispatch } from "react-redux";
import * as caSelector from "ducks/features/cas/reducer";
import * as CG from "react-icons/cg";
import { useForm } from "react-hook-form";
import { Icon } from "components/LamassuComponents/dui/IconInput";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { FormIconInput } from "components/LamassuComponents/dui/form/IconInput";
import { FormMultiTextInput } from "components/LamassuComponents/dui/form/MultiTextInput";
import { FormSwitch } from "components/LamassuComponents/dui/form/Switch";
import Label from "components/LamassuComponents/dui/typographies/Label";
import CertificateImporter from "components/LamassuComponents/composed/CreateCAForm/CertificateImporter";
import { TextField } from "components/LamassuComponents/dui/TextField";

type StaticCertificate = {
    name: string
    certificate: string
}

const StaticCertificateListInput = () => {
    const [openAddCertModal, setOpenAddCertModal] = useState(false);
    const [certificates, setCertificates] = useState<StaticCertificate[]>([]);

    const [newCertificateName, setNewCertificateName] = useState("");

    return (
        <Grid container spacing={1} alignItems={"center"}>
            {
                certificates.map((cert, idx) => (
                    <Grid item key={idx}>
                        <Chip label={cert.name} sx={{ borderRadius: "5px" }} onDelete={() => {
                            const newArray = [...certificates];
                            newArray.splice(idx, 1);
                            setCertificates(newArray);
                        }} />
                    </Grid>
                ))
            }
            <Grid item>
                <Button variant="outlined" onClick={() => { setOpenAddCertModal(true); }}>Add New Certificate</Button>
            </Grid>
            {
                openAddCertModal && (
                    <Dialog open={openAddCertModal} onClose={() => setOpenAddCertModal(false)} maxWidth={"md"}>
                        <DialogTitle>
                            <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>Add New Certificate</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} flexDirection={"column"}>
                                <Grid item>
                                    <TextField label="Name" value={newCertificateName} onChange={(ev) => setNewCertificateName(ev.target.value)} />
                                </Grid>
                                <Grid item>
                                    <CertificateImporter onCreate={(crt) => {
                                        setCertificates([...certificates, { certificate: crt, name: newCertificateName }]);
                                        setOpenAddCertModal(false);
                                        setNewCertificateName("");
                                    }} />
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Dialog>
                )
            }
        </Grid>
    );
};

type FormData = {
    dmsDefinition: {
        name: string;
        deploymentMode: "onpremise" | "cloud";
    }
    enrollProtocol: {
        protocol: "EST"
        estAuthMode: "mTLS";
        overrideEnrollment: false,
    }
    enrollDeviceRegistration: {
        icon: Icon,
        tags: string[]
    },
    reEnroll: {
        allowedRenewalDelta: string;
        allowExpired: boolean;
    },
    caDistribution: {
        includeDownstream: boolean;
        includeAuthorized: boolean;
    },
    iotIntegrations: {
        enableShadow: boolean;
        shadowType: "classic" | "named";
    }
};

export const CreateDms = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestSt1tus = useAppSelector((state) => dmsSelector.getRequestStatus(state)!);
    const privateKey = useAppSelector((state) => dmsSelector.getLastCreatedDMSPrivateKey(state)!);

    const { control, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            dmsDefinition: {
                name: "",
                deploymentMode: "cloud"
            },
            enrollProtocol: {
                protocol: "EST",
                estAuthMode: "mTLS",
                overrideEnrollment: false
            },
            enrollDeviceRegistration: {
                icon: {
                    bg: "#25eee2",
                    fg: "#333333",
                    icon: { icon: CG.CgSmartphoneChip, name: "CgSmartphoneChip" }
                },
                tags: []
            },
            reEnroll: {
                allowedRenewalDelta: "100d",
                allowExpired: false
            },
            caDistribution: {
                includeDownstream: true,
                includeAuthorized: true
            },
            iotIntegrations: {
                enableShadow: true,
                shadowType: "classic"
            }
        }
    });

    const [displayPrivKeyView, setDisplayPrivKeyView] = useState(false);
    const caList = useAppSelector((state) => caSelector.getCAs(state));
    const totalCAs = useAppSelector((state) => caSelector.getTotalCAs(state));

    // const handleCreateDms = () => {
    //     dispatch(dmsAction.createDMSWithFormAction.request({
    //         form: {
    //             subject: {
    //                 common_name: cn,
    //                 country: country,
    //                 locality: city,
    //                 organization: org,
    //                 organization_unit: orgUnit,
    //                 state: state
    //             },
    //             key_metadata: {
    //                 bits: keyBits.value,
    //                 type: keyType
    //             },
    //             host_cloud_dms: hostCloudDMS,
    //             bootstrap_cas: selectedBootstrapCAs
    //         }
    //     }));
    // };

    const onSubmit = handleSubmit(data => console.log(data));

    return (
        <form onSubmit={onSubmit}>
            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: "100%" }}>
                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Device Manufacturing Definition</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12}>
                        <FormTextField label="DMS Name" control={control} name="dmsDefinition.name" />
                    </Grid>
                    <Grid item xs={12}>
                        <FormSelect control={control} name="dmsDefinition.deploymentMode" label="Deployment Mode">
                            <MenuItem value={"cloud"}>Hosted by Lamassu</MenuItem>
                            <MenuItem value={"onpremise"}>On Premise</MenuItem>
                        </FormSelect>
                    </Grid>
                </Grid>

                <Grid item>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Enrollment Device Registration</SubsectionTitle>
                    </Grid>
                    <Grid item xs="auto">
                        <FormIconInput control={control} name="enrollDeviceRegistration.icon" label="Icon" />
                    </Grid>
                    <Grid item xs>
                        <FormMultiTextInput control={control} name="enrollDeviceRegistration.tags" label="Tags" multiple freeSolo options={[]} />
                    </Grid>
                </Grid>

                <Grid item>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>ReEnrollment Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12}>
                        <FormSwitch control={control} name="reEnroll.allowExpired" label="Allow Expired Renewal" />
                    </Grid>
                    <Grid item xs={12}>
                        <FormTextField control={control} name="reEnroll.allowedRenewalDelta" label="Allowed Renewal Period"/>
                    </Grid>
                </Grid>

                <Grid item>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>CA Distribution</SubsectionTitle>
                    </Grid>
                    {/* <Grid item xs={12}>
                        <CASelector />
                    </Grid> */}
                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSwitch control={control} name="caDistribution.includeDownstream" label="Include &apos;Downstream&apos; CA used by Lamassu" />
                    </Grid>
                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSwitch control={control} name="caDistribution.includeAuthorized" label="Include Authorized CA" />
                    </Grid>
                    <Grid item xs={12} container flexDirection={"column"}>
                        <Grid item sx={{ marginBottom: "5px" }}>
                            <Label>Static CAs</Label>
                        </Grid>
                        <Grid item>
                            <StaticCertificateListInput />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
};
