import React, { useEffect, useState } from "react";

import { Button, Divider, Grid, MenuItem, Skeleton } from "@mui/material";
import { useForm } from "react-hook-form";
import { Icon } from "components/LamassuComponents/dui/IconInput";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { FormIconInput } from "components/LamassuComponents/dui/form/IconInput";
import { FormSwitch } from "components/LamassuComponents/dui/form/Switch";
import { DMS } from "ducks/features/dms-enroller/models";
import { FormMultiTextInput } from "components/LamassuComponents/dui/form/MultiTextInput";
import { CertificateAuthority, getCAs } from "ducks/features/cav3/apicalls";
import CASelectorV2 from "components/LamassuComponents/lamassu/CASelectorV2";

type FormData = {
    dmsDefinition: {
        name: string;
        deploymentMode: "onpremise" | "cloud";
    }
    enrollProtocol: {
        protocol: "EST"
        estAuthMode: "MutualTLS";
        registrationMode: "JITP" | "PreRegister";
        chainValidation: number;
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
        additionalValidationCAs: CertificateAuthority[];
    },
    caDistribution: {
        includeDownstream: boolean;
        includeAuthorized: boolean;
        managedCAs: CertificateAuthority[]
    },
    iotIntegrations: {
        enableShadow: boolean;
        enableCADistributionSync: boolean
        shadowType: "classic" | "named";
    }
};

interface Props {
    dms?: DMS,
    onSubmit: (dms: any) => void,
    actionLabel?: string
}

