/* eslint-disable no-template-curly-in-string */
import { AWSIoTDMSMetadata, AWSIoTDMSMetadataRegistrationMode, AWSIoTPolicy, CreateUpdateDMSPayload, DMS, ESTAuthMode, EnrollmentProtocols, EnrollmentRegistrationMode } from "ducks/features/dmss/models";
import { Alert, Button, Chip, Divider, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import { CASelector } from "components/CAs/CASelector";
import { AWSCAMetadata, AWSCAMetadataRegistrationStatus, CertificateAuthority } from "ducks/features/cas/models";
import { Editor } from "@monaco-editor/react";
import { FormIconInput } from "components/forms/IconInput";
import { FormSelect } from "components/forms/Select";
import { FormSwitch } from "components/forms/Switch";
import { FormTagsInput } from "components/forms/TagsInput";
import { FormTextField } from "components/forms/Textfield";
import { Icon } from "components/IconInput";
import { KeyValueLabel } from "components/KeyValue";
import { Modal } from "components/Modal";
import { TabsList } from "components/TabsList";
import { TextField } from "components/TextField";
import { Upload } from "antd";
import { getCAs } from "ducks/features/cas/apicalls";
import { useForm } from "react-hook-form";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import apicalls from "ducks/apicalls";
import styled from "@emotion/styled";
import { Select } from "components/Select";
import moment from "moment";
import { enqueueSnackbar } from "notistack";
import Label from "components/Label";

const { Dragger } = Upload;

export const FullAlert = styled(Alert)(({ theme }) => ({
    "& .MuiAlert-message": {
        width: "100%"
    }
}));

type FormData = {
    dmsDefinition: {
        id: string;
        name: string;
    }
    enrollProtocol: {
        protocol: EnrollmentProtocols
        registrationMode: EnrollmentRegistrationMode;
        enrollmentCA: undefined | CertificateAuthority;
        overrideEnrollment: boolean,
        estAuthMode: ESTAuthMode;
        certificateValidation: {
            chainValidation: number;
            validationCAs: CertificateAuthority[];
            allowExpired: boolean;
        },
        external_webhook?: {
            name: string;
            url: string;
            validateServeCert: boolean;
            config: {
                log_level: string;
                auth_mode: "jwt" | "noauth" | "apikey" // mtls is also an option but requires handling persisting the client certificate in the fs as well as in the DB
                oidc?: {
                    well_known: string;
                    client_id: string;
                    client_secret: string;
                },
                apikey?: {
                    header: string;
                    key: string;
                }
            }
        }
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
        revokeOnReenroll: boolean;
        additionalValidationCAs: CertificateAuthority[];
    },
    serverKeyGen: {
        enabled: boolean;
        keySize: number;
        keyType: "RSA" | "ECDSA";
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
    emqxIntegration: {
        id: string
        controlBroker: boolean,
        port: number;
        serviceCA: CertificateAuthority | undefined
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

    const [awsCARegisterAsPrimaryAccount, setAwsCARegisterAsPrimaryAccount] = useState(true);

    const { control, setValue, reset, getValues, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            dmsDefinition: {
                id: "",
                name: ""
            },
            enrollProtocol: {
                protocol: EnrollmentProtocols.EST,
                estAuthMode: ESTAuthMode.ClientCertificate,
                certificateValidation: {
                    chainValidation: -1,
                    validationCAs: [],
                    allowExpired: false
                },
                registrationMode: EnrollmentRegistrationMode.JITP,
                overrideEnrollment: false,
                enrollmentCA: undefined,
                external_webhook: {
                    name: "",
                    url: "",
                    validateServeCert: true,
                    config: {
                        log_level: "info",
                        auth_mode: "noauth",
                        oidc: {
                            well_known: "",
                            client_id: "",
                            client_secret: ""
                        },
                        apikey: {
                            header: "",
                            key: ""
                        }
                    }
                }
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
                revokeOnReenroll: true,
                allowedRenewalDelta: "100d",
                preventiveDelta: "31d",
                criticalDelta: "7d",
                allowExpired: false,
                additionalValidationCAs: []
            },
            serverKeyGen: {
                enabled: true,
                keySize: 4096,
                keyType: "RSA"
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
    const watchServerKeyGen = watch("serverKeyGen");
    const watchEstAuthMode = watch("enrollProtocol.estAuthMode");
    const watchEnrollAuthWebhook = watch("enrollProtocol.external_webhook");

    useEffect(() => {
        if (!editMode) {
            const dmsID = watchDmsName.trim().replaceAll(" ", "-").toLowerCase();
            setValue("dmsDefinition.id", dmsID);
        }
    }, [watchDmsName]);

    const registeredInAWSKey = `lamassu.io/iot/${watchAwsIotIntegration.id}`;

    const [enrollCARegistrationInAWS, setEnrollCARegistrationInAWS] = useState<AWSCAMetadata | undefined>(undefined);
    useEffect(() => {
        if (watchEnrollmentCA !== undefined && watchAwsIotIntegration.id !== "") {
            const caMeta = watchEnrollmentCA.metadata;
            if (registeredInAWSKey in caMeta) {
                setEnrollCARegistrationInAWS(caMeta[registeredInAWSKey] as AWSCAMetadata);
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

    useEffect(() => {
        const run = async () => {
            if (!editMode) {
                setLoading(false);
            } else {
                const casResp = await getCAs({ bookmark: "", filters: [], pageSize: 25, sortField: "", sortMode: "asc" });
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
                        registrationMode: dms!.settings.enrollment_settings.registration_mode,
                        certificateValidation: {
                            chainValidation: dms!.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.chain_level_validation,
                            validationCAs: dms!.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas.map(ca => casResp.list.find(caF => caF.id === ca)!),
                            allowExpired: dms!.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.allow_expired
                        }
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
                        revokeOnReenroll: dms!.settings.reenrollment_settings.revoke_on_reenrollment,
                        allowExpired: dms!.settings.reenrollment_settings.enable_expired_renewal,
                        additionalValidationCAs: dms!.settings.reenrollment_settings.additional_validation_cas.map(ca => casResp.list.find(caF => caF.id === ca)!),
                        preventiveDelta: dms.settings.reenrollment_settings.preventive_delta,
                        criticalDelta: dms.settings.reenrollment_settings.critical_delta
                    },
                    serverKeyGen: {
                        enabled: false,
                        keySize: 4096,
                        keyType: "RSA"
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
                    },
                    emqxIntegration: {
                        controlBroker: false,
                        id: "",
                        port: 8883,
                        serviceCA: undefined
                    }
                };

                if (dms.settings.server_keygen_settings !== null) {
                    updateDMS.serverKeyGen = {
                        enabled: dms.settings.server_keygen_settings.enabled,
                        keySize: dms.settings.server_keygen_settings.key.bits,
                        keyType: dms.settings.server_keygen_settings.key.type
                    };
                }

                if (dms.settings.enrollment_settings.est_rfc7030_settings.external_webhook !== undefined) {
                    const webhookConf = dms.settings.enrollment_settings.est_rfc7030_settings.external_webhook;
                    updateDMS.enrollProtocol.external_webhook = {
                        name: webhookConf.name,
                        url: webhookConf.url,
                        validateServeCert: webhookConf.validate_server_cert,
                        config: {
                            log_level: webhookConf.config.log_level,
                            auth_mode: webhookConf.config.auth_mode as "jwt" | "noauth" | "apikey",
                            oidc: webhookConf.config.oidc,
                            apikey: webhookConf.config.apikey
                        }
                    };
                }

                const dmsMeta = dms.metadata;

                const firstConnectorKey = Object.keys(dmsMeta).find(key => key.includes("lamassu.io/iot/"));
                if (firstConnectorKey && firstConnectorKey.startsWith("lamassu.io/iot/aws.")) {
                    const awsMetaConfig: AWSIoTDMSMetadata = dmsMeta[firstConnectorKey];
                    const connectorID = firstConnectorKey.replace("lamassu.io/iot/", "");
                    let shadowType: "classic" | "named" = "classic";
                    if (awsMetaConfig.shadow_config.shadow_name && awsMetaConfig.shadow_config.shadow_name !== "") {
                        shadowType = "named";
                    }

                    updateDMS.awsIotIntegration = {
                        id: connectorID,
                        accountID: "",
                        mode: awsMetaConfig.registration_mode,
                        enableJITP: awsMetaConfig.jitp_config.enable_template,
                        enableShadow: awsMetaConfig.shadow_config.enable,
                        enableCADistributionSync: true,
                        shadowType,
                        namedShadowName: awsMetaConfig.shadow_config.shadow_name === "" ? "" : awsMetaConfig.shadow_config.shadow_name,
                        thingGroups: awsMetaConfig.groups,
                        policies: awsMetaConfig.policies
                    };
                }
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
        if (!data.enrollProtocol.enrollmentCA) {
            enqueueSnackbar("Enrollment CA is required", { variant: "error" });
            return;
        }
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
                                chain_level_validation: Number(data.enrollProtocol.certificateValidation.chainValidation),
                                validation_cas: data.enrollProtocol.certificateValidation.validationCAs.map(ca => ca.id),
                                allow_expired: data.enrollProtocol.certificateValidation.allowExpired
                            },
                            external_webhook: data.enrollProtocol.estAuthMode === ESTAuthMode.ExternalWebhook
                                ? {
                                    name: data.enrollProtocol.external_webhook!.name,
                                    url: data.enrollProtocol.external_webhook!.url,
                                    validate_server_cert: data.enrollProtocol.external_webhook!.validateServeCert,
                                    config: {
                                        log_level: data.enrollProtocol.external_webhook!.config.log_level,
                                        auth_mode: data.enrollProtocol.external_webhook!.config.auth_mode,
                                        apikey: data.enrollProtocol.external_webhook!.config.auth_mode === "apikey"
                                            ? data.enrollProtocol.external_webhook!.config.apikey
                                            : undefined,
                                        oidc: data.enrollProtocol.external_webhook!.config.auth_mode === "jwt"
                                            ? data.enrollProtocol.external_webhook!.config.oidc
                                            : undefined
                                    }
                                }
                                : undefined
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
                        revoke_on_reenrollment: data.reEnroll.revokeOnReenroll,
                        enable_expired_renewal: data.reEnroll.allowExpired,
                        critical_delta: data.reEnroll.criticalDelta,
                        preventive_delta: data.reEnroll.preventiveDelta,
                        reenrollment_delta: data.reEnroll.allowedRenewalDelta,
                        additional_validation_cas: data.reEnroll.additionalValidationCAs.map(ca => ca.id)
                    },
                    server_keygen_settings: {
                        enabled: data.serverKeyGen.enabled,
                        key: {
                            bits: data.serverKeyGen.keySize,
                            type: data.serverKeyGen.keyType
                        }
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
        <form onSubmit={submit} >
            <Grid container flexDirection={"column"} padding={"20px"} component={Paper} spacing={4} elevation={0} borderRadius={0}>
                <Grid>
                    <TabsList tabs={[
                        {
                            label: "Identity",
                            element: (
                                <Grid container marginTop={"20px"} spacing={2}>
                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs={12}>
                                            <Typography variant="h4">Device Manufacturing Definition</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormTextField label="DMS Name" control={control} name="dmsDefinition.name" />
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormTextField label="DMS ID" control={control} name="dmsDefinition.id" disabled={editMode} />
                                        </Grid>
                                    </Grid>

                                    <Grid xs={12} sx={{ width: "100%" }}>
                                        <Divider />
                                    </Grid>

                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs={12}>
                                            <Typography variant="h4">Enrollment Device Registration</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSelect control={control} name="enrollProtocol.registrationMode" label="Registration Mode" options={[
                                                { value: EnrollmentRegistrationMode.JITP, render: "JITP" },
                                                { value: EnrollmentRegistrationMode.PreRegistration, render: "Pre Registration" }
                                            ]} />
                                        </Grid>
                                        <Grid xs="auto">
                                            <FormIconInput control={control} name="enrollDeviceRegistration.icon" label="Icon" />
                                        </Grid>
                                        <Grid xs>
                                            <FormTagsInput control={control} name="enrollDeviceRegistration.tags" label="Tags" />
                                        </Grid>
                                    </Grid>

                                    <Grid xs={12} >
                                        <Divider />
                                    </Grid>

                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs={12}>
                                            <Typography variant="h4">Enrollment Settings</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSelect control={control} name="enrollProtocol.protocol" label="Protocol" options={[
                                                { value: EnrollmentProtocols.EST, render: "EST" }
                                            ]} />
                                        </Grid>
                                        <Grid xs={12}>
                                            <CASelector value={getValues("enrollProtocol.enrollmentCA")} onSelect={(elems) => {
                                                if (!Array.isArray(elems)) {
                                                    setValue("enrollProtocol.enrollmentCA", elems);
                                                }
                                            }} multiple={false} label="Enrollment CA"
                                            />
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSwitch control={control} name="enrollProtocol.overrideEnrollment" label="Allow Override Enrollment" />
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSelect control={control} name="enrollProtocol.estAuthMode" label="Authentication Mode" options={[
                                                { value: ESTAuthMode.ClientCertificate, render: "Client Certificate" },
                                                { value: ESTAuthMode.ExternalWebhook, render: "External Webhook" },
                                                { value: ESTAuthMode.NoAuth, render: "No Auth" }

                                            ]} />
                                        </Grid>
                                        {
                                            watchEstAuthMode === ESTAuthMode.ClientCertificate && (
                                                <>
                                                    <Grid xs={12}>
                                                        <CASelector value={getValues("enrollProtocol.certificateValidation.validationCAs")} onSelect={(elems) => {
                                                            if (Array.isArray(elems)) {
                                                                setValue("enrollProtocol.certificateValidation.validationCAs", elems);
                                                            }
                                                        }} multiple={true} label="Validation CAs"
                                                        />
                                                    </Grid>
                                                    <Grid xs={12}>
                                                        <FormSwitch control={control} name="enrollProtocol.certificateValidation.allowExpired" label="Allow Authenticating Expired Certificates" />
                                                    </Grid>
                                                    <Grid xs={12}>
                                                        <FormTextField label="Chain Validation Level (-1 equals full chain)" control={control} name="enrollProtocol.certificateValidation.chainValidation" type="number" />
                                                    </Grid>
                                                </>
                                            )
                                        }
                                        {
                                            watchEstAuthMode === ESTAuthMode.ExternalWebhook && (
                                                <>
                                                    <Grid xs={12} md={3}>
                                                        <FormTextField label="Webhook Name" control={control} name="enrollProtocol.external_webhook.name" placeholder="MyValidationFunc" />
                                                    </Grid>
                                                    <Grid xs={12} md={9}>
                                                        <FormTextField label="Webhook URL" control={control} name="enrollProtocol.external_webhook.url" placeholder="http://localhost:8080/verify" />
                                                    </Grid>
                                                    <Grid xs={12} md={3}>
                                                        <FormSelect control={control} name="enrollProtocol.external_webhook.config.log_level" label="Webhook Log Level" options={[
                                                            { value: "info", render: "Info" },
                                                            { value: "debug", render: "Debug" },
                                                            { value: "trace", render: "Trace" }
                                                        ]} />
                                                    </Grid>
                                                    <Grid xs={12} md={3}>
                                                        <FormSelect control={control} name="enrollProtocol.external_webhook.config.auth_mode" label="Webhook Auth Mode" options={[
                                                            { value: "jwt", render: "OIDC" },
                                                            { value: "apikey", render: "API Key" },
                                                            { value: "noauth", render: "No Auth" }
                                                        ]} />
                                                    </Grid>
                                                    {
                                                        watchEnrollAuthWebhook!.config.auth_mode === "jwt" && (
                                                            <>
                                                                <Grid xs={12} md={3}>
                                                                    <FormTextField label="OIDC Client ID" control={control} name="enrollProtocol.external_webhook.config.oidc.client_id" />
                                                                </Grid>
                                                                <Grid xs={12} md={3}>
                                                                    <FormTextField label="OIDC Client Secret" control={control} name="enrollProtocol.external_webhook.config.oidc.client_secret" />
                                                                </Grid>
                                                                <Grid xs={12} md={12}>
                                                                    <FormTextField label="OIDC Well Known" control={control} name="enrollProtocol.external_webhook.config.oidc.well_known" placeholder="https://my-oidc-provider.com/auth/realms/lamassu/.well-known/openid-configuration"/>
                                                                </Grid>
                                                            </>
                                                        )
                                                    },
                                                    {
                                                        watchEnrollAuthWebhook!.config.auth_mode === "apikey" && (
                                                            <>
                                                                <Grid xs={0} md={3}>
                                                                </Grid>
                                                                <Grid xs={12} md={3}>
                                                                    <FormTextField label="API Header" control={control} name="enrollProtocol.external_webhook.config.apikey.header" />
                                                                </Grid>
                                                                <Grid xs={12} md={9}>
                                                                    <FormTextField label="API Key" control={control} name="enrollProtocol.external_webhook.config.apikey.key" />
                                                                </Grid>
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )
                                        }
                                    </Grid>
                                    <Grid xs={12} >
                                        <Divider />
                                    </Grid>

                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs={12}>
                                            <Typography variant="h4">ReEnrollment Settings</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSwitch control={control} name="reEnroll.revokeOnReenroll" label="Revoke On ReEnroll" />
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSwitch control={control} name="reEnroll.allowExpired" label="Allow Expired Renewal" />
                                        </Grid>
                                        <Grid xs={12} md={3}>
                                            <TextField value={watchEnrollmentCA?.issuance_expiration.type === "Duration" ? watchEnrollmentCA?.issuance_expiration.duration : watchEnrollmentCA?.issuance_expiration.time} label="Certificate Lifespan" disabled />
                                        </Grid>
                                        <Grid xs={12} md={3}>
                                            <FormTextField control={control} name="reEnroll.allowedRenewalDelta" label="Allowed Renewal Delta" tooltip="Duration from the certificate's expiration time backwards that enables ReEnrolling. For instance, if the certificate being renew has 150 days left and the 'Allowed Renewal Delta' field is set to 100 days, the ReEnroll request will be denied. If instead the certificate will expire in 99 days, the ReEnroll request will be allowed." />
                                        </Grid>
                                        <Grid xs={12} md={3}>
                                            <FormTextField control={control} name="reEnroll.preventiveDelta" label="Preventive Renewal Delta" tooltip="Duration from the certificate's expiration time backwards that is used to flag the certificate as about to expire. Will trigger cloud remediation action (i.e. Update AWS Thing Shadow if exists) " />
                                        </Grid>
                                        <Grid xs={12} md={3}>
                                            <FormTextField control={control} name="reEnroll.criticalDelta" label="Critical Renewal Delta" tooltip="Duration from the certificate's expiration time backwards. Trigger event when this state is reached and no renewal was performed. Not used by Lamassu's services." />
                                        </Grid>
                                        <Grid xs={12}>
                                            <CASelector value={getValues("reEnroll.additionalValidationCAs")} onSelect={(elems) => {
                                                if (Array.isArray(elems)) {
                                                    setValue("reEnroll.additionalValidationCAs", elems);
                                                }
                                            }} multiple={true} label="Additional Validation CAs"
                                            />
                                        </Grid>

                                    </Grid>

                                    <Grid xs={12} >
                                        <Divider />
                                    </Grid>

                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs={12}>
                                            <Typography variant="h4">Server Key Generation Settings</Typography>
                                            <Alert severity="info">
                                                <Typography variant="body1">If enabled. Devices will be able to enroll using EST-defined ServerKeyGen endpoints. Validation and registration process will use <Label color="primary">Enrollment Settings</Label>. Keys will be generated using the backend&apos;s cryptographic software engine.</Typography>
                                            </Alert>
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSwitch control={control} name="serverKeyGen.enabled" label="Enable Key Generation" />
                                        </Grid>
                                        {
                                            watchServerKeyGen.enabled && (
                                                <>
                                                    <Grid xs={12} md={6}>
                                                        <FormSelect control={control} name="serverKeyGen.keyType" label="Key Type" options={[
                                                            { value: "RSA", render: "RSA" },
                                                            { value: "ECDSA", render: "ECDSA" }
                                                        ]} />
                                                    </Grid>
                                                    <Grid xs={12} md={6}>
                                                        <FormSelect control={control} name="serverKeyGen.keySize" label="Key Size" options={
                                                            watchServerKeyGen.keyType === "RSA"
                                                                ? [
                                                                    { value: 2048, render: "2048" },
                                                                    { value: 3072, render: "3072" },
                                                                    { value: 4096, render: "4096" }
                                                                ]
                                                                : [
                                                                    { value: 256, render: "256" },
                                                                    { value: 384, render: "384" },
                                                                    { value: 521, render: "521" }
                                                                ]
                                                        } />
                                                    </Grid>
                                                </>
                                            )
                                        }
                                    </Grid>
                                    <Grid xs={12} >
                                        <Divider />
                                    </Grid>

                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs={12}>
                                            <Typography variant="h4">CA Distribution</Typography>
                                        </Grid>
                                        {/* <Grid xs={12}>
                        <CASelector />
                    </Grid> */}
                                        <Grid xs={12}>
                                            <FormSwitch control={control} name="caDistribution.includeDownstream" label="Include &apos;Downstream&apos; CA used by Lamassu" />
                                        </Grid>
                                        <Grid xs={12}>
                                            <FormSwitch control={control} name="caDistribution.includeAuthorized" label="Include Enrollment CA" />
                                        </Grid>
                                        <Grid xs={12}>
                                            <CASelector value={getValues("caDistribution.managedCAs")} onSelect={(elems) => {
                                                if (Array.isArray(elems)) {
                                                    setValue("caDistribution.managedCAs", elems);
                                                }
                                            }} multiple={true} label="Managed CAs" />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )
                        },
                        {
                            label: "AWS IoT Integration",
                            hidden: window._env_.CLOUD_CONNECTORS.filter(item => item.startsWith("aws.")).length === 0,
                            element: (
                                <Grid container spacing={2} marginTop={"20px"}>
                                    <Grid xs={12}>
                                        <Typography variant="h4">AWS IoT Settings</Typography>
                                    </Grid>

                                    <Grid xs={12}>
                                        <FormSelect control={control} name="awsIotIntegration.id" label="AWS IoT Manager Instance" options={
                                            window._env_.CLOUD_CONNECTORS.filter(item => item.startsWith("aws.")).map((id: string, idx: number) => {
                                                return {
                                                    value: id,
                                                    render: () => <>{id}</>
                                                };
                                            })
                                        } />
                                    </Grid>
                                    {
                                        watchAwsIotIntegration.id !== "" && (
                                            <>
                                                <Grid xs={12} >
                                                    <FormSelect control={control} name="awsIotIntegration.mode" label="Thing Provisioning" options={[
                                                        { value: "auto", render: "Automatic Registration on Enrollment" },
                                                        { value: "jitp", render: "JITP Template" },
                                                        { value: "none", render: "None" }
                                                    ]} />
                                                </Grid>

                                                {
                                                    watchAwsIotIntegration.mode !== "none" && watchEnrollmentCA !== undefined && (
                                                        <>
                                                            {
                                                                !enrollCARegistrationInAWS
                                                                    ? (
                                                                        <Grid xs={12}>
                                                                            <Alert severity="warning">
                                                                                <Grid container flexDirection={"column"} spacing={1} width={"100%"}>
                                                                                    <Grid>
                                                                                        The selected Enrollment CA is not registered in AWS. Make sure to synchronize it first.
                                                                                    </Grid>
                                                                                    <Grid>
                                                                                        <Select value={awsCARegisterAsPrimaryAccount} onChange={(ev) => setAwsCARegisterAsPrimaryAccount(ev.target.value === "true")} label="Register as Primary Account" options={[
                                                                                            {
                                                                                                value: true,
                                                                                                render: () => (
                                                                                                    <Grid container>
                                                                                                        <Grid xs={12}>
                                                                                                            <Typography variant="body1" fontWeight={"bold"}>Primary Account - Register as CA owner</Typography>
                                                                                                        </Grid>
                                                                                                        <Grid xs={12}>
                                                                                                            <Typography variant="body1">Only one account can be registered as the CA owner within the same AWS Region. It is required to have access to the CA private key.</Typography>
                                                                                                        </Grid>
                                                                                                    </Grid>
                                                                                                )
                                                                                            },
                                                                                            {
                                                                                                value: false,
                                                                                                render: () => (
                                                                                                    <Grid container>
                                                                                                        <Grid xs={12}>
                                                                                                            <Typography variant="body1" fontWeight={"bold"}>Secondary Account</Typography>
                                                                                                        </Grid>
                                                                                                        <Grid xs={12}>
                                                                                                            <Typography variant="body1">No access to the CA private key is needed.</Typography>
                                                                                                        </Grid>
                                                                                                    </Grid>
                                                                                                )
                                                                                            }
                                                                                        ]} />

                                                                                        <Grid>
                                                                                            <Button onClick={async () => {
                                                                                                const caRegAWS: AWSCAMetadata = {
                                                                                                    registration: {
                                                                                                        status: AWSCAMetadataRegistrationStatus.REQUESTED,
                                                                                                        registration_request_time: moment().toISOString(),
                                                                                                        primary_account: awsCARegisterAsPrimaryAccount
                                                                                                    }
                                                                                                };

                                                                                                try {
                                                                                                    await apicalls.cas.updateCAMetadata(watchEnrollmentCA.id, {
                                                                                                        ...watchEnrollmentCA.metadata,
                                                                                                        [registeredInAWSKey]: caRegAWS
                                                                                                    });
                                                                                                    const ca = await apicalls.cas.getCA(watchEnrollmentCA.id);
                                                                                                    setValue("enrollProtocol.enrollmentCA", ca);
                                                                                                    enqueueSnackbar("CA Metadata updated", { variant: "success" });
                                                                                                } catch (e) {
                                                                                                    enqueueSnackbar("Failed to update CA Metadata", { variant: "error" });
                                                                                                }
                                                                                            }}>Synchronize CA</Button>
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Alert>
                                                                        </Grid>
                                                                    )
                                                                    : (
                                                                        <>
                                                                            {
                                                                                enrollCARegistrationInAWS.registration.status === AWSCAMetadataRegistrationStatus.REQUESTED && (
                                                                                    <Grid xs={12}>
                                                                                        <Alert severity="warning">
                                                                                            <Grid container spacing={2} sx={{ width: "100%" }}>
                                                                                                <Grid xs={12}>
                                                                                                    Registering process underway. CA should be registered soon, click on &apos;Reload & Check&apos; periodically.
                                                                                                </Grid>
                                                                                                <Grid xs={12}>
                                                                                                    <Editor
                                                                                                        theme="vs-dark"
                                                                                                        defaultLanguage="json"
                                                                                                        height="30vh"
                                                                                                        value={JSON.stringify(enrollCARegistrationInAWS, null, 4)}
                                                                                                        options={{ readOnly: true }}
                                                                                                    />
                                                                                                </Grid>
                                                                                                <Grid xs={12}>
                                                                                                    <Button onClick={async () => {
                                                                                                        const ca = await apicalls.cas.getCA(watchEnrollmentCA.id);
                                                                                                        setValue("enrollProtocol.enrollmentCA", ca);
                                                                                                    }}>
                                                                                                        Reload & Check
                                                                                                    </Button>
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        </Alert>
                                                                                    </Grid>
                                                                                )
                                                                            }
                                                                            {
                                                                                enrollCARegistrationInAWS.registration.status === AWSCAMetadataRegistrationStatus.SUCCEEDED && (
                                                                                    <Grid xs={12}>
                                                                                        <Alert severity="success">
                                                                                            <Grid container spacing={2} sx={{ width: "100%" }}>
                                                                                                <Grid xs={12}>
                                                                                                    The selected Enrollment CA is correctly registered in AWS:
                                                                                                </Grid>
                                                                                                <Grid xs={12}>
                                                                                                    <Editor
                                                                                                        theme="vs-dark"
                                                                                                        defaultLanguage="json"
                                                                                                        height="30vh"
                                                                                                        value={JSON.stringify(enrollCARegistrationInAWS, null, 4)}
                                                                                                        options={{ readOnly: true }}
                                                                                                    />
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        </Alert>
                                                                                    </Grid>
                                                                                )
                                                                            }
                                                                            {
                                                                                enrollCARegistrationInAWS.registration.status === AWSCAMetadataRegistrationStatus.FAILED && (
                                                                                    <Grid xs={12}>
                                                                                        <Alert severity="warning">
                                                                                            <Grid container>
                                                                                                <Grid xs={12}>
                                                                                                    Registering process failed: {enrollCARegistrationInAWS.registration.error}
                                                                                                </Grid>
                                                                                                <Grid xs={12}>
                                                                                                    <Editor
                                                                                                        theme="vs-dark"
                                                                                                        defaultLanguage="json"
                                                                                                        height="30vh"
                                                                                                        value={JSON.stringify(enrollCARegistrationInAWS, null, 4)}
                                                                                                        options={{ readOnly: true }}
                                                                                                    />
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        </Alert>
                                                                                    </Grid>
                                                                                )
                                                                            }
                                                                        </>
                                                                    )
                                                            }
                                                            <Grid xs={12}>
                                                                <FormTagsInput control={control} name="awsIotIntegration.thingGroups" label="AWS Thing Groups" />
                                                            </Grid>

                                                            <Grid xs={12} >
                                                                <AWSPolicyBuilder value={getValues("awsIotIntegration.policies")} onChange={(policies) => setValue("awsIotIntegration.policies", policies)} />
                                                            </Grid>
                                                        </>
                                                    )
                                                }
                                                {
                                                    watchAwsIotIntegration.mode === "jitp" && (
                                                        <>
                                                            <Grid xs={12}>
                                                                <Typography variant="h4" fontSize={"16px"}>Provisioning Template</Typography>
                                                            </Grid>

                                                            <Grid xs={12}>
                                                                <FormSwitch control={control} name="awsIotIntegration.enableJITP" label="Enable JITP template" />
                                                            </Grid>

                                                            {/*
                                                <Grid xs={12}>
                                                    <SubsectionTitle fontSize={"16px"}>Lamassu &harr; AWS IoT Synchronization</SubsectionTitle>
                                                </Grid>

                                                <Grid xs={12} container flexDirection={"column"}>
                                                    <FormSelect control={control} name="iotIntegrations.shadowType" label="Revocation Origin">
                                                        <MenuItem value={"classic"}>Only Lamassu</MenuItem>
                                                        <MenuItem value={"named"}>Allow Revocations from AWS (requires infra)</MenuItem>
                                                    </FormSelect>
                                                </Grid>
                                            */}
                                                        </>
                                                    )
                                                }

                                                <Grid xs={12}>
                                                    <Typography variant="h4" fontSize={"16px"}>Shadows & Device Automation</Typography>
                                                </Grid>

                                                <Grid xs={12}>
                                                    <FormSwitch control={control} name="awsIotIntegration.enableShadow" label="Update Device - Thing Shadow on relevant events" />
                                                </Grid>

                                                {
                                                    watchAwsIotIntegration.enableShadow && (
                                                        <Grid xs={12} >
                                                            <FormSelect control={control} name="awsIotIntegration.shadowType" label="Shadow Type" options={[
                                                                { value: "classic", render: () => <>Classic</> },
                                                                { value: "named", render: () => <>Named</> }
                                                            ]} />
                                                        </Grid>
                                                    )
                                                }
                                                {
                                                    watchAwsIotIntegration.shadowType === "named" && (
                                                        <Grid xs={12}>
                                                            <FormTextField label="Named shadow" control={control} name="awsIotIntegration.namedShadowName" />
                                                        </Grid>
                                                    )
                                                }
                                                {
                                                    watchAwsIotIntegration.enableShadow === true && watchAwsIotIntegration.policies.find(p => p.policy_name === defaultLamassuPolicyName(watchDmsId)) === undefined && (
                                                        <Grid xs={12}>
                                                            <Alert severity="warning">
                                                                <Grid container spacing={2} width={"100%"}>
                                                                    <Grid xs={12}>
                                                                        Make sure to add a policy allowing access to shadow topics
                                                                    </Grid>
                                                                    <Grid xs={12} container spacing={1} flexDirection={"column"}>
                                                                        <Grid>
                                                                            <FormTextField label="AWS Account ID" control={control} name="awsIotIntegration.accountID" />
                                                                        </Grid>
                                                                        <Grid>
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
                            )
                        },
                        {
                            label: "EMQX Integration",
                            hidden: window._env_.CLOUD_CONNECTORS.filter(item => item.startsWith("emqx.")).length === 0,
                            element: (
                                <Grid container marginTop={"20px"} spacing={2}>
                                    <Grid xs={12}>
                                        <Typography variant="h4">EMQX Settings</Typography>
                                    </Grid>

                                    <Grid xs={12}>
                                        <FormSelect control={control} name="emqxIntegration.id" label="EMQX Instance ID" options={
                                            window._env_.CLOUD_CONNECTORS.filter(item => item.startsWith("emqx.")).map((id: string, idx: number) => {
                                                return {
                                                    value: id,
                                                    render: () => <>{id}</>
                                                };
                                            })
                                        } />
                                    </Grid>

                                    <Grid xs={12}>
                                        <FormSwitch control={control} name="emqxIntegration.controlBroker" label="Control Broker" />
                                    </Grid>

                                    <Grid xs={3}>
                                        <FormTextField control={control} name="emqxIntegration.port" label="Broker Port" type="number" />
                                    </Grid>

                                    <Grid xs={12}>
                                        <Typography variant="h4">TLS Options</Typography>
                                    </Grid>

                                    <Grid xs={6}>
                                        <CASelector label="Broker Certificate Authority" value={getValues("emqxIntegration.serviceCA")} multiple={false} onSelect={((elems) => {
                                            if (!Array.isArray(elems)) {
                                                setValue("emqxIntegration.serviceCA", elems);
                                            }
                                        })} />
                                    </Grid>

                                    <Grid xs={12}>
                                        <Typography variant="h4">Broker Access Control</Typography>
                                    </Grid>

                                    <Grid xs={6}>
                                        <CASelector label="Validation CA" value={getValues("emqxIntegration.serviceCA")} multiple={false} onSelect={((elems) => {
                                            if (!Array.isArray(elems)) {
                                                setValue("emqxIntegration.serviceCA", elems);
                                            }
                                        })} />
                                    </Grid>

                                    <Grid xs={12}>
                                        <FormSwitch control={control} name="emqxIntegration.controlBroker" label="Enable certificate status validation (via OCSP)" />
                                    </Grid>

                                </Grid>
                            )
                        }
                    ]} />
                </Grid>
                <Grid >
                    <Divider />
                </Grid>

                <Grid container>
                    <Grid>
                        <Button variant="contained" type="submit">{`${actionLabel} DMS`}</Button>
                    </Grid>
                </Grid>
            </Grid>
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
                    <Grid>
                        <Button variant="contained" onClick={() => { setShowModal(true); }}>Add Policy</Button>
                        <Modal
                            maxWidth="md"
                            title=""
                            subtitle=""
                            isOpen={showModal}
                            content={
                                <Grid container spacing={2}>
                                    <Grid xs={12}>
                                        <TextField value={newPolicyName} onChange={(ev) => setNewPolicyName(ev.target.value)} label="Policy Name" />
                                    </Grid>
                                    <Grid xs={12}>
                                        <Editor
                                            theme="vs-dark"
                                            defaultLanguage="json"
                                            height="50vh"
                                            value={newPolicyDoc}
                                            defaultValue="{}"
                                            onChange={(value) => setNewPolicyDoc(value || "{}")}
                                        />
                                    </Grid>
                                </Grid>
                            }
                            actions={
                                <Grid container spacing={2}>
                                    <Grid xs md="auto">
                                        <Button variant="contained" fullWidth onClick={() => {
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
                                    <Grid xs="auto" md="auto">
                                        <Button variant="text" onClick={() => close()}>Cancel</Button>
                                    </Grid>
                                </Grid>
                            }
                            onClose={() => close()}
                        />
                    </Grid>
                    <Grid container spacing={1}>
                        {
                            value.map((p, idx) => (
                                <Grid key={idx}>
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
