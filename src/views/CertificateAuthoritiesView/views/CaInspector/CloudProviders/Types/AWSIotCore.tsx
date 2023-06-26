/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState } from "react";
import { Button, Divider, Grid, Tab, Tabs, Typography, TextField, Skeleton, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import SyntaxHighlighter from "react-syntax-highlighter";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import EditIcon from "@mui/icons-material/Edit";
import { AwsIcon } from "components/CloudProviderIcons";
import SendIcon from "@mui/icons-material/Send";
import { LamassuChip } from "components/LamassuComponents/Chip";
import moment from "moment";
import { useAppSelector } from "ducks/hooks";
import * as cloudProxySelector from "ducks/features/cloud-proxy/reducer";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";
import { AWSCloudConnector, AWSSynchronizedCA, OAWSPolicyStatus, OCloudProvider, OCloudProviderConsistencyStatus } from "ducks/features/cloud-proxy/models";
import { useDispatch } from "react-redux";

interface Props {
    caName: string
    connectorID: string
}
const AwsIotCore: React.FC<Props> = ({ caName, connectorID }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => cloudProxySelector.getRequestStatus(state));
    const cloudConnector = useAppSelector((state) => cloudProxySelector.getCloudConnector(state, connectorID));
    const [awsCloudConnector, setAwsCloudConnector] = useState<AWSCloudConnector>();

    const refreshAction = () => {
        dispatch(cloudProxyActions.getConnectorsAction.request());
    };

    useEffect(() => {
        refreshAction();
    }, []);

    const [selectedTab, setSelectedTab] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [awsPolicy, setAwsPolicy] = useState("");
    const [usingDefaultPolicy, setUsingDefaultPolicy] = useState(false);

    const [awsSyncCA, setAwsSyncCA] = useState<AWSSynchronizedCA>();

    const buildAwsPolicy = (region: string, accountId: string) => {
        return {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Action: [
                        "iot:Connect"
                    ],
                    Resource: [
                        "arn:aws:iot:" + region + ":" + accountId + ":client/${iot:Connection.Thing.ThingName}"
                    ]
                },
                {
                    Effect: "Allow",
                    Action: [
                        "iot:Publish"
                    ],
                    Resource: [
                        "arn:aws:iot:" + region + ":" + accountId + ":topic/${iot:Connection.Thing.ThingName}",
                        "arn:aws:iot:" + region + ":" + accountId + ":topic/${iot:Connection.Thing.ThingName}/shadow/name/lamassu-identity/*"
                    ]
                },
                {
                    Effect: "Allow",
                    Action: [
                        "iot:Subscribe"
                    ],
                    Resource: [
                        "arn:aws:iot:" + region + ":" + accountId + ":topicfilter/dt/lms/well-known/cacerts",
                        "arn:aws:iot:" + region + ":" + accountId + ":topicfilter/${iot:Connection.Thing.ThingName}",
                        "arn:aws:iot:" + region + ":" + accountId + ":topicfilter/${iot:Connection.Thing.ThingName}/shadow/name/lamassu-identity/*"
                    ]
                },
                {
                    Effect: "Allow",
                    Action: [
                        "iot:Receive"
                    ],
                    Resource: [
                        "arn:aws:iot:" + region + ":" + accountId + ":topic/${iot:Connection.Thing.ThingName}",
                        "arn:aws:iot:" + region + ":" + accountId + ":topic/dt/lms/well-known/cacerts",
                        "arn:aws:iot:" + region + ":" + accountId + ":topic/${iot:Connection.Thing.ThingName}/shadow/name/lamassu-identity/*"
                    ]
                }
            ]
        };
    };

    useEffect(() => {
        if (cloudConnector !== undefined && cloudConnector.cloud_provider === OCloudProvider.Aws) {
            setAwsCloudConnector(new AWSCloudConnector(cloudConnector));
        }
    }, [cloudConnector]);

    useEffect(() => {
        if (awsCloudConnector !== undefined) {
            const filteredCloudConfigList = awsCloudConnector.synchronized_cas.filter(ca => ca.ca_name === caName);
            let newSelectedCAConfig;
            if (filteredCloudConfigList.length === 1) {
                newSelectedCAConfig = filteredCloudConfigList[0];
                setAwsSyncCA(newSelectedCAConfig);
            }

            if (newSelectedCAConfig !== undefined && newSelectedCAConfig.configuration) {
                if (newSelectedCAConfig.configuration.policy_status === OAWSPolicyStatus.Active) {
                    setAwsPolicy(JSON.stringify(JSON.parse(newSelectedCAConfig.configuration.policy_document!), null, 4));
                } else {
                    setUsingDefaultPolicy(true);
                    setAwsPolicy(JSON.stringify(buildAwsPolicy(awsCloudConnector.configuration.iot_core_endpoint.split(".")[2], awsCloudConnector.configuration.account_id), null, 4));
                }
            }
        }
    }, [awsCloudConnector]);

    if (awsCloudConnector === undefined) {
        return (
            <Typography sx={{ marginTop: "10px", fontStyle: "italic" }}>This connector is not of type AWS </Typography>
        );
    }
    return (
        <Box>
            <AwsIcon />
            <Grid container spacing={2} sx={{ marginBottom: "10px", marginTop: "5px" }}>
                <Grid item xs={2}>
                    <Typography style={{ fontSize: 14 }}>Account ID:</Typography>
                </Grid>
                <Grid item xs={10}>
                    {
                        requestStatus.isLoading
                            ? (
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                            )
                            : (
                                <Typography style={{ fontSize: 14 }}>{awsCloudConnector.configuration.account_id}</Typography>
                            )
                    }
                </Grid>
                <Grid item xs={2}>
                    <Typography style={{ fontSize: 14 }}>IoT Core endpoint:</Typography>
                </Grid>
                <Grid item xs={10}>
                    {
                        requestStatus.isLoading
                            ? (
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                            )
                            : (
                                <Typography style={{ fontSize: 14 }}>{awsCloudConnector.configuration.iot_core_endpoint}</Typography>
                            )
                    }
                </Grid>
            </Grid>
            <Divider />
            {
                awsSyncCA && (
                    awsSyncCA.consistency_status === OCloudProviderConsistencyStatus.Consistent
                        ? (
                            <>
                                <Grid container spacing={2} sx={{ marginTop: "10px" }}>
                                    <Grid item xs={2}>
                                        <Typography style={{ fontSize: 14 }}>CA certificate ID:</Typography>
                                    </Grid>
                                    <Grid item xs={10}>
                                        {
                                            requestStatus.isLoading
                                                ? (
                                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                )
                                                : (
                                                    <Typography style={{ fontSize: 14 }}>{awsSyncCA.configuration.id}</Typography>
                                                )
                                        }
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography style={{ fontSize: 14 }}>CA certificate ARN:</Typography>
                                    </Grid>
                                    <Grid item xs={10}>
                                        {
                                            requestStatus.isLoading
                                                ? (
                                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                )
                                                : (
                                                    <Typography style={{ fontSize: 14 }}>{awsSyncCA.configuration.arn}</Typography>
                                                )
                                        }
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography style={{ fontSize: 14 }}>Status</Typography>
                                    </Grid>
                                    <Grid item xs={10}>
                                        {
                                            requestStatus.isLoading
                                                ? (
                                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                )
                                                : (
                                                    <LamassuChip color={awsSyncCA.configuration.status_color} label={awsSyncCA.configuration.status} />
                                                )
                                        }
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography style={{ fontSize: 14 }}>Created:</Typography>
                                    </Grid>
                                    <Grid item xs={10}>
                                        {
                                            requestStatus.isLoading
                                                ? (
                                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                )
                                                : (
                                                    <Typography style={{ fontSize: 14 }}>{moment(awsSyncCA.configuration.creation_date).format("DD-MM-YYYY HH:mm")}</Typography>
                                                )
                                        }
                                    </Grid>
                                </Grid>

                                <Box style={{ marginTop: "25px" }}>
                                    <Tabs value={selectedTab} onChange={(ev, newValue) => setSelectedTab(newValue)}>
                                        <Tab label="Active Policy" />
                                    </Tabs>
                                </Box>

                                <Divider />
                                <Box sx={{ paddingTop: "20px" }}>
                                    {
                                        selectedTab === 0 && (
                                            <Grid container spacing={2}>
                                                {
                                                    editMode
                                                        ? (
                                                            <>
                                                                {
                                                                    usingDefaultPolicy && (
                                                                        <Grid item xs={12}>
                                                                            <Box sx={{ padding: "5px 10px", background: theme.palette.warning.light, color: theme.palette.warning.main, borderRadius: "5px" }}>
                                                                                <Typography fontStyle={"italic"} fontSize={"14px"}>Using a template policy</Typography>
                                                                            </Box>
                                                                        </Grid>
                                                                    )
                                                                }
                                                                <Grid item xs={12}>
                                                                    <TextField
                                                                        variant="outlined"
                                                                        multiline
                                                                        aria-label="minimum height"
                                                                        minRows={10}
                                                                        placeholder="Minimum 3 rows"
                                                                        fullWidth
                                                                        InputProps={{
                                                                            style: {
                                                                                fontSize: 12,
                                                                                fontFamily: "monospace"
                                                                            },
                                                                            spellCheck: false
                                                                        }}
                                                                        value={awsPolicy}
                                                                        onChange={(ev) => { setAwsPolicy(ev.target.value); }}
                                                                    />

                                                                </Grid>
                                                                <Grid item xs={12} container spacing={2}>
                                                                    <Grid item xs="auto">
                                                                        <Button variant="outlined">
                                                                            Cancel
                                                                        </Button>
                                                                    </Grid>
                                                                    <Grid item xs="auto">
                                                                        <Button variant="contained" startIcon={<SendIcon />} onClick={() => {
                                                                            dispatch(cloudProxyActions.updateConfiguration.request({
                                                                                connector_id: connectorID,
                                                                                configuration: {
                                                                                    policy: JSON.stringify(JSON.parse(awsPolicy)),
                                                                                    ca_name: caName
                                                                                }
                                                                            }));
                                                                        }}>
                                                                        Save
                                                                        </Button>
                                                                    </Grid>
                                                                </Grid>
                                                            </>

                                                        )
                                                        : (
                                                            <>
                                                                <Grid item xs={12}>
                                                                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                                                Edit Policy
                                                                    </Button>
                                                                </Grid>

                                                                <Grid item xs={12}>
                                                                    {
                                                                        awsSyncCA.configuration.policy_status === OAWSPolicyStatus.Active
                                                                            ? (
                                                                                <SyntaxHighlighter language="json" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 12, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primary } }}>
                                                                                    {awsPolicy}
                                                                                </SyntaxHighlighter>
                                                                            )
                                                                            : (
                                                                                <Box>No policy</Box>
                                                                            )
                                                                    }
                                                                </Grid>
                                                            </>
                                                        )
                                                }
                                            </Grid>
                                        )
                                    }
                                </Box>
                            </>
                        )
                        : (
                            awsSyncCA.consistency_status === OCloudProviderConsistencyStatus.Inconsistent && (
                                <Typography sx={{ marginTop: "10px", fontStyle: "italic" }}>Connector has an inconsistent status for this CA</Typography>
                            )
                        )
                )
            }
        </Box >
    );
};

export default AwsIotCore;
