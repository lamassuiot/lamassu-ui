/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState } from "react";

import { Alert, Button, Divider, Grid, MenuItem, Skeleton, useTheme, styled, Chip } from "@mui/material";
import { useForm } from "react-hook-form";
import { Icon } from "components/LamassuComponents/dui/IconInput";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { FormIconInput } from "components/LamassuComponents/dui/form/IconInput";
import { FormSwitch } from "components/LamassuComponents/dui/form/Switch";
import { AWSIoTDMSMetadata, AWSIoTDMSMetadataRegistrationMode, AWSIoTPolicy, CreateUpdateDMSPayload, DMS, ESTAuthMode, EnrollmentProtocols, EnrollmentRegistrationMode } from "ducks/features/ra/models";
import { FormMultiTextInput } from "components/LamassuComponents/dui/form/MultiTextInput";
import { getCAs } from "ducks/features/cav3/apicalls";
import CASelectorV2 from "components/LamassuComponents/lamassu/CASelectorV2";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { CertificateAuthority } from "ducks/features/cav3/models";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { apicalls } from "ducks/apicalls";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { Modal } from "components/LamassuComponents/dui/Modal";

export const FullAlert = styled(Alert)(({ theme }) => ({
    "& .MuiAlert-message": {
        width: "100%"
    }
}));

enum AWSSync {
    RequiresSync = "RequiresSync",
    SyncInProgress = "SyncInProgress",
    SyncOK = "SyncOK",
}

type FormData = {
    dmsDefinition: {
        id: string;
        name: string;
    }
    enrollProtocol: {
        protocol: EnrollmentProtocols
        estAuthMode: ESTAuthMode;
        registrationMode: EnrollmentRegistrationMode;
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
        preventiveDelta: string;
        criticalDelta: string;
        allowExpired: boolean;
        additionalValidationCAs: CertificateAuthority[];
    },
    caDistribution: {
        includeDownstream: boolean;
        includeAuthorized: boolean;
        managedCAs: CertificateAuthority[]
    },
    awsIotIntegration: {
        id: string
        accountID: string,
        mode: AWSIoTDMSMetadataRegistrationMode
        enableJITP: boolean;
        thingGroups: string[]
        policies: AWSIoTPolicy[]
        enableShadow: boolean;
        shadowType: "classic" | "named";
        namedShadowName: string
        enableCADistributionSync: boolean
    }
};

interface Props {
    dms?: DMS,
    onSubmit: (dms: CreateUpdateDMSPayload) => void,
    actionLabel?: string
}

const baseDefaultAWSPolicyName = "lms-remediation-access";
const defaultLamassuPolicyName = (dmsid: string) => `${dmsid}.${baseDefaultAWSPolicyName}`;

