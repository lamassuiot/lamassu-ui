import React, { useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import { useNavigate } from "react-router-dom";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { ListWithDataController, ListWithDataControllerConfigProps } from "components/LamassuComponents/Table";
import { GoLinkExternal } from "react-icons/go";
import { Device, DeviceStatus, deviceFields, deviceStatusToColor, slotStatusToColor } from "ducks/features/devices/models";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import deepEqual from "fast-deep-equal/es6";
import { capitalizeFirstLetter } from "ducks/reducers_utils";
import moment from "moment";
import { selectors } from "ducks/reducers";
import { actions } from "ducks/actions";
import { IconInput } from "components/LamassuComponents/dui/IconInput";

export const DeviceList = () => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => selectors.devices.getDeviceListRequestStatus(state));
    const deviceList = useAppSelector((state) => selectors.devices.getDevices(state));
    const devicesNext = useAppSelector((state) => selectors.devices.getNextBookmark(state));
    const totalDevices = -1;

    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(
        {
            filters: {
                activeFilters: [],
                options: deviceFields
            },
            sort: {
                enabled: true,
                selectedField: "id",
                selectedMode: "asc"
            },
            pagination: {
                enabled: true,
                options: [50, 75, 100],
                selectedItemsPerPage: 50,
                selectedPage: 0
            }
        }
    );

    const refreshAction = () => dispatch(actions.devicesActions.getDevices.request({
        bookmark: "",
        limit: tableConfig.pagination.selectedItemsPerPage!,
        sortField: tableConfig.sort.selectedField!,
        sortMode: tableConfig.sort.selectedMode!,
        filters: tableConfig.filters.activeFilters.map(filter => { return `${filter.propertyField.key}[${filter.propertyOperator}]${filter.propertyValue}`; })
    }));

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        if (tableConfig !== undefined) {
            refreshAction();
        }
    }, [tableConfig]);

    const devicesTableColumns = [
        { key: "icon", title: "", align: "start", size: 1 },
        { key: "id", title: "Device ID", sortFieldKey: "id", query: "id", align: "start", size: 4 },
        { key: "status", title: "Status", sortFieldKey: "status", align: "center", size: 2 },
        { key: "creation_timestamp", sortFieldKey: "creation_timestamp", title: "Creation Date", align: "center", size: 2 },
        { key: "slots", title: "Slots", align: "center", size: 3 },
        { key: "tags", title: "Tags", align: "center", size: 2 },
        { key: "actions", title: "", align: "end", size: 2 }
    ];

    const deviceRender = (device: Device) => {
        const dmsContent = device.dms_owner;
        const iconSplit = device.icon_color.split("-");
        return {
            icon: (
                <IconInput readonly label="" size={35} value={{ bg: iconSplit[0], fg: iconSplit[1], name: device.icon }} />
            ),
            id: <Typography style={{ fontWeight: "700", fontSize: 14, color: theme.palette.text.primary }}>{device.id}</Typography>,
            status: <LamassuChip label={capitalizeFirstLetter(device.status)} color={
                deviceStatusToColor(device.status)
            } />,
            creation_timestamp: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{moment(device.creation_timestamp).format("DD/MM/YYYY HH:mm")}</Typography>,
            dms: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{dmsContent}</Typography>,
            slots: (
                <Grid item xs={12} container spacing={1} justifyContent="center">
                    <Grid item>
                        {
                            device.status === DeviceStatus.NoIdentity
                                ? (
                                    <LamassuChip label="No Identity" color={"gray"} />
                                )
                                : (
                                    <LamassuChip color={slotStatusToColor(device.identity.status)} label={`IdentitySlot: ${device.identity.status}`} compact={true} compactFontSize />
                                )
                        }
                    </Grid>
                </Grid>
            ),
            tags: (
                <Grid item xs={12} container spacing={1} justifyContent="center">
                    {
                        device.tags.map((tag, idx) => (
                            <Grid item key={idx}>
                                <LamassuChip color={theme.palette.mode === "dark" ? ["#EEE", "#555"] : ["#555", "#EEEEEE"]} label={tag} compact={true} compactFontSize />
                            </Grid>
                        ))
                    }
                </Grid>
            ),
            actions: (
                <Box>
                    <Grid container spacing={1}>
                        <Grid item container spacing={2}>
                            <Grid item>
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                    <IconButton onClick={() => {
                                        navigate(device.id);
                                    }}>
                                        <FormatAlignJustifyIcon fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            )
        };
    };

    return (
        <Box sx={{ padding: "20px", height: "calc(100% - 40px)" }}>
            <ListWithDataController
                data={deviceList}
                totalDataItems={totalDevices}
                listConf={devicesTableColumns}
                cardView={{
                    enabled: false
                }}
                listRender={{
                    renderFunc: deviceRender,
                    enableRowExpand: false
                }}
                isLoading={requestStatus.isLoading}
                withAdd={() => { navigate("create"); }}
                emptyContentComponent={
                    <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "100%" }}>
                        <Grid item xs="auto" container justifyContent={"center"} alignItems={"center"} flexDirection="column">
                            <img src={process.env.PUBLIC_URL + "/assets/icon-iot.png"} height={150} style={{ marginBottom: "25px" }} />
                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 22, lineHeight: "24px", marginRight: "10px" }}>
                                Enroll your first IoT Device
                            </Typography>
                            <Typography>Manage the enrollment process of your devices by registering and enrolling using the EST protocol</Typography>
                            <Button
                                endIcon={<GoLinkExternal />}
                                variant="contained"
                                sx={{ marginTop: "10px", color: theme.palette.primary.main, background: theme.palette.primary.light }}
                                onClick={() => {
                                    window.open("https://www.lamassu.io/docs/usage/#provision-your-devices-with-x509-certificates", "_blank");
                                }}
                            >
                                Go to Device enrollment instructions
                            </Button>
                        </Grid>
                    </Grid>
                }
                config={tableConfig}
                onChange={(ev: any) => {
                    if (!deepEqual(ev, tableConfig)) {
                        setTableConfig(ev);
                    }
                }}
                withRefresh={() => { refreshAction(); }}
                tableProps={{
                    component: Paper,
                    style: {
                        padding: "30px",
                        width: "calc(100% - 60px)"
                    }
                }}
            />
            <div style={{ flexGrow: 1, height: "1px" }}></div>
        </Box>
    );
};
