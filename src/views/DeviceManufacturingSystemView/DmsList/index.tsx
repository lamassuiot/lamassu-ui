import React, { useEffect, useState } from "react";

import { Box, Button, Grid, IconButton, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { ListWithDataController, ListWithDataControllerConfigProps, OperandTypes } from "components/LamassuComponents/Table";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { GoLinkExternal } from "react-icons/go";
import { DMS } from "ducks/features/dms-enroller/models";
import * as dmsAction from "ducks/features/dms-enroller/actions";
import * as dmsSelector from "ducks/features/dms-enroller/reducer";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import deepEqual from "fast-deep-equal/es6";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import { IconInput } from "components/LamassuComponents/dui/IconInput";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import * as CG from "react-icons/cg";
import { Chip } from "components/LamassuComponents/dui/Chip";
import TerminalIcon from "@mui/icons-material/Terminal";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { StepModal } from "components/LamassuComponents/dui/StepModal";
import { TextField } from "components/LamassuComponents/dui/TextField";
import CAFetchViewer from "components/LamassuComponents/lamassu/CAFetchViewer";

export const DmsList = () => {
    const theme = useTheme();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => dmsSelector.getRequestStatus(state));
    const dmsList = useAppSelector((state) => dmsSelector.getDMSs(state));
    const totalDMSs = useAppSelector((state) => dmsSelector.getTotalDMSs(state));

    const [enrollDMSCmds, setEnrollDMSCmds] = useState<{ open: boolean, dmsName: string }>({ open: false, dmsName: "" });
    const [enrollDeviceID, setEnrollDeviceID] = useState("");

    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(
        {
            filter: {
                enabled: true,
                filters: []
            },
            sort: {
                enabled: true,
                selectedField: "name",
                selectedMode: "asc"
            },
            pagination: {
                enabled: true,
                options: [9, 18, 27],
                selectedItemsPerPage: 9,
                selectedPage: 0
            }
        }
    );

    const refreshAction = () => dispatch(dmsAction.getDMSListAction.request({
        offset: tableConfig.pagination.selectedPage! * tableConfig.pagination.selectedItemsPerPage!,
        limit: tableConfig.pagination.selectedItemsPerPage!,
        sortField: tableConfig.sort.selectedField!,
        sortMode: tableConfig.sort.selectedMode!,
        filterQuery: tableConfig.filter.filters!.map((f: any) => { return f.propertyKey + "[" + f.propertyOperator + "]=" + f.propertyValue; })
    }));

    useEffect(() => {
        refreshAction();
    }, []);

    const dmsTableColumns = [
        { key: "name", title: "DMS Name", dataKey: "name", align: "center", query: true, type: OperandTypes.string, size: 2 },
        { key: "creation_timestamp", title: "Creation Date", dataKey: "creation_timestamp", type: OperandTypes.date, align: "center", size: 1 },
        { key: "cloudHosted", title: "Cloud Hosted DMS", dataKey: "status", type: OperandTypes.string, align: "center", size: 1 },
        { key: "status", title: "Status", dataKey: "status", type: OperandTypes.enum, align: "center", size: 1 },
        // { key: "enrolled", title: "Enrolled Devices", align: "center", size: 1 },
        { key: "actions", title: "Actions", align: "right", size: 2 }
    ];

    useEffect(() => {
        if (tableConfig !== undefined) {
            refreshAction();
        }
    }, [tableConfig]);

    const dmsCardRenderer = (dms: DMS) => {
        const splitColors = dms.identity_profile.enrollment_settings.color.split("-");
        console.log(splitColors);
        let iconBG = "";
        let iconFG = "";
        if (splitColors.length === 2) {
            iconBG = splitColors[0];
            iconFG = splitColors[1];
        } else {
            iconBG = dms.identity_profile.enrollment_settings.color;
            iconFG = dms.identity_profile.enrollment_settings.color;
        }

        return (
            <Grid item xs={4}>
                <Box component={Paper} padding={"10px"}>
                    <Grid container flexDirection={"column"} spacing={1}>
                        <Grid item container spacing={1} alignItems={"center"}>
                            <Grid item>
                                <IconInput readonly label="" size={35} value={{ bg: iconBG, fg: iconFG, icon: { icon: CG.CgSmartphoneChip, name: "CgSmartphoneChip" } }} />
                            </Grid>
                            <Grid item xs container flexDirection={"column"}>
                                <Grid item>
                                    <Typography>{dms.name}</Typography>
                                </Grid>
                                <Grid item>
                                    {
                                        dms.cloud_dms
                                            ? (
                                                <Chip label="Cloud DMS" compact compactFontSize color="warn" />
                                            )
                                            : (
                                                <CloudOffIcon sx={{ fontSize: "1.15rem", color: "#555" }} />
                                            )
                                    }
                                </Grid>
                            </Grid>
                            <Grid item xs="auto">
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                    <Tooltip title="CA Certificates">
                                        <IconButton onClick={(ev) => { ev.stopPropagation(); navigate(`${dms.name}/cacerts`); }}>
                                            <AccountBalanceOutlinedIcon fontSize={"small"} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Grid>
                            <Grid item xs="auto">
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                    <Tooltip title="cURL enrollment commands">
                                        <IconButton onClick={(ev) => { ev.stopPropagation(); setEnrollDMSCmds({ open: true, dmsName: dms.name }); }}>
                                            <TerminalIcon fontSize={"small"} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <KeyValueLabel
                                label="EST Endpoint"
                                value={
                                    <Typography style={{ color: theme.palette.text.primary, fontSize: 12 }}>{"https://" + window.location.hostname + "/api/dmsmanager/.well-known/est/" + dms.name + "/simpleenroll"}</Typography>
                                }
                            />
                        </Grid>
                        <Grid item>
                            <KeyValueLabel
                                label="Authorized CA"
                                value={
                                    <CAFetchViewer caName={dms.identity_profile.enrollment_settings.authorized_ca} />
                                }
                            />
                        </Grid>
                        <Grid item>
                            <KeyValueLabel
                                label="Validation CAs"
                                value={
                                    <Grid container>
                                        {
                                            dms.identity_profile.enrollment_settings.bootstrap_cas.map((caName, idx) => {
                                                return (
                                                    <Grid item xs key={idx}>
                                                        <CAFetchViewer caName={caName} />
                                                    </Grid>
                                                );
                                            })
                                        }
                                    </Grid>
                                }
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        );
    };

    return (
        <Box sx={{ padding: "40px", height: "calc(100% - 40px)", overflowY: "auto" }}>
            <Grid container spacing={2}>
                <ListWithDataController
                    defaultRender="CARD"
                    data={dmsList}
                    totalDataItems={totalDMSs}
                    isLoading={requestStatus.isLoading}
                    withAdd={() => { navigate("create"); }}
                    config={tableConfig}
                    onChange={(ev: any) => {
                        if (!deepEqual(ev, tableConfig)) {
                            setTableConfig(prev => ({ ...prev, ...ev }));
                        }
                    }}
                    listConf={dmsTableColumns}
                    cardRender={{
                        renderFunc: dmsCardRenderer
                    }}
                    tableProps={{
                        component: Paper,
                        style: {
                            padding: "30px",
                            width: "calc(100% - 60px)"
                        }
                    }}
                    emptyContentComponent={
                        <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "100%" }}>
                            <Grid item xs="auto" container justifyContent={"center"} alignItems={"center"} flexDirection="column">
                                <img src={process.env.PUBLIC_URL + "/assets/icon-dms.png"} height={150} style={{ marginBottom: "25px" }} />
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 22, lineHeight: "24px", marginRight: "10px" }}>
                                    Enroll your Device Manufacturing Systems
                                </Typography>
                                <Typography>Manage the enrollment process of your devices by registering and enrolling your DMS instance first</Typography>
                                <Button
                                    endIcon={<GoLinkExternal />}
                                    variant="contained"
                                    sx={{ marginTop: "10px", color: theme.palette.primary.main, background: theme.palette.primary.light }}
                                    onClick={() => {
                                        window.open("https://www.lamassu.io/docs/usage/#register-a-new-device-manufacturing-system", "_blank");
                                    }}
                                >
                                    Go to DMS enrollment instructions
                                </Button>
                                <Typography sx={{ margin: "10px", textAlign: "center" }}>or</Typography>
                                <Button
                                    endIcon={<AddIcon />}
                                    variant="contained"
                                    sx={{ color: theme.palette.primary.main, background: theme.palette.primary.light }}
                                    onClick={() => {
                                        navigate("create");
                                    }}
                                >
                                    Register your first DMS
                                </Button>
                            </Grid>
                        </Grid>
                    }
                    withRefresh={() => { refreshAction(); }}
                />
            </Grid>
            {
                enrollDMSCmds.open && (
                    <StepModal
                        open={enrollDMSCmds.open}
                        onClose={() => setEnrollDMSCmds({ open: false, dmsName: "" })}
                        title="EST Enroll"
                        steps={[
                            {
                                title: "Define Device to Enroll",
                                subtitle: "this first step generates de crypto material (a private key and CSR) that will be enrolled in the next step",
                                content: (
                                    <TextField label="Device ID" onChange={(ev) => setEnrollDeviceID(ev.target.value)} />
                                )
                            },
                            {
                                title: "Generate Device CSR",
                                subtitle: "",
                                content: (
                                    <CodeCopier code={
                                        `openssl req -new -newkey rsa:2048 -nodes -keyout device-${enrollDeviceID}.key -out device-${enrollDeviceID}.csr -subj "/CN=${enrollDeviceID}"`
                                    } />
                                )
                            },
                            {
                                title: "Enroll commands",
                                subtitle: "this first step generates de crypto material (a private key and CSR) that will be enrolled in the next step",
                                content: (
                                    <Grid container flexDirection={"column"} spacing={2}>
                                        <Grid item xs>
                                            <Typography>
                                                Define the Device Manager EST server and the credentials to be used during the enrollment process:
                                            </Typography>
                                            <CodeCopier code={
                                                `export LAMASSU_SERVER=${window.location.host} \nexport VALIDATION_CRT=your_dms.crt \nexport VALIDATION_KEY=your_dms.key`
                                            } />
                                        </Grid>

                                        <Grid item xs>
                                            <Typography>
                                                Obtain the Root certificate used by the server:
                                            </Typography>
                                            <CodeCopier code={
                                                "openssl s_client -connect $LAMASSU_SERVER 2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem"
                                            } />
                                        </Grid>

                                        <Grid item xs>
                                            <Typography>
                                                Request a certificate from the EST server:
                                            </Typography>
                                            <CodeCopier code={
                                                `curl https://$LAMASSU_SERVER/api/dmsmanager/.well-known/est/${enrollDMSCmds.dmsName}/simpleenroll --cert $VALIDATION_CRT --key $VALIDATION_KEY -s -o device-${enrollDeviceID}.p7 --cacert root-ca.pem  --data-binary @device-${enrollDeviceID}.csr -H "Content-Type: application/pkcs10" \nopenssl base64 -d -in device-${enrollDeviceID}.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out device-${enrollDeviceID}.crt \nopenssl x509 -text -in device-${enrollDeviceID}.crt`
                                            } />
                                        </Grid>
                                    </Grid>
                                )
                            }
                        ]}
                    />
                )
            }
        </Box >
    );
};
