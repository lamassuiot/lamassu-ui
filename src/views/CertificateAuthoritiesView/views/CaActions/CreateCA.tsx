import React, { useEffect, useState } from "react";
import { Button, Divider, Grid, MenuItem, Paper, Typography, useTheme } from "@mui/material";
import { LamassuSwitch } from "components/LamassuComponents/Switch";
import { Box } from "@mui/system";
import { CloudProviderIcon } from "components/CloudProviderIcons";
import { useNavigate } from "react-router-dom";
import { LamassuStatusChip } from "components/LamassuComponents/Chip";
import * as caSelector from "ducks/features/cas/reducer";
import * as caActions from "ducks/features/cas/actions";
import { useAppSelector } from "ducks/hooks";
import { useDispatch } from "react-redux";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";
import * as cloudProxySelector from "ducks/features/cloud-proxy/reducer";
import { ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { CloudConnector } from "ducks/features/cloud-proxy/models";
import { useForm } from "react-hook-form";
import moment, { Moment } from "moment";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import DateInput from "components/LamassuComponents/dui/DateInput";

type FormData = {
    cryptoEngine: string
    subject: {
        commonName: string;
        country: string;
        state: string;
        locality: string;
        organization: string;
        organizationUnit: string;
    }
    privateKey: {
        type: "RSA" | "ECDSA"
        size: number
    }
    caExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: number
    },
    issuerExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: number
    },
};