export const DMSForm: React.FC<Props> = ({ dms, onSubmit, actionLabel = "Create" }) => {
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
                estAuthMode: "MutualTLS",
                chainValidation: -1,
                registrationMode: "JITP",
                overrideEnrollment: false,
                enrollmentCA: undefined,
                validationCAs: []
            },
            enrollDeviceRegistration: {
                icon: {
                    bg: "#25eee2",
                    fg: "#333333",
                    name: "CgSmartphoneChip"
                },
                tags: ["iot"]
            },
            reEnroll: {
                allowedRenewalDelta: "100d",
                allowExpired: false,
                additionalValidationCAs: []
            },
            caDistribution: {
                includeDownstream: true,
                includeAuthorized: true,
                managedCAs: []
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
                const casResp = await getCAs();
                const updateDMS: FormData = {
                    dmsDefinition: {
                        name: dms.name,
                        deploymentMode: dms.cloud_dms ? "cloud" : "onpremise"
                    },
                    enrollProtocol: {
                        protocol: "EST",
                        estAuthMode: dms!.identity_profile.general_setting.enrollment_mode === "MutualTLS" ? "MutualTLS" : "MutualTLS",
                        overrideEnrollment: dms!.identity_profile.enrollment_settings.allow_new_auto_enrollment,
                        enrollmentCA: casResp.list.find(ca => ca.id === dms!.identity_profile.enrollment_settings.authorized_ca)!,
                        validationCAs: dms!.identity_profile.enrollment_settings.bootstrap_cas.map(ca => casResp.list.find(caF => caF.id === ca)!),
                        chainValidation: dms!.identity_profile.enrollment_settings.chain_validation_level,
                        registrationMode: dms!.identity_profile.enrollment_settings.registration_mode === "JITP" ? "JITP" : "PreRegister"
                    },
                    enrollDeviceRegistration: {
                        icon: {
                            bg: dms!.identity_profile.enrollment_settings.color.split("-")[0],
                            fg: dms!.identity_profile.enrollment_settings.color.split("-")[1],
                            name: dms!.identity_profile.enrollment_settings.icon
                        },
                        tags: dms!.identity_profile.enrollment_settings.tags
                    },
                    reEnroll: {
                        allowedRenewalDelta: dms!.identity_profile.reenrollment_settings.preventive_renewal_interval,
                        allowExpired: dms!.identity_profile.reenrollment_settings.allow_expired_renewal,
                        additionalValidationCAs: dms!.identity_profile.reenrollment_settings.additional_validation_cas.map(ca => casResp.list.find(caF => caF.id === ca)!)
                    },
                    caDistribution: {
                        includeAuthorized: true,
                        includeDownstream: dms!.identity_profile.ca_distribution_settings.include_lamassu_downstream_ca,
                        managedCAs: dms!.identity_profile.ca_distribution_settings.managed_cas.map(ca => casResp.list.find(caF => caF.id === ca)!)
                    },
                    iotIntegrations: {
                        enableShadow: true,
                        enableCADistributionSync: dms!.identity_profile.aws_iotcore_publish,
                        shadowType: dms!.aws.shadow_type.toLowerCase() === "classic" ? "classic" : "named"
                    }
                };
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
                status: "APPROVED",
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
                        icon: data.enrollDeviceRegistration.icon.name,
                        color: `${data.enrollDeviceRegistration.icon.bg}-${data.enrollDeviceRegistration.icon.fg}`,
                        authorized_ca: data.enrollProtocol.enrollmentCA?.id,
                        bootstrap_cas: data.enrollProtocol.validationCAs.map(ca => ca.id),
                        registration_mode: data.enrollProtocol.registrationMode,
                        chain_validation_level: Number(data.enrollProtocol.chainValidation)
                    },
                    reenrollment_settings: {
                        allow_expired_renewal: data.reEnroll.allowExpired,
                        preventive_renewal_interval: data.reEnroll.allowedRenewalDelta,
                        additional_validation_cas: data.reEnroll.additionalValidationCAs.map(ca => ca.id)
                    },
                    ca_distribution_settings: {
                        include_lamassu_downstream_ca: data.caDistribution.includeDownstream,
                        managed_cas: data.caDistribution.managedCAs.map(ca => ca.id)
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
                    <Grid item xs={12}>
                        <FormSelect control={control} name="enrollProtocol.registrationMode" label="Registration Mode">
                            <MenuItem value={"JITP"}>JITP</MenuItem>
                            <MenuItem value={"PreRegister"}>Enforce Pre Registration</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs="auto">
                        <FormIconInput control={control} name="enrollDeviceRegistration.icon" label="Icon" />
                    </Grid>
                    <Grid item xs>
                        <FormMultiTextInput control={control} name="enrollDeviceRegistration.tags" label="Tags" />
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
                            <MenuItem value={"MutualTLS"}>Mutual TLS</MenuItem>
                            <MenuItem disabled value={"NOAUTH"}>No Auth</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={12}>
                        <CASelectorV2 value={getValues("enrollProtocol.enrollmentCA")} onSelect={(elems) => {
                            if (!Array.isArray(elems)) {
                                setValue("enrollProtocol.enrollmentCA", elems);
                            }
                        }} multiple={false} label="Enrollment CA" selectLabel="Select Enrollment CA"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CASelectorV2 value={getValues("enrollProtocol.validationCAs")} onSelect={(elems) => {
                            if (Array.isArray(elems)) {
                                setValue("enrollProtocol.validationCAs", elems);
                            }
                        }} multiple={true} label="Validation CAs" selectLabel="Select Validation CAs"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormSwitch control={control} name="enrollProtocol.overrideEnrollment" label="Allow Override Enrollment" />
                    </Grid>
                    <Grid item xs={12}>
                        <FormTextField label="Chain Validation Level (-1 equals full chain)" control={control} name="enrollProtocol.chainValidation" type="number" />
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
                    <Grid item xs={12}>
                        <CASelectorV2 value={getValues("reEnroll.additionalValidationCAs")} onSelect={(elems) => {
                            if (Array.isArray(elems)) {
                                setValue("reEnroll.additionalValidationCAs", elems);
                            }
                        }} multiple={true} label="Additional Validation CAs" selectLabel="Select Validation CAs"
                        />
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
                        <CASelectorV2 selectLabel="Select CAs to be trusted by the Device" onSelect={(elems) => {
                            if (Array.isArray(elems)) {
                                setValue("caDistribution.managedCAs", elems);
                            }
                        }} multiple={true} label="Managed CAs" />
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
                        <Button variant="contained" type="submit">{`${actionLabel} DMS`}</Button>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
};
