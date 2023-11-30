import React, { useState } from "react";

import { Box, Button, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { LamassuStatusChip } from "components/LamassuComponents/Chip";
import { ListWithDataController } from "components/LamassuComponents/Table";
import { useNavigate } from "react-router-dom";
import { GoLinkExternal } from "react-icons/go";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch } from "react-redux";
import { pSBC } from "components/utils/colors";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { CertificateAuthority } from "ducks/features/cav3/models";
import { apicalls } from "ducks/apicalls";

interface Props {
    caData: CertificateAuthority
}

export const CloudProviders: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isEnableConnectorOpen, setIsEnableConnectorOpen] = useState({ isOpen: false, connectorId: "" });
    const caMeta = caData.metadata;

    const cloudConnectors = window._env_.CLOUD_CONNECTORS;

    const cloudConnectorTableColumns = [
        { key: "connectorIcon", title: "", align: "start", size: 1 },
        { key: "connectorId", title: "Connector ID", align: "start", size: 4 },
        { key: "syncStatus", title: "Synchronization Status", align: "center", size: 7 },
        { key: "actions", title: "", align: "end", size: 2 }
    ];

    const cloudConnectorsRender = (cloudConnector: string) => {
        let enabled = false;
        const enabledKey = `lamassu.io/iot/${cloudConnector}`;
        if (enabledKey in caMeta && caMeta[enabledKey].register === true) {
            enabled = true;
        }

        let logo = "";
        if (cloudConnector.includes("aws")) {
            logo = "AWS.png";
        } else if (cloudConnector.includes("azure")) {
            logo = "AZURE.png";
        }
        return {
            connectorId: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>{cloudConnector}</Typography>,
            connectorIcon: (
                <img src={process.env.PUBLIC_URL + "/assets/" + logo} height={"40px"} />
            ),
            syncStatus: (
                <LamassuStatusChip label={enabled ? "Registered" : "Not Registered"} color={enabled ? "green" : "orange"} />
            ),
            actions: (
                <>
                    {
                        !enabled && (
                            <Box>
                                <Grid container spacing={1}>
                                    <Grid item>
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <IconButton onClick={(ev) => { ev.stopPropagation(); setIsEnableConnectorOpen({ isOpen: true, connectorId: cloudConnector }); }} >
                                                <AddIcon fontSize={"small"} />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )
                    }
                </>
            ),
            expandedRowElement: (
                enabled && (
                    <Box sx={{ width: "calc(100% - 65px)", borderLeft: `4px solid ${theme.palette.primary.main}`, background: pSBC(theme.palette.mode === "dark" ? 0.01 : -0.03, theme.palette.background.paper), marginLeft: "20px", padding: "20px 20px 0 20px", marginBottom: "20px" }}>
                        <Grid container flexDirection={"column"} spacing={1}>
                            {
                                Object.keys(caMeta[enabledKey]).map((key, idx) => {
                                    return (
                                        <Grid item key={idx} container>
                                            <Grid item xs={1}>
                                                <Label>{key}</Label>
                                            </Grid>
                                            <Grid item xs>
                                                <Label>{caMeta[enabledKey][key]}</Label>
                                            </Grid>
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>
                    </Box>
                )
            )
        };
    };

    return (
        <>
            <ListWithDataController
                data={cloudConnectors}
                listConf={cloudConnectorTableColumns}
                totalDataItems={cloudConnectors.length}
                invertContrast={true}
                isLoading={false}
                onChange={(ev: any) => { }}
                emptyContentComponent={
                    <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "100%" }}>
                        <Grid item xs="auto" container justifyContent={"center"} alignItems={"center"} flexDirection="column">
                            <img src={process.env.PUBLIC_URL + "/assets/icon-cloud.png"} height={150} style={{ marginBottom: "25px" }} />
                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 22, lineHeight: "24px", marginRight: "10px" }}>
                                Synchronize your PKI with Cloud Providers
                            </Typography>
                            <Typography>Install different cloud connectors to synchronize your certificates with AWS, Azure or Google Cloud</Typography>
                            <Button
                                endIcon={<GoLinkExternal />}
                                variant="contained"
                                sx={{ marginTop: "10px", color: theme.palette.primary.main, background: theme.palette.primary.light }}
                                onClick={() => {
                                    window.open("https://www.lamassu.io/docs/setup/#deploy-aws-iot-core-connectors", "_blank");
                                }}
                            >
                                Go to install instructions
                            </Button>
                        </Grid>
                    </Grid>
                }
                listRender={{
                    renderFunc: cloudConnectorsRender,
                    enableRowExpand: true
                }}
            />
            {
                isEnableConnectorOpen.isOpen && (
                    <Modal
                        isOpen={true}
                        onClose={() => setIsEnableConnectorOpen({ connectorId: "", isOpen: false })}
                        content={
                            <Grid container flexDirection={"column"} spacing={2}>
                                <Grid item>
                                    You are about to enable the synchronization between this connector and the selected CA. Please, confirm your action.
                                </Grid>
                                <Grid item container flexDirection={"column"} spacing={1}>
                                    <Grid item>
                                        <Typography variant="button">Connector ID: </Typography>
                                        <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{isEnableConnectorOpen.connectorId}</Typography>
                                    </Grid>

                                    <Grid item>
                                        <Typography variant="button">CA ID: </Typography>
                                        <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{caData.id}</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        }
                        subtitle=""
                        title="Register CA in Cloud Provider"
                        actions={
                            <Grid container justifyContent={"flex-end"}>
                                <Grid item>
                                    <Button onClick={() => setIsEnableConnectorOpen({ connectorId: "", isOpen: false })}>Close</Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" onClick={async () => {
                                        const newMeta = caMeta;
                                        newMeta[`lamassu.io/iot/${isEnableConnectorOpen.connectorId}`] = {
                                            register: true
                                        };
                                        await apicalls.cas.updateCAMetadata(caData.id, newMeta);
                                        setIsEnableConnectorOpen({ connectorId: "", isOpen: false });
                                    }
                                    }>Register</Button>
                                </Grid>
                            </Grid >
                        }
                    />
                )
            }
        </>
    );
};
