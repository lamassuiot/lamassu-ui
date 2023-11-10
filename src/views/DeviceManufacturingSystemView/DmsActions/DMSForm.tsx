import React, { useEffect, useState } from "react";

import { Alert, Button, Divider, Grid, MenuItem, Skeleton, useTheme, styled, Chip } from "@mui/material";
import { useForm } from "react-hook-form";
import { Icon } from "components/LamassuComponents/dui/IconInput";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { FormIconInput } from "components/LamassuComponents/dui/form/IconInput";
import { FormSwitch } from "components/LamassuComponents/dui/form/Switch";
import { CreateUpdateDMSPayload, DMS, ESTAuthMode, EnrollmentProtocols, EnrollmentRegistrationMode } from "ducks/features/ra/models";
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
        thingGroups: string[]
        policies: { policyName: string, policyDocument: string }[]
        enableShadow: boolean;
        enableCADistributionSync: boolean
        shadowType: "classic" | "named";
        namedShadowName: string
    }
};

interface Props {
    dms?: DMS,
    onSubmit: (dms: CreateUpdateDMSPayload) => void,
    actionLabel?: string
}

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
                enableShadow: true,
                enableCADistributionSync: true,
                shadowType: "classic",
                id: "",
                namedShadowName: "lamassu-identity",
                thingGroups: [],
                policies: []
            }
        }
    });

    const watchDmsName = watch("dmsDefinition.name");
    const watchEnrollmentCA = watch("enrollProtocol.enrollmentCA");
    const watchConnectorID = watch("awsIotIntegration.id");

    useEffect(() => {
        if (!editMode) {
            const dmsID = watchDmsName.trim().replaceAll(" ", "-").toLowerCase();
            setValue("dmsDefinition.id", dmsID);
        }
    }, [watchDmsName]);

    const registeredInAWSKey = `lamassu.io/iot/${watchConnectorID}`;

    const [awsSync, setAwsSync] = useState(AWSSync.RequiresSync);
    useEffect(() => {
        if (watchEnrollmentCA !== undefined) {
            const caMeta = watchEnrollmentCA.metadata;
            if (registeredInAWSKey in caMeta && caMeta[registeredInAWSKey].register === true) {
                setAwsSync(AWSSync.SyncOK);
            }
        }
    }, [watchEnrollmentCA, watchConnectorID]);

    useEffect(() => {
        const run = async () => {
            if (!editMode) {
                setLoading(false);
            } else {
                console.log(dms!.settings.ca_distribution_settings.managed_cas);
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
                        preventiveDelta: "31d",
                        criticalDelta: "7d"
                    },
                    caDistribution: {
                        includeAuthorized: dms!.settings.ca_distribution_settings.include_enrollment_ca,
                        includeDownstream: dms!.settings.ca_distribution_settings.include_system_ca,
                        managedCAs: dms!.settings.ca_distribution_settings.managed_cas.map(ca => casResp.list.find(caF => caF.id === ca)!)
                    },
                    awsIotIntegration: {
                        enableShadow: true,
                        enableCADistributionSync: true,
                        shadowType: "classic",
                        id: "",
                        namedShadowName: "",
                        thingGroups: [],
                        policies: []
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
            const actionPayload: CreateUpdateDMSPayload = {
                name: data.dmsDefinition.name,
                id: data.dmsDefinition.id,
                metadata: {},
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

                    <Grid item xs={12}>
                        <SubsectionTitle fontSize={"16px"}>Provisioning Template</SubsectionTitle>
                    </Grid>

                    {
                        awsSync !== AWSSync.SyncOK && watchConnectorID !== "" && watchEnrollmentCA !== undefined && (
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
                                                    }}>Reload & Check </Button>
                                                </Grid>
                                            )
                                        }
                                    </Grid>
                                </Alert>
                            </Grid>
                        )
                    }
                    {
                        awsSync === AWSSync.SyncOK && (
                            <Grid item xs={12} container flexDirection={"column"}>
                                <FullAlert severity="success">
                                    <Grid container flexDirection={"column"} spacing={2} sx={{ width: "100%" }}>
                                        <Grid item>
                                            The selected Enrollment CA is correctly registered in AWS:
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
                        <AWSPolicyBuilder />
                    </Grid>

                    <Grid item xs={12}>
                        <SubsectionTitle fontSize={"16px"}>Device Automation</SubsectionTitle>
                    </Grid>

                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSwitch control={control} name="awsIotIntegration.enableShadow" label="Update Device - Thing Shadow on relevant events. (Includes 'lms-remediation-access' Access Policy)" />
                    </Grid>

                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSwitch control={control} name="awsIotIntegration.enableCADistributionSync" label="Enable CA Distribution using retained message" />
                    </Grid>

                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSelect control={control} name="awsIotIntegration.shadowType" label="Shadow Type">
                            <MenuItem value={"classic"}>Classic</MenuItem>
                            <MenuItem value={"named"}>Named</MenuItem>
                        </FormSelect>
                    </Grid>

                    <Grid item xs={12}>
                        <FormTextField label="Named shadow" control={control} name="awsIotIntegration.namedShadowName" />
                    </Grid>

                    {/* <Grid item xs={12}>
                        <SubsectionTitle fontSize={"16px"}>Lamassu &harr; AWS IoT Synchronization</SubsectionTitle>
                    </Grid>

                    <Grid item xs={12} container flexDirection={"column"}>
                        <FormSelect control={control} name="iotIntegrations.shadowType" label="Revocation Origin">
                            <MenuItem value={"classic"}>Only Lamassu</MenuItem>
                            <MenuItem value={"named"}>Allow Revocations from AWS (requires infra)</MenuItem>
                        </FormSelect>
                    </Grid> */}
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

const AWSPolicyBuilder = () => {
    const [policies, setPolicies] = useState<{ policyName: string, policyDocument: string }[]>([]);
    const [showModal, setShowModal] = useState(false);

    const [newPolicyName, setNewPolicyName] = useState("");
    const [newPolicyDoc, setNewPolicyDoc] = useState("");

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
                                            const newP = [...policies];
                                            const index = newP.findIndex(it => it.policyName === newPolicyName);
                                            const item = { policyName: newPolicyName, policyDocument: newPolicyDoc };
                                            if (index === -1) {
                                                newP.push(item);
                                            } else {
                                                newP[index] = item;
                                            }
                                            setPolicies([...newP]);

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
                            policies.map((p, idx) => (
                                <Grid item key={idx}>
                                    <Chip label={p.policyName} onClick={() => {
                                        setNewPolicyName(p.policyName);
                                        setNewPolicyDoc(p.policyDocument);
                                        setShowModal(true);
                                    }} onDelete={() => {
                                        const newP = [...policies];
                                        newP.splice(idx, 1);
                                        setPolicies([...newP]);
                                    }} />
                                </Grid>
                            ))
                        }
                    </Grid>
                </Grid>
            } />
    );
};
