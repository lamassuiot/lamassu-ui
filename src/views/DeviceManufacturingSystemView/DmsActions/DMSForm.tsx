import React, { useEffect, useState } from "react";

import { Button, Chip, Dialog, DialogContent, DialogTitle, Divider, Grid, MenuItem, Skeleton, Typography, useTheme } from "@mui/material";
import * as CG from "react-icons/cg";
import { useForm } from "react-hook-form";
import { Icon } from "components/LamassuComponents/dui/IconInput";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { FormIconInput } from "components/LamassuComponents/dui/form/IconInput";
import { FormSwitch } from "components/LamassuComponents/dui/form/Switch";
import Label from "components/LamassuComponents/dui/typographies/Label";
import CertificateImporter from "components/LamassuComponents/composed/CreateCAForm/CertificateImporter";
import { TextField } from "components/LamassuComponents/dui/TextField";
import * as caApicalls from "ducks/features/cas/apicalls";
import CASelector from "components/LamassuComponents/lamassu/CASelector";
import { FormMultiTextInput } from "components/LamassuComponents/dui/form/MultiTextInput";
import { CertificateAuthority } from "ducks/features/cas/models";
import { DMS } from "ducks/features/dms-enroller/models";
import { useDispatch } from "react-redux";

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
        estAuthMode: "BOOTSTRAP_MTLS";
        enrollmentCA: undefined | CertificateAuthority;
        validationCAs: CertificateAuthority[];
        overrideEnrollment: boolean,
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
        managedCAs: CertificateAuthority[]
        staticCAs: StaticCertificate[]
    },
    iotIntegrations: {
        enableShadow: boolean;
        enableCADistributionSync: boolean
        shadowType: "classic" | "named";
    }
};

interface Props {
    dms?: DMS,
    onSubmit: (dms: any) => void
}