export const DMSForm: React.FC<Props> = ({ dms, onSubmit, actionLabel = "Create" }) => {
    const editMode = dms !== undefined;
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const { control, setValue, reset, getValues, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            dmsDefinition: {
                id: "",
                name: ""
            },
            enrollProtocol: {
                protocol: EnrollmentProtocols.EST,
                estAuthMode: ESTAuthMode.ClientCertificate,
                chainValidation: -1,
                registrationMode: EnrollmentRegistrationMode.JITP,
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
                preventiveDelta: "31d",
                criticalDelta: "7d",
                allowExpired: false,
                additionalValidationCAs: []
            },
            caDistribution: {
                includeDownstream: true,
                includeAuthorized: true,
                managedCAs: []
            },
            awsIotIntegration: {
                id: "",
                accountID: "",
                mode: AWSIoTDMSMetadataRegistrationMode.Auto,
                enableJITP: true,
                enableShadow: true,
                enableCADistributionSync: true,
                shadowType: "classic",
                namedShadowName: "lamassu-identity",
                thingGroups: ["LAMASSU"],
                policies: []
            }
        }
    });

    const watchDmsName = watch("dmsDefinition.name");
    const watchDmsId = watch("dmsDefinition.id");
    const watchEnrollmentCA = watch("enrollProtocol.enrollmentCA");
    const watchAwsIotIntegration = watch("awsIotIntegration");

    useEffect(() => {
        if (!editMode) {
            const dmsID = watchDmsName.trim().replaceAll(" ", "-").toLowerCase();
            setValue("dmsDefinition.id", dmsID);
        }
    }, [watchDmsName]);

    const registeredInAWSKey = `lamassu.io/iot/${watchAwsIotIntegration.id}`;

    const [awsSync, setAwsSync] = useState(AWSSync.RequiresSync);
    useEffect(() => {
        if (watchEnrollmentCA !== undefined && watchAwsIotIntegration.id !== "") {
            const caMeta = watchEnrollmentCA.metadata;
            if (registeredInAWSKey in caMeta && caMeta[registeredInAWSKey].register === true) {
                setAwsSync(AWSSync.SyncOK);
            } else {
                setAwsSync(AWSSync.RequiresSync);
            }
        }
    }, [watchEnrollmentCA, watchAwsIotIntegration.id]);

    useEffect(() => {
        if (watchAwsIotIntegration.id !== "" && watchAwsIotIntegration.accountID === "") {
            let acc = watchAwsIotIntegration.id;
            const accSplit = acc.split(".");
            if (accSplit.length === 2) {
                acc = accSplit[1];
            }

            setValue("awsIotIntegration.accountID", acc);
        }
    }, [watchAwsIotIntegration.id]);

    // useEffect(() => {
    //     const idx = watchAwsIotIntegration.policies.findIndex(p => p.policy_name === defaultLamassuPolicyName(watchDmsId));
    //     if (idx !== -1) {
    //         const newP = [...watchAwsIotIntegration.policies];
    //         newP.splice(idx, 1);
    //         setValue("awsIotIntegration.policies", [...newP]);
    //     }
    // }, [watchAwsIotIntegration.shadowType, watchAwsIotIntegration.namedShadowName]);

    useEffect(() => {
        const run = async () => {
            if (!editMode) {
                setLoading(false);
            } else {
                const casResp = await getCAs({ bookmark: "", filters: [], limit: 25, sortField: "", sortMode: "asc" });
                const updateDMS: FormData = {
                    dmsDefinition: {
                        id: dms.id,
                        name: dms.name
                    },
                    enrollProtocol: {
                        protocol: dms.settings.enrollment_settings.protocol,
                        estAuthMode: dms.settings.enrollment_settings.est_rfc7030_settings.auth_mode,
                        overrideEnrollment: dms.settings.enrollment_settings.enable_replaceable_enrollment,
                        enrollmentCA: casResp.list.find(ca => ca.id === dms!.settings.enrollment_settings.enrollment_ca)!,
                        validationCAs: dms!.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas.map(ca => casResp.list.find(caF => caF.id === ca)!),
                        chainValidation: dms!.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.chain_level_validation,
                        registrationMode: dms!.settings.enrollment_settings.registration_mode
                    },
                    enrollDeviceRegistration: {
                        icon: {
                            bg: dms!.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-")[0],
                            fg: dms!.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-")[1],
                            name: dms!.settings.enrollment_settings.device_provisioning_profile.icon
                        },
                        tags: dms!.settings.enrollment_settings.device_provisioning_profile.tags
                    },
                    reEnroll: {
                        allowedRenewalDelta: dms!.settings.reenrollment_settings.reenrollment_delta,
                        allowExpired: dms!.settings.reenrollment_settings.enable_expired_renewal,
                        additionalValidationCAs: dms!.settings.reenrollment_settings.additional_validation_cas.map(ca => casResp.list.find(caF => caF.id === ca)!),
                        preventiveDelta: dms.settings.reenrollment_settings.preventive_delta,
                        criticalDelta: dms.settings.reenrollment_settings.critical_delta
                    },
                    caDistribution: {
                        includeAuthorized: dms!.settings.ca_distribution_settings.include_enrollment_ca,
                        includeDownstream: dms!.settings.ca_distribution_settings.include_system_ca,
                        managedCAs: dms!.settings.ca_distribution_settings.managed_cas.map(ca => casResp.list.find(caF => caF.id === ca)!)
                    },
                    awsIotIntegration: {
                        id: "",
                        accountID: "",
                        mode: AWSIoTDMSMetadataRegistrationMode.Auto,
                        enableJITP: true,
                        enableShadow: true,
                        enableCADistributionSync: true,
                        shadowType: "classic",
                        namedShadowName: "lamassu-identity",
                        thingGroups: ["LAMASSU"],
                        policies: []
                    }
                };

                const dmsMeta = dms.metadata;

                const firstConnectorKey = Object.keys(dmsMeta).find(key => key.includes("lamassu.io/iot/"));
                if (firstConnectorKey && firstConnectorKey.startsWith("lamassu.io/iot/aws.")) {
                    const awsMetaConfig: AWSIoTDMSMetadata = dmsMeta[firstConnectorKey];
                    const connectorID = firstConnectorKey.replace("lamassu.io/iot/", "");
                    updateDMS.awsIotIntegration = {
                        id: connectorID,
                        accountID: "",
                        mode: awsMetaConfig.registration_mode,
                        enableJITP: awsMetaConfig.jitp_config.enable_template,
                        enableShadow: awsMetaConfig.shadow_config.enable,
                        enableCADistributionSync: true,
                        shadowType: awsMetaConfig.shadow_config.shadow_name === "" ? "classic" : "named",
                        namedShadowName: awsMetaConfig.shadow_config.shadow_name === "" ? "" : awsMetaConfig.shadow_config.shadow_name,
                        thingGroups: awsMetaConfig.groups,
                        policies: awsMetaConfig.policies
                    };
                }

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
            let awsMeta = {};
            if (data.awsIotIntegration.id !== "") {
                let shadowConfig = {
                    enable: false,
                    shadow_name: ""
                };

                if (data.awsIotIntegration.enableShadow) {
                    shadowConfig = {
                        enable: true,
                        shadow_name: data.awsIotIntegration.shadowType === "classic" ? "" : data.awsIotIntegration.namedShadowName
                    };
                }

                let jitpConfig: any = {
                    enable_template: false,
                    provisioning_role_arn: "",
                    aws_ca_id: ""
                };

                if (data.awsIotIntegration.enableJITP) {
                    jitpConfig = {
                        enable_template: true,
                        provisioning_role_arn: ""
                    };

                    const key = `lamassu.io/iot/${data.awsIotIntegration.id}`;
                    const enrollmentCA = data.enrollProtocol.enrollmentCA;
                    if (enrollmentCA && enrollmentCA.metadata[key] !== undefined) {
                        const awsCertID = enrollmentCA.metadata[key].certificate_id;
                        if (awsCertID !== undefined) {
                            jitpConfig.aws_ca_id = awsCertID;
                        }
                    }
                }

                awsMeta = {
                    [`lamassu.io/iot/${data.awsIotIntegration.id}`]: {
                        registration_mode: data.awsIotIntegration.mode,
                        jitp_config: jitpConfig,
                        shadow_config: shadowConfig,
                        policies: data.awsIotIntegration.policies,
                        groups: data.awsIotIntegration.thingGroups
                    }
                };
            }

            const actionPayload: CreateUpdateDMSPayload = {
                name: data.dmsDefinition.name,
                id: data.dmsDefinition.id,
                metadata: { ...awsMeta },
                settings: {
                    enrollment_settings: {
                        enrollment_ca: data.enrollProtocol.enrollmentCA!.id,
                        protocol: data.enrollProtocol.protocol,
                        enable_replaceable_enrollment: data.enrollProtocol.overrideEnrollment,
                        est_rfc7030_settings: {
                            auth_mode: data.enrollProtocol.estAuthMode,
                            client_certificate_settings: {
                                chain_level_validation: Number(data.enrollProtocol.chainValidation),
                                validation_cas: data.enrollProtocol.validationCAs.map(ca => ca.id)
                            }
                        },
                        device_provisioning_profile: {
                            icon: data.enrollDeviceRegistration.icon.name,
                            icon_color: `${data.enrollDeviceRegistration.icon.bg}-${data.enrollDeviceRegistration.icon.fg}`,
                            metadata: {},
                            tags: data.enrollDeviceRegistration.tags
                        },
                        registration_mode: data.enrollProtocol.registrationMode
                    },
                    reenrollment_settings: {
                        enable_expired_renewal: data.reEnroll.allowExpired,
                        critical_delta: data.reEnroll.criticalDelta,
                        preventive_delta: data.reEnroll.preventiveDelta,
                        reenrollment_delta: data.reEnroll.allowedRenewalDelta,
                        additional_validation_cas: data.reEnroll.additionalValidationCAs.map(ca => ca.id)
                    },
                    ca_distribution_settings: {
                        include_enrollment_ca: false,
                        include_system_ca: data.caDistribution.includeDownstream,
                        managed_cas: data.caDistribution.managedCAs.map(ca => ca.id)
                    }
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
                        <FormTextField label="DMS Name" control={control} name="dmsDefinition.name" />
                    </Grid>
                    <Grid item xs={12}>
                        <FormTextField label="DMS ID" control={control} name="dmsDefinition.id" disabled={editMode} />
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
                            <MenuItem value={EnrollmentRegistrationMode.JITP}>JITP</MenuItem>
                            <MenuItem value={EnrollmentRegistrationMode.PreRegistration}>Pre Registration</MenuItem>
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
                            <MenuItem value={EnrollmentProtocols.EST}>Enrollment Over Secure Transport</MenuItem>
                        </FormSelect>
                    </Grid>

                    <Grid item xs={12}>
                        <FormSelect control={control} name="enrollProtocol.estAuthMode" label="Authentication Mode">
                            <MenuItem value={ESTAuthMode.ClientCertificate}>Client Certificate</MenuItem>
                            <MenuItem disabled value={ESTAuthMode.NoAuth}>No Auth</MenuItem>
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
                    <Grid item xs={3}>
                        <TextField value={watchEnrollmentCA?.issuance_expiration.type === "Duration" ? watchEnrollmentCA?.issuance_expiration.duration : watchEnrollmentCA?.issuance_expiration.time} label="Certificate Lifespan" disabled />
                    </Grid>
                    <Grid item xs={3}>
                        <FormTextField control={control} name="reEnroll.allowedRenewalDelta" label="Allowed Renewal Delta" tooltip="Duration from the certificate's expiration time backwards that enables ReEnrolling. For instance, if the certificate being renew has 150 days left and the 'Allowed Renewal Delta' field is set to 100 days, the ReEnroll request will be denied. If instead the certificate will expire in 99 days, the ReEnroll request will be allowed." />
                    </Grid>
                    <Grid item xs={3}>
                        <FormTextField control={control} name="reEnroll.preventiveDelta" label="Preventive Renewal Delta" tooltip="Duration from the certificate's expiration time backwards that is used to flag the certificate as about to expire. Will trigger cloud remediation action (i.e. Update AWS Thing Shadow if exists) " />
                    </Grid>
                    <Grid item xs={3}>
                        <FormTextField control={control} name="reEnroll.criticalDelta" label="Critical Renewal Delta" tooltip="Duration from the certificate's expiration time backwards. Trigger event when this state is reached and no renewal was performed. Not used by Lamassu's services." />
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
                        <CASelectorV2 value={getValues("caDistribution.managedCAs")} selectLabel="Select CAs to be trusted by the Device" onSelect={(elems) => {
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
                        <FormSelect control={control} name="awsIotIntegration.id" label="AWS IoT Manager Instance">
                            {
                                window._env_.CLOUD_CONNECTORS.map((id: string, idx: number) => {
                                    return (
                                        <MenuItem key={idx} value={id}>{id}</MenuItem>
                                    );
                                })
                            }
                        </FormSelect>
                    </Grid>

                    {
                        watchAwsIotIntegration.id !== "" && (
                            <>
                                <Grid item xs={12} container flexDirection={"column"}>
                                    <FormSelect control={control} name="awsIotIntegration.mode" label="Thing Provisioning">
                                        <MenuItem value={"auto"}>Automatic Registration on Enrollment</MenuItem>
                                        <MenuItem value={"jitp"}>JITP Template</MenuItem>
                                        <MenuItem value={"none"}>None</MenuItem>
                                    </FormSelect>
                                </Grid>

                                {
                                    watchAwsIotIntegration.mode !== "none" && watchEnrollmentCA !== undefined && (
                                        <>
                                            {
                                                awsSync !== AWSSync.SyncOK && watchEnrollmentCA !== undefined && (
                                                    <Grid item xs={12} container flexDirection={"column"}>
                                                        <Alert severity="warning">
                                                            <Grid container flexDirection={"column"}>
                                                                {
                                                                    awsSync === AWSSync.RequiresSync && (
                                                                        <Grid item>
                                                                            <Grid item>
                                                                                The selected Enrollment CA is not registered in AWS. Make sure to synchronize it first.
                                                                            </Grid>
                                                                            <Button onClick={async () => {
                                                                                await apicalls.cas.updateCAMetadata(watchEnrollmentCA.id, {
                                                                                    ...watchEnrollmentCA.metadata,
                                                                                    [registeredInAWSKey]: {
                                                                                        register: true
                                                                                    }
                                                                                });
                                                                                setAwsSync(AWSSync.SyncInProgress);
                                                                            }}>Synchronize CA</Button>
                                                                        </Grid>
                                                                    )
                                                                }
                                                                {
                                                                    awsSync === AWSSync.SyncInProgress && (
                                                                        <Grid item>
                                                                            <Grid item>
                                                                                Registering process underway. CA should be registered soon, click on &apos;Reload & Check&apos; periodically.
                                                                            </Grid>
                                                                            <Button onClick={async () => {
                                                                                const ca = await apicalls.cas.getCA(watchEnrollmentCA.id);
                                                                                setValue("enrollProtocol.enrollmentCA", ca);
                                                                            }}>
                                                                                Reload & Check
                                                                            </Button>
                                                                        </Grid>
                                                                    )
                                                                }
                                                            </Grid>
                                                        </Alert>
                                                    </Grid>
                                                )
                                            }
                                            {
                                                awsSync === AWSSync.SyncOK && registeredInAWSKey in watchEnrollmentCA.metadata && (
                                                    <Grid item xs={12} container flexDirection={"column"}>
                                                        <FullAlert severity="success">
                                                            <Grid container flexDirection={"column"} spacing={2} sx={{ width: "100%" }}>
                                                                <Grid item>
                                                                    The selected Enrollment CA is correctly registered in AWS:
                                                                </Grid>
                                                                <Grid item>
                                                                    <Button onClick={async () => {
                                                                        const ca = await apicalls.cas.getCA(watchEnrollmentCA!.id);
                                                                        setValue("enrollProtocol.enrollmentCA", ca);
                                                                    }}>
                                                                        Reload & Check
                                                                    </Button>
                                                                </Grid>

                                                                <Grid item container flexDirection={"column"} spacing={1} sx={{ width: "100%" }}>
                                                                    {
                                                                        Object.keys(watchEnrollmentCA!.metadata[registeredInAWSKey]).map((key, idx) => {
                                                                            return (
                                                                                <Grid item key={idx} container>
                                                                                    <Grid item xs={2}>
                                                                                        <Label>{key}</Label>
                                                                                    </Grid>
                                                                                    <Grid item xs>
                                                                                        <Label>{watchEnrollmentCA!.metadata[registeredInAWSKey][key]}</Label>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            );
                                                                        })
                                                                    }
                                                                </Grid>
                                                            </Grid>
                                                        </FullAlert>
                                                    </Grid>

                                                )
                                            }

                                            <Grid item xs={12} container flexDirection={"column"}>
                                                <FormMultiTextInput control={control} name="awsIotIntegration.thingGroups" label="AWS Thing Groups" />
                                            </Grid>

                                            <Grid item xs={12} container flexDirection={"column"}>
                                                <AWSPolicyBuilder value={getValues("awsIotIntegration.policies")} onChange={(policies) => setValue("awsIotIntegration.policies", policies)} />
                                            </Grid>
                                        </>
                                    )
                                }

                                {
                                    watchAwsIotIntegration.mode === "jitp" && (
                                        <>
                                            <Grid item xs={12}>
                                                <SubsectionTitle fontSize={"16px"}>Provisioning Template</SubsectionTitle>
                                            </Grid>

                                            <Grid item xs={12} container flexDirection={"column"}>
                                                <FormSwitch control={control} name="awsIotIntegration.enableJITP" label="Enable JITP template" />
                                            </Grid>

                                            {/*
                                                <Grid item xs={12}>
                                                    <SubsectionTitle fontSize={"16px"}>Lamassu &harr; AWS IoT Synchronization</SubsectionTitle>
                                                </Grid>

                                                <Grid item xs={12} container flexDirection={"column"}>
                                                    <FormSelect control={control} name="iotIntegrations.shadowType" label="Revocation Origin">
                                                        <MenuItem value={"classic"}>Only Lamassu</MenuItem>
                                                        <MenuItem value={"named"}>Allow Revocations from AWS (requires infra)</MenuItem>
                                                    </FormSelect>
                                                </Grid>
                                            */}
                                        </>
                                    )
                                }

                                <Grid item xs={12}>
                                    <SubsectionTitle fontSize={"16px"}>Shadows & Device Automation</SubsectionTitle>
                                </Grid>

                                {/* <Grid item xs={12} container flexDirection={"column"}>
                                    <FormSwitch control={control} name="awsIotIntegration.enableCADistributionSync" label="Enable CA Distribution using retained message" />
                                </Grid> */}

                                <Grid item xs={12} container flexDirection={"column"}>
                                    <FormSwitch control={control} name="awsIotIntegration.enableShadow" label="Update Device - Thing Shadow on relevant events" />
                                </Grid>

                                {
                                    watchAwsIotIntegration.enableShadow && (
                                        <Grid item xs={12} container flexDirection={"column"}>
                                            <FormSelect control={control} name="awsIotIntegration.shadowType" label="Shadow Type">
                                                <MenuItem value={"classic"}>Classic</MenuItem>
                                                <MenuItem value={"named"}>Named</MenuItem>
                                            </FormSelect>
                                        </Grid>
                                    )
                                }
                                {
                                    watchAwsIotIntegration.shadowType === "named" && (
                                        <Grid item xs={12}>
                                            <FormTextField label="Named shadow" control={control} name="awsIotIntegration.namedShadowName" />
                                        </Grid>
                                    )
                                }
                                {
                                    watchAwsIotIntegration.enableShadow === true && watchAwsIotIntegration.policies.find(p => p.policy_name === defaultLamassuPolicyName(watchDmsId)) === undefined && (
                                        <Grid item xs={12} container flexDirection={"column"}>
                                            <Alert severity="warning">
                                                <Grid container spacing={2} flexDirection={"column"}>
                                                    <Grid item>
                                                        Make sure to add a policy allowing access to shadow topics
                                                    </Grid>
                                                    <Grid item container spacing={1} flexDirection={"column"}>
                                                        <Grid item>
                                                            <FormTextField label="AWS Account ID" control={control} name="awsIotIntegration.accountID" />
                                                        </Grid>
                                                        <Grid item>
                                                            <Button onClick={async () => {
                                                                setValue("awsIotIntegration.policies", [...getValues("awsIotIntegration.policies"), {
                                                                    policy_name: defaultLamassuPolicyName(watchDmsId),
                                                                    policy_document: policyBuilder(
                                                                        watchAwsIotIntegration.accountID,
                                                                        watchAwsIotIntegration.shadowType === "classic" ? "" : watchAwsIotIntegration.namedShadowName
                                                                    )
                                                                }]);
                                                            }}>{"Add 'lms-remediation-access' Policy"}
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Alert>
                                        </Grid>
                                    )
                                }
                            </>
                        )
                    }
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container>
                    <Grid item>
                        <Button variant="contained" type="submit">{`${actionLabel} DMS`}</Button>
                    </Grid>
                </Grid>
            </Grid >
        </form >
    );
};

interface AWSPolicyBuilderProps {
    value: AWSIoTPolicy[],
    onChange: (policies: AWSIoTPolicy[]) => void,
}

const AWSPolicyBuilder: React.FC<AWSPolicyBuilderProps> = ({ value, onChange }) => {
    const [showModal, setShowModal] = useState(false);

    const [newPolicyName, setNewPolicyName] = useState("");
    const [newPolicyDoc, setNewPolicyDoc] = useState("{}");

    const close = () => {
        setNewPolicyName("");
        setNewPolicyDoc("");
        setShowModal(false);
    };

    return (
        <KeyValueLabel
            label="AWS IoT Core Policies"
            value={
                <Grid container flexDirection={"column"} spacing={1}>
                    <Grid item>
                        <MonoChromaticButton onClick={() => { setShowModal(true); }}>Add Policy</MonoChromaticButton>
                        <Modal
                            maxWidth="md"
                            title=""
                            subtitle=""
                            isOpen={showModal}
                            content={
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField value={newPolicyName} onChange={(ev) => setNewPolicyName(ev.target.value)} label="Policy Name" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField value={newPolicyDoc} onChange={(ev) => setNewPolicyDoc(ev.target.value)} label="Policy Document" multiline fullWidth />
                                    </Grid>
                                </Grid>
                            }
                            actions={
                                <Grid container>
                                    <Grid item xs>
                                        <Button variant="text" onClick={() => close()}>Cancel</Button>
                                    </Grid>
                                    <Grid item xs="auto">
                                        <Button variant="contained" onClick={() => {
                                            const newP = [...value];
                                            const index = newP.findIndex(it => it.policy_name === newPolicyName);
                                            const item = { policy_name: newPolicyName, policy_document: JSON.stringify(JSON.parse(newPolicyDoc), null, 4) };
                                            if (index === -1) {
                                                newP.push(item);
                                            } else {
                                                newP[index] = item;
                                            }

                                            onChange([...newP]);

                                            close();
                                        }}>Add</Button>
                                    </Grid>
                                </Grid>
                            }
                            onClose={() => close()}
                        />
                    </Grid>
                    <Grid item container spacing={1}>
                        {
                            value.map((p, idx) => (
                                <Grid item key={idx}>
                                    <Chip label={p.policy_name} onClick={() => {
                                        setNewPolicyName(p.policy_name);
                                        setNewPolicyDoc(JSON.stringify(JSON.parse(p.policy_document), null, 4));
                                        setShowModal(true);
                                    }} onDelete={() => {
                                        const newP = [...value];
                                        newP.splice(idx, 1);
                                        onChange([...newP]);
                                    }} />
                                </Grid>
                            ))
                        }
                    </Grid>
                </Grid>
            } />
    );
};

function policyBuilder (accountID: string, shadowName: string) {
    let shadowReplacer = "";
    if (shadowName !== "") {
        shadowReplacer = `name/${shadowName}/`;
    }

    const str = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Action: [
                    "iot:Connect"
                ],
                Resource: [
                    "arn:aws:iot:eu-west-1:ACCOUNTID:client/${iot:Connection.Thing.ThingName}"
                ]
            },
            {
                Effect: "Allow",
                Action: [
                    "iot:Publish"
                ],
                Resource: [
                    "arn:aws:iot:eu-west-1:ACCOUNTID:topic/$aws/things/${iot:Connection.Thing.ThingName}",
                    "arn:aws:iot:eu-west-1:ACCOUNTID:topic/$aws/things/${iot:Connection.Thing.ThingName}/shadow/SHADOWID*"
                ]
            },
            {
                Effect: "Allow",
                Action: [
                    "iot:Subscribe"
                ],
                Resource: [
                    // "arn:aws:iot:eu-west-1:ACCOUNTID:topicfilter/dt/lms/well-known/cacerts",
                    "arn:aws:iot:eu-west-1:ACCOUNTID:topicfilter/$aws/things/${iot:Connection.Thing.ThingName}",
                    "arn:aws:iot:eu-west-1:ACCOUNTID:topicfilter/$aws/things/${iot:Connection.Thing.ThingName}/shadow/SHADOWID*"
                ]
            },
            {
                Effect: "Allow",
                Action: [
                    "iot:Receive"
                ],
                Resource: [
                    // "arn:aws:iot:eu-west-1:ACCOUNTID:topic/dt/lms/well-known/cacerts",
                    "arn:aws:iot:eu-west-1:ACCOUNTID:topic/$aws/things/${iot:Connection.Thing.ThingName}",
                    "arn:aws:iot:eu-west-1:ACCOUNTID:topic/$aws/things/${iot:Connection.Thing.ThingName}/shadow/SHADOWID*"
                ]
            }
        ]
    };

    return JSON.stringify(str).replaceAll("ACCOUNTID", accountID).replaceAll("SHADOWID", shadowReplacer);
}
