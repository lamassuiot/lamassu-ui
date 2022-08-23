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

export const DmsList = () => {
    const theme = useTheme();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => dmsSelector.getRequestStatus(state));
    const dmsList = useAppSelector((state) => dmsSelector.getDMSs(state));
    const totalDMSs = useAppSelector((state) => dmsSelector.getTotalDMSs(state));

    const [isDialogOpen, setIsDialogOpen] = useState<{ open: boolean, type: "APPROVE" | "REVOKE" | "DECLINE", id: string }>({ open: false, type: "APPROVE", id: "" });
    const [anchorElSort, setAnchorElSort] = useState(null);

    const [tableConfig, setTableConfig] = useState<LamassuTableWithDataControllerConfigProps>(
        {
            filter: {
                enabled: true,
                filters: []
            },
            sort: {
                enabled: true,
                selectedField: "id",
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
        filterQuery: tableConfig.filter.filters!.map((f:any) => { return f.propertyKey + "[" + f.propertyOperator + "]=" + f.propertyValue; })
    }));

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        if (tableConfig !== undefined) {
            console.log("call ", tableConfig);
            refreshAction();
        }
    }, [tableConfig]);

    const dmsTableColumns = [
        { key: "id", title: "DMS ID", dataKey: "id", align: "start", query: true, type: OperandTypes.string, size: 3 },
        { key: "name", title: "Name", dataKey: "name", align: "center", type: OperandTypes.string, size: 2 },
        { key: "creation", title: "Creation Date", dataKey: "creation_timestamp", type: OperandTypes.date, align: "center", size: 1 },
        { key: "status", title: "Status", dataKey: "status", type: OperandTypes.enum, align: "center", size: 1 },
        { key: "expiration", title: "Expiration / Revocation / Rejection Date", dataKey: "modification_timestamp", type: OperandTypes.date, align: "center", size: 1 },
        { key: "keyprops", title: "Key Properties", align: "center", size: 1 },
        { key: "keystrength", title: "Key Strength", dataKey: "key_metadata.strength", type: OperandTypes.enum, align: "center", size: 1 },
        // { key: "enrolled", title: "Enrolled Devices", align: "center", size: 1 },
        { key: "actions", title: "Actions", align: "center", size: 2 }
    ];

    const dmsRender = (dms: DMS) => {
        return {
            id: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>#{dms.id}</Typography>,
            name: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>{dms.name}</Typography>,
            status: <LamassuChip label={dms.status} color={dms.status_color} />,
            creation: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{moment(dms.creation_timestamp).format("DD/MM/YYYY HH:mm")}</Typography>,
            keystrength: <LamassuChip label={dms.key_metadata.strength} color={dms.key_metadata.strength_color} />,
            keyprops: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{`${dms.key_metadata.type} ${dms.key_metadata.bits}`}</Typography>,
            enrolled: (dms.status === ODMSStatus.Approved || dms.status === ODMSStatus.Revoked)
                ? (
                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{50}</Typography>
                )
                : (
                    <Typography>-</Typography>
                ),
            expiration: (dms.status === ODMSStatus.Revoked || dms.status === ODMSStatus.Approved || dms.status === ODMSStatus.Denied)
                ? (
                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{dms.status === ODMSStatus.Revoked ? moment(dms.modification_timestamp).format("DD/MM/YYYY HH:mm") : (dms.status === ODMSStatus.Approved ? moment(dms.modification_timestamp).format("DD/MM/YYYY HH:mm") : moment(dms.modification_timestamp).format("DD/MM/YYYY HH:mm"))}</Typography>
                )
                : (
                    <Typography>-</Typography>
                ),
            actions: (
                <Box>
                    <Grid container spacing={1} alignItems="center">
                        {
                            dms.status === ODMSStatus.PendingApproval
                                ? (
                                    <>
                                        <Grid item>
                                            <ColoredButton
                                                customtextcolor={theme.palette.success.main}
                                                customcolor={theme.palette.success.light}
                                                startIcon={<DoneIcon />}
                                                variant="contained"
                                                size="small"
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    setIsDialogOpen({ open: true, type: "APPROVE", id: dms.id });
                                                }}
                                            >
                                                Approve
                                            </ColoredButton>
                                        </Grid>
                                        <Grid item>
                                            <ColoredButton
                                                customtextcolor={theme.palette.error.main}
                                                customcolor={theme.palette.error.light}
                                                startIcon={<CloseIcon />}
                                                variant="contained"
                                                size="small"
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    setIsDialogOpen({ open: true, type: "DECLINE", id: dms.id });
                                                }}
                                            >
                                                Decline
                                            </ColoredButton>
                                        </Grid>
                                    </>
                                )
                                : (
                                    dms.status === ODMSStatus.Approved
                                        ? (
                                            <>
                                                <Grid item>
                                                    <ColoredButton
                                                        customtextcolor={theme.palette.error.main}
                                                        customcolor={theme.palette.error.light}
                                                        startIcon={<CloseIcon />}
                                                        variant="contained"
                                                        size="small"
                                                        onClick={(ev) => {
                                                            ev.stopPropagation();
                                                            setIsDialogOpen({ open: true, type: "REVOKE", id: dms.id });
                                                        }}
                                                    >
                                                        Revoke
                                                    </ColoredButton>
                                                </Grid>
                                                <Grid item>
                                                    <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                        <IconButton onClick={(ev) => { ev.stopPropagation(); downloadFile("dms-" + dms.name + ".crt", window.atob(dms.crt)); }}>
                                                            <FileDownloadRoundedIcon fontSize={"small"} />
                                                        </IconButton>
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

                        dms.status === ODMSStatus.Approved
                            ? (
                                <>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Authorized CAs</Typography>
                                    <Grid container spacing={2}>
                                        {
                                            dms.authorized_cas.map(caName => (
                                                <Grid item key={caName} xs="auto">
                                                    <LamassuChip label={caName} color={"gray"} />
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                </>
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
                    console.log(ev, tableConfig);
                    if (!deepEqual(ev, tableConfig)) {
                        setTableConfig(prev => ({ ...prev, ...ev }));
                        // refreshAction();
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
                                <ApproveDMS dmsID={isDialogOpen.id} isOpen={isDialogOpen.open} onClose={() => { setIsDialogOpen((prev: any) => { return { ...prev, open: false }; }); }} />
                            )
                        }

                        {
                            isDialogOpen.type === "DECLINE" && (
                                <DeclineDMS dmsID={isDialogOpen.id} isOpen={isDialogOpen.open} onClose={() => { setIsDialogOpen((prev: any) => { return { ...prev, open: false }; }); }} />

                            )
                        }

                        {
                            isDialogOpen.type === "REVOKE" && (
                                <RevokeDMS dmsID={isDialogOpen.id} isOpen={isDialogOpen.open} onClose={() => { setIsDialogOpen((prev: any) => { return { ...prev, open: false }; }); }} />

                            )
                        }
                    </>
                )
            }
        </Box >
    );
};