export const DMSForm: React.FC<Props> = ({ dms, onSubmit }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const editMode = dms !== undefined;
    const [loading, setLoading] = useState(true);

    const { control, setValue, reset, getValues, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            dmsDefinition: {
                name: "",
                deploymentMode: "cloud"
            },
            enrollProtocol: {
                protocol: "EST",
                estAuthMode: "BOOTSTRAP_MTLS",
                overrideEnrollment: false,
                enrollmentCA: undefined,
                validationCAs: []
            },
            enrollDeviceRegistration: {
                icon: {
                    bg: "#25eee2",
                    fg: "#333333",
                    icon: { icon: CG.CgSmartphoneChip, name: "CgSmartphoneChip" }
                },
                tags: ["iot"]
            },
            reEnroll: {
                allowedRenewalDelta: "100d",
                allowExpired: false
            },
            caDistribution: {
                includeDownstream: true,
                includeAuthorized: true,
                managedCAs: [],
                staticCAs: []
            },
            iotIntegrations: {
                enableShadow: true,
                enableCADistributionSync: true,
                shadowType: "classic"
            }
        }
    });

    useEffect(() => {
        const run = async () => {
            if (!editMode) {
                setLoading(false);
            } else {
                const casResp = await caApicalls.getCAs(100, 0, "asc", "name", []);
                console.log(dms);
                const updateDMS : FormData = {
                    dmsDefinition: {
                        name: dms.name,
                        deploymentMode: dms.cloud_dms ? "cloud" : "onpremise"
                    },
                    enrollProtocol: {
                        protocol: "EST",
                        estAuthMode: dms!.identity_profile.general_setting.enrollment_mode === "BOOTSTRAP_MTLS" ? "BOOTSTRAP_MTLS" : "BOOTSTRAP_MTLS",
                        overrideEnrollment: dms!.identity_profile.enrollment_settings.allow_new_auto_enrollment,
                        enrollmentCA: casResp.cas.find(ca => ca.name === dms!.identity_profile.enrollment_settings.authorized_ca)!,
                        validationCAs: dms!.identity_profile.enrollment_settings.bootstrap_cas.map(ca => casResp.cas.find(caF => caF.name === ca)!)
                    },
                    enrollDeviceRegistration: {
                        icon: {
                            bg: dms!.identity_profile.enrollment_settings.color.split("-")[0],
                            fg: dms!.identity_profile.enrollment_settings.color.split("-")[1],
                            icon: { icon: CG.CgSmartphoneChip, name: "CgSmartphoneChip" }
                        },
                        tags: dms!.identity_profile.enrollment_settings.tags
                    },
                    reEnroll: {
                        allowedRenewalDelta: dms!.identity_profile.reenrollment_settings.preventive_renewal_interval,
                        allowExpired: dms!.identity_profile.reenrollment_settings.allow_expired_renewal
                    },
                    caDistribution: {
                        includeAuthorized: true,
                        includeDownstream: dms!.identity_profile.ca_distribution_settings.include_lamassu_downstream_ca,
                        managedCAs: dms!.identity_profile.ca_distribution_settings.managed_cas.map(ca => casResp.cas.find(caF => caF.name === ca)!),
                        staticCAs: []
                    },
                    iotIntegrations: {
                        enableShadow: true,
                        enableCADistributionSync: dms!.identity_profile.aws_iotcore_publish,
                        shadowType: dms!.aws.shadow_type.toLowerCase() === "classic" ? "classic" : "named"
                    }
                };
                console.log(updateDMS);
                setLoading(false);
                reset(updateDMS);
            }
        };
        run();
    }, []);

    if (loading) {
        return (
            <>
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            </>
        );
    }

    const submit = handleSubmit(data => {
        const run = async () => {
            const actionPayload = {
                name: data.dmsDefinition.name,
                cloud_dms: data.dmsDefinition.deploymentMode === "cloud",
                aws: {
                    shadow_type: data.iotIntegrations.shadowType === "classic" ? "CLASSIC" : "NAMED"
                },
                identity_profile: {
                    general_setting: {
                        enrollment_mode: data.enrollProtocol.protocol
                    },
                    enrollment_settings: {
                        authentication_mode: data.enrollProtocol.estAuthMode,
                        allow_new_auto_enrollment: data.enrollProtocol.overrideEnrollment,
                        tags: data.enrollDeviceRegistration.tags,
                        icon: data.enrollDeviceRegistration.icon.icon.name,
                        color: `${data.enrollDeviceRegistration.icon.bg}-${data.enrollDeviceRegistration.icon.fg}`,
                        authorized_ca: data.enrollProtocol.enrollmentCA?.name,
                        bootstrap_cas: data.enrollProtocol.validationCAs.map(ca => ca.name)
                    },
                    reenrollment_settings: {
                        allow_expired_renewal: data.reEnroll.allowExpired,
                        preventive_renewal_interval: data.reEnroll.allowedRenewalDelta
                    },
                    ca_distribution_settings: {
                        include_lamassu_downstream_ca: data.caDistribution.includeDownstream,
                        managed_cas: data.caDistribution.managedCAs.map(ca => ca.name),
                        static_cas:
                            data.caDistribution.staticCAs.map(ca => {
                                return {
                                    id: ca.name,
                                    certificate: ca.certificate
                                };
                            })
                    },
                    aws_iotcore_publish: data.iotIntegrations.enableCADistributionSync
                }
            };
            onSubmit(actionPayload);
        };
        run();
    });

    return (
        <form onSubmit={submit}>
            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: "100%", paddingY: "20px" }}>
                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Device Manufacturing Definition</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12}>
                        <FormTextField label="DMS Name" control={control} name="dmsDefinition.name" disabled={editMode} />
                    </Grid>
                    <Grid item xs={12}>
                        <FormSelect control={control} name="dmsDefinition.deploymentMode" label="Deployment Mode" disabled={editMode}>
                            <MenuItem value={"cloud"}>Hosted by Lamassu</MenuItem>
                            <MenuItem disabled value={"onpremise"}>On Premise</MenuItem>
                        </FormSelect>
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
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
                        <FormMultiTextInput control={control} name="enrollDeviceRegistration.tags" label="Tags" multiple freeSolo options={[]} disabled />
                        {/* <MultiTextInput label="Tags" multiple freeSolo options={[]} disabl /> */}
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Enrollment Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12}>
                        <FormSelect control={control} name="enrollProtocol.protocol" label="Protocol">
                            <MenuItem value={"EST"}>Enrollment Over Secure Transport</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={12}>
                        <FormSelect control={control} name="enrollProtocol.estAuthMode" label="Authentication Mode">
                            <MenuItem value={"BOOTSTRAP_MTLS"}>Mutual TLS</MenuItem>
                            <MenuItem disabled value={"JWT"}>JWT</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={12}>
                        <CASelector value={getValues("enrollProtocol.enrollmentCA")} onSelect={(elems) => {
                            if (!Array.isArray(elems)) {
                                setValue("enrollProtocol.enrollmentCA", elems);
                            }
                        }} multiple={false} label="Enrollment CA"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CASelector value={getValues("enrollProtocol.validationCAs")} onSelect={(elems) => {
                            if (Array.isArray(elems)) {
                                setValue("enrollProtocol.validationCAs", elems);
                            }
                        }} multiple={true} label="Validation CA (Bootstrap CA)" />
                    </Grid>
                    <Grid item xs={12}>
                        <FormSwitch control={control} name="enrollProtocol.overrideEnrollment" label="Allow Override Enrollment" />
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
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
                        <FormTextField control={control} name="reEnroll.allowedRenewalDelta" label="Allowed Renewal Period" />
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
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
                    <Grid item xs={12} container>
                        <CASelector onSelect={(elems) => {
                            if (Array.isArray(elems)) {
                                setValue("caDistribution.managedCAs", elems);
                            }
                        }} multiple={true} label="Managed CAs" />
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

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>AWS IoT Settings</SubsectionTitle>
                    </Grid>

                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSwitch control={control} name="iotIntegrations.enableShadow" label="Enable Shadow Sync" />
                    </Grid>

                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSwitch control={control} name="iotIntegrations.enableCADistributionSync" label="Enable CA Distribution using retained message" />
                    </Grid>

                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSelect control={control} name="iotIntegrations.shadowType" label="AWS Shadow Type">
                            <MenuItem value={"classic"}>Classic Shadow</MenuItem>
                            <MenuItem value={"named"}>Named Shadow</MenuItem>
                        </FormSelect>
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container>
                    <Grid item>
                        <Button variant="contained" type="submit">Create DMS</Button>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
};