export const CreateCA = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cloudProxyRequestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const caRequestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const cloudConnectors = useAppSelector((state) => cloudProxySelector.getCloudConnectors(state)!);

    useEffect(() => {
        dispatch(cloudProxyActions.getConnectorsAction.request());
    }, []);

    const [selectedCloudConnectors, setSelectedCloudConnectors] = useState<Array<string>>([]);
    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            cryptoEngine: "",
            subject: {
                commonName: "",
                country: "",
                state: "",
                locality: "",
                organization: "",
                organizationUnit: ""
            },
            privateKey: {
                type: "RSA",
                size: 4096
            },
            caExpiration: {
                type: "duration",
                duration: 300
            },
            issuerExpiration: {
                type: "duration",
                duration: 100
            }
        }
    });

    const watchSubject = watch("subject");
    const watchKeyType = watch("privateKey.type");
    const watchCAExpirationType = watch("caExpiration.type");
    const watchIssuanceExpirationType = watch("issuerExpiration.type");

    const handleCreateCA = (formData: FormData) => {
        console.log(moment.duration(100, "days").asSeconds());
        console.log(formData);

        dispatch(caActions.createCAAction.request({
            selectedConnectorIDs: selectedCloudConnectors,
            body: {
                subject: {
                    country: formData.subject.country,
                    state: formData.subject.state,
                    locality: formData.subject.locality,
                    organization: formData.subject.organization,
                    organization_unit: formData.subject.organizationUnit,
                    common_name: formData.subject.commonName
                },
                key_metadata: {
                    type: formData.privateKey.type,
                    bits: formData.privateKey.size
                },
                ca_expiration: formData.caExpiration.type === "duration" ? moment.duration(formData.caExpiration.duration, "days").asSeconds() + "" : "99991231T235959Z",
                issuance_expiration: formData.issuerExpiration.type === "duration" ? moment.duration(formData.issuerExpiration.duration, "days").asSeconds() + "" : "99991231T235959Z",
                expiration_type: formData.caExpiration.type === "duration" ? "DURATION" : "DATE"
            }
        }));
    };

    useEffect(() => {
        if (caRequestStatus.status === ORequestStatus.Success && caRequestStatus.type === ORequestType.Create) {
            navigate("/cas/" + getValues("subject.commonName"));
            dispatch(caActions.resetStateAction());
        }
    }, [caRequestStatus]);

    useEffect(() => {
        if (watchKeyType === "RSA") {
            setValue("privateKey.size", 4096);
        } else {
            setValue("privateKey.size", 256);
        }
    }, [watchKeyType]);

    const cloudConnectorsColumnConf = [
        { key: "settings", title: "", align: "start", size: 1 },
        { key: "connectorId", title: "Connector ID", align: "center", size: 2 },
        { key: "connectorStatus", title: "Status", align: "center", size: 2 },
        { key: "connectorAlias", title: "Connector Name", align: "center", size: 2 },
        { key: "connectorAttached", title: "Attached", align: "center", size: 1 }
    ];

    const cloudConnectorRender = (cloudConnector: CloudConnector) => {
        return {
            settings: (
                <LamassuSwitch value={selectedCloudConnectors.includes(cloudConnector.id)} onChange={() => {
                    setSelectedCloudConnectors(prev => {
                        if (prev.includes(cloudConnector.id)) {
                            prev.splice(prev.indexOf(cloudConnector.id), 1);
                        } else {
                            prev.push(cloudConnector.id);
                        }
                        return prev;
                    });
                }} />
            ),
            connectorId: <Typography style={{ fontWeight: "700", fontSize: 14, color: theme.palette.text.primary }}>#{cloudConnector.id}</Typography>,
            connectorStatus: (
                <LamassuStatusChip label={cloudConnector.status} color={cloudConnector.status_color} />
            ),
            connectorAlias: (
                <Box>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item>
                            <CloudProviderIcon cloudProvider={cloudConnector.cloud_provider} />
                        </Grid>
                        <Grid item>
                            <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{cloudConnector.name}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            ),
            connectorAttached: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{"-"}</Typography>
        };
    };

    const onSubmit = handleSubmit(data => handleCreateCA(data));

    return (
        <form onSubmit={onSubmit}>
            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: "100%", paddingY: "20px" }}>
                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>CA Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12}>
                        <FormSelect control={control} name="cryptoEngine" label="Crypto Engine" value={"aws"}>
                            <MenuItem value={"aws"}>
                                <Grid container spacing={2} alignItems={"center"}>
                                    <Grid item xs={"auto"}>
                                        <Box component={Paper} sx={{ height: "40px", width: "40px" }}>
                                            <img src={process.env.PUBLIC_URL + "/assets/AWS-SM.png"} height={"100%"} width={"100%"} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs container spacing={4} alignItems={"center"}>
                                        <Grid item>
                                            <Typography fontWeight={"500"} fontSize={"14px"}>Amazon Web Services</Typography>
                                            <Typography fontWeight={"400"} fontSize={"14px"}>Secrets Manager</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography fontWeight={"400"} fontSize={"12px"}></Typography>
                                            <Typography fontWeight={"400"} fontSize={"12px"}></Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={4}>
                        <FormTextField label="CA Name" control={control} name="subject.commonName" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormSelect control={control} name="privateKey.type" label="Key Type">
                            <MenuItem value={"RSA"}>RSA</MenuItem>
                            <MenuItem value={"ECDSA"}>ECDSA</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={4}>
                        {
                            watchKeyType === "RSA"
                                ? (
                                    <FormSelect control={control} name="privateKey.size" label="Key Size">
                                        <MenuItem value={2048}>2048</MenuItem>
                                        <MenuItem value={3072}>3072</MenuItem>
                                        <MenuItem value={4096}>4096</MenuItem>
                                    </FormSelect>
                                )
                                : (
                                    <FormSelect control={control} name="privateKey.size" label="Key Size">
                                        <MenuItem value={224}>224</MenuItem>
                                        <MenuItem value={256}>256</MenuItem>
                                        <MenuItem value={384}>384</MenuItem>
                                    </FormSelect>
                                )
                        }
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Subject</SubsectionTitle>
                    </Grid>
                    <Grid item xs={4}>
                        <FormTextField label="Country" control={control} name="subject.country" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormTextField label="State / Province" control={control} name="subject.state" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormTextField label="Locality" control={control} name="subject.locality" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormTextField label="Organization" control={control} name="subject.organization" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormTextField label="Organization Unit" control={control} name="subject.organizationUnit" />
                    </Grid>
                    <Grid item xs={4}>
                        <FormTextField label="Common Name" control={control} name="subject.commonName" disabled />
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>CA Expiration Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={4}>
                        <FormSelect control={control} name="caExpiration.type" label="Expiration By">
                            <MenuItem value={"duration"}>Duration</MenuItem>
                            <MenuItem value={"date"} disabled>End Date</MenuItem>
                            <MenuItem value={"date-infinity"}>End Date - Infinity</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={9} />
                    {
                        watchCAExpirationType === "duration" && (
                            <Grid item xs={4}>
                                <FormTextField label="Duration (in days)" control={control} name="caExpiration.duration" />
                            </Grid>
                        )
                    }
                    {
                        watchCAExpirationType === "date" && (
                            <Grid item xs={4}>
                                <DateInput label="Expiration Date" value="" onChange={ev => console.log(ev)} />
                            </Grid>
                        )
                    }
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Issuance Expiration Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={4}>
                        <FormSelect control={control} name="issuerExpiration.type" label="Expiration By">
                            <MenuItem value={"duration"}>Duration</MenuItem>
                            <MenuItem value={"date"} disabled>End Date</MenuItem>
                            <MenuItem value={"date-infinity"}>End Date - Infinity</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={9} />
                    {
                        watchIssuanceExpirationType === "duration" && (
                            <Grid item xs={4}>
                                <FormTextField label="Duration (in days)" control={control} name="issuerExpiration.duration" />
                            </Grid>
                        )
                    }
                    {
                        watchIssuanceExpirationType === "date" && (
                            <Grid item xs={4}>
                                <DateInput label="Expiration Date" value="" onChange={ev => console.log(ev)} />
                            </Grid>
                        )
                    }
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item>
                        <Button variant="contained" type="submit" disabled={watchSubject.commonName === ""}>Create CA</Button>
                    </Grid>
                </Grid>
            </Grid>
        </form>

    );
};
