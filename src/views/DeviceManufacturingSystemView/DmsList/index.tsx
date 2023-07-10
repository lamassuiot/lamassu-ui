import React, { useEffect, useState } from "react";

import { Box, Button, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { LamassuTableWithDataController, LamassuTableWithDataControllerConfigProps, OperandTypes } from "components/LamassuComponents/Table";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { ColoredButton } from "components/LamassuComponents/ColoredButton";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { GoLinkExternal } from "react-icons/go";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import downloadFile from "components/utils/FileDownloader";
import { DMS, ODMSStatus } from "ducks/features/dms-enroller/models";
import * as dmsAction from "ducks/features/dms-enroller/actions";
import * as dmsSelector from "ducks/features/dms-enroller/reducer";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { pSBC } from "components/utils/colors";
import deepEqual from "fast-deep-equal/es6";
import { RevokeDMS } from "../DmsActions/RevokeDms";
import { DeclineDMS } from "../DmsActions/DeclineDms";
import { ApproveDMS } from "../DmsActions/ApproveDms/index";
import { capitalizeFirstLetter } from "ducks/reducers_utils";
import CloudIcon from "@mui/icons-material/Cloud";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import DeleteIcon from "@mui/icons-material/Delete";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import { IssueCertificateFromDMS } from "../DmsActions/IssueCertificateFromDMS";

export const DmsList = () => {
    const theme = useTheme();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => dmsSelector.getRequestStatus(state));
    const dmsList = useAppSelector((state) => dmsSelector.getDMSs(state));
    const totalDMSs = useAppSelector((state) => dmsSelector.getTotalDMSs(state));

    const [isDialogOpen, setIsDialogOpen] = useState<{ open: boolean, type: "APPROVE" | "REVOKE" | "DECLINE" | "UPDATE_CAS" | "GEN_BOOTSTRAP_CERTIFICATE", id: string }>({ open: false, type: "APPROVE", id: "" });

    const [tableConfig, setTableConfig] = useState<LamassuTableWithDataControllerConfigProps>(
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
                options: [10, 75, 100],
                selectedItemsPerPage: 10,
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

    useEffect(() => {
        if (tableConfig !== undefined) {
            refreshAction();
        }
    }, [tableConfig]);

    const dmsTableColumns = [
        { key: "name", title: "DMS Name", dataKey: "name", align: "center", query: true, type: OperandTypes.string, size: 2 },
        { key: "creation_timestamp", title: "Creation Date", dataKey: "creation_timestamp", type: OperandTypes.date, align: "center", size: 1 },
        { key: "cloudHosted", title: "Cloud Hosted DMS", dataKey: "status", type: OperandTypes.string, align: "center", size: 1 },
        { key: "status", title: "Status", dataKey: "status", type: OperandTypes.enum, align: "center", size: 1 },
        // { key: "enrolled", title: "Enrolled Devices", align: "center", size: 1 },
        { key: "actions", title: "Actions", align: "right", size: 2 }
    ];

    const dmsRender = (dms: DMS) => {
        return {
            name: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>#{dms.name}</Typography>,
            cloudHosted: dms.cloud_dms
                ? (
                    <CloudIcon sx={{ fontSize: "1.15rem", color: "#5CA36B" }} />
                )
                : (
                    <CloudOffIcon sx={{ fontSize: "1.15rem", color: "#555" }} />
                ),
            status: <LamassuChip label={capitalizeFirstLetter(dms.status)} color={dms.status_color} />,
            creation_timestamp: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{moment(dms.creation_timestamp).format("DD/MM/YYYY HH:mm")}</Typography>,
            enrolled: (dms.status === ODMSStatus.APPROVED || dms.status === ODMSStatus.REVOKED)
                ? (
                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{50}</Typography>
                )
                : (
                    <Typography>-</Typography>
                ),
            actions: (
                <Box>
                    <Grid container spacing={1} alignItems="center">
                        {
                            dms.status === ODMSStatus.PENDING_APPROVAL
                                ? (
                                    <>
                                        <Grid item>
                                            <ColoredButton
                                                customtextcolor={theme.palette.primary.main}
                                                customcolor={theme.palette.primary.light}
                                                startIcon={<DoneIcon />}
                                                variant="contained"
                                                size="small"
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    setIsDialogOpen({ open: true, type: "APPROVE", id: dms.name });
                                                }}
                                            >
                                                Approve
                                            </ColoredButton>
                                        </Grid>
                                        <Grid item>
                                            <ColoredButton
                                                customtextcolor={theme.palette.primary.main}
                                                customcolor={theme.palette.primary.light}
                                                startIcon={<CloseIcon />}
                                                variant="contained"
                                                size="small"
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    setIsDialogOpen({ open: true, type: "DECLINE", id: dms.name });
                                                }}
                                            >
                                                Decline
                                            </ColoredButton>
                                        </Grid>
                                    </>
                                )
                                : (
                                    dms.status === ODMSStatus.APPROVED
                                        ? (
                                            <>
                                                {
                                                    dms.cloud_dms
                                                        ? (
                                                            <Grid item>
                                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                    <Tooltip title="Generate Bootstrap Certificates">
                                                                        <IconButton onClick={(ev) => { ev.stopPropagation(); setIsDialogOpen({ open: true, type: "GEN_BOOTSTRAP_CERTIFICATE", id: dms.name }); }}>
                                                                            <RocketLaunchIcon fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Grid>
                                                        )
                                                        : (
                                                            <Grid item>
                                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                    <Tooltip title="Download DMS Certificate">
                                                                        <IconButton onClick={(ev) => { ev.stopPropagation(); downloadFile("dms-" + dms.name + ".crt", window.atob(dms.remote_access_identity.certificate)); }}>
                                                                            <FileDownloadRoundedIcon fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Grid>
                                                        )
                                                }
                                                <Grid item>
                                                    <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                        <Tooltip title="Update Associated CAs">
                                                            <IconButton onClick={(ev) => {
                                                                ev.stopPropagation();
                                                                navigate(dms.name + "/edit");
                                                            }}>
                                                                <EditIcon fontSize={"small"} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Grid>
                                                <Grid item>
                                                    <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                        <Tooltip title="Revoke DMS Certificate">
                                                            <IconButton onClick={(ev) => { ev.stopPropagation(); setIsDialogOpen({ open: true, type: "REVOKE", id: dms.name }); }}>
                                                                <DeleteIcon fontSize={"small"} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Grid>
                                            </>
                                        )
                                        : (
                                            <></>
                                        )
                                )
                        }
                    </Grid>
                </Box>
            ),
            expandedRowElement: (
                <Box sx={{ width: "calc(100% - 65px)", borderLeft: `4px solid ${theme.palette.primary.main}`, background: pSBC(theme.palette.mode === "dark" ? 0.01 : -0.03, theme.palette.background.paper), marginLeft: "20px", padding: "20px", marginBottom: "20px" }}>
                    {

                        dms.status === ODMSStatus.APPROVED
                            ? (
                                <Grid container spacing={1}>
                                    <Grid item xs={12} container>
                                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Authorized CAs</Typography>
                                        <Grid container>
                                            {
                                                dms.cloud_dms
                                                    ? (
                                                        <LamassuChip label={dms.identity_profile.enrollment_settings.authorized_ca} color={"gray"} />
                                                    )
                                                    : (
                                                        dms.remote_access_identity.authorized_cas.map(caName => (
                                                            <Grid item key={caName} xs="auto">
                                                                <LamassuChip label={caName} color={"gray"} />
                                                            </Grid>
                                                        ))
                                                    )
                                            }
                                        </Grid>
                                    </Grid>
                                    {dms.cloud_dms &&
                                        (
                                            <>
                                                <Grid item xs={12} container>
                                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Bootstrap CAs</Typography>
                                                    <Grid container spacing={2}>
                                                        {
                                                            dms.identity_profile.enrollment_settings.bootstrap_cas.map(caName => (
                                                                <Grid item key={caName} xs="auto">
                                                                    <LamassuChip label={caName} color={"gray"} />
                                                                </Grid>
                                                            ))
                                                        }
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={12} container>
                                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>EST Enrollment Endpoint</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs="auto">
                                                            <Typography style={{ color: theme.palette.text.primary, fontSize: 12 }}>{"https://" + window.location.hostname + "/api/dmsmanager/.well-known/est/" + dms.name + "/simpleenroll"}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </>
                                        )
                                    }
                                </Grid>
                            )
                            : (
                                <Typography fontStyle={"italic"} fontSize="12px">{"The DMS has not yet been APPROVED or has been REVOKED permanently"}</Typography>
                            )
                    }
                </Box>
            )
        };
    };

    return (
        <Box sx={{ padding: "20px", height: "calc(100% - 40px)" }}>
            <LamassuTableWithDataController
                columnConf={dmsTableColumns}
                data={dmsList}
                totalDataItems={totalDMSs}
                renderDataItem={dmsRender}
                isLoading={requestStatus.isLoading}
                withAdd={() => { navigate("create"); }}
                config={tableConfig}
                onChange={(ev: any) => {
                    if (!deepEqual(ev, tableConfig)) {
                        setTableConfig(prev => ({ ...prev, ...ev }));
                    }
                }}
                tableProps={{
                    component: Paper,
                    style: {
                        padding: "30px",
                        width: "calc(100% - 60px)"
                    }
                }}
                enableRowExpand={true}
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

            {
                isDialogOpen.open && (
                    <>
                        {
                            isDialogOpen.type === "APPROVE" && (
                                <ApproveDMS dmsName={isDialogOpen.id} isOpen={isDialogOpen.open} onClose={() => { setIsDialogOpen((prev: any) => { return { ...prev, open: false }; }); }} />
                            )
                        }

                        {
                            isDialogOpen.type === "DECLINE" && (
                                <DeclineDMS dmsName={isDialogOpen.id} isOpen={isDialogOpen.open} onClose={() => { setIsDialogOpen((prev: any) => { return { ...prev, open: false }; }); }} />
                            )
                        }

                        {
                            isDialogOpen.type === "REVOKE" && (
                                <RevokeDMS dmsName={isDialogOpen.id} isOpen={isDialogOpen.open} onClose={() => { setIsDialogOpen((prev: any) => { return { ...prev, open: false }; }); }} />
                            )
                        }
                        {
                            isDialogOpen.type === "GEN_BOOTSTRAP_CERTIFICATE" && (
                                <IssueCertificateFromDMS dmsName={isDialogOpen.id} isOpen={isDialogOpen.open} onClose={() => { setIsDialogOpen((prev: any) => { return { ...prev, open: false }; }); }} />
                            )
                        }
                    </>
                )
            }
        </Box >
    );
};
