import { Box } from "@mui/system";
import { Certificate, CertificateAuthority, CertificateStatus } from "ducks/features/cas/models";
import { Device, DeviceEvent, DeviceEventType, DeviceStatus, Slot, deviceStatusToColor, slotStatusToColor } from "ducks/features/devices/models";
import { IconButton, Paper, Tooltip, Typography, lighten, useTheme, useMediaQuery } from "@mui/material";
import { FetchHandle, TableFetchViewer } from "components/TableFetcherView";
import { GridColDef } from "@mui/x-data-grid";
import { errorToString, ListResponse } from "ducks/services/api-client";
import { TimelineOppositeContent } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Grid from "@mui/material/Unstable_Grid2";
import Label, { BasicColor } from "components/Label";
import React, { useEffect, useState } from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent, { timelineContentClasses } from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import apicalls from "ducks/apicalls";
import moment from "moment";
import { CertificateStandardFetchViewer } from "components/Certificates/CertificateStandardFetchViewer";
import { KeyValueLabel } from "components/KeyValue";
import { TabsListWithRouter } from "components/TabsListWithRouter";
import { MetadataInput } from "components/forms/MetadataInput";
import { enqueueSnackbar } from "notistack";

interface Props {
    slotID?: string | undefined,
    device: Device,
    onChange: () => void
}

type CertificateWithVersionAndCA = Certificate & { version: number, ca: CertificateAuthority | undefined }; // Imported certificates may not belong to any CA

type DeviceLog = {
    event: DeviceEvent,
    ts: moment.Moment
}

export const ViewDeviceDetails: React.FC<Props> = ({ slotID, device, onChange }) => {
    const theme = useTheme();

    const navigate = useNavigate();
    const tableRef = React.useRef<FetchHandle>(null);

    let filteredSlot = device.identity;
    if (slotID !== undefined && slotID !== "default") {
        filteredSlot = device.slots[slotID];
    }

    const [devEvents, setDevEvents] = useState<DeviceLog[]>([]);
    const [includeIDSlotLogs, setIncludeIDSlotLogs] = useState(true);

    const getEventColors = (log: DeviceLog, idx: number, logs: DeviceLog[]): { node: string, fullNode: boolean, connector: string, label: [string, string] | BasicColor } => {
        let eventColor: "success" | "error" | "grey" | "warning" | [string, string] | BasicColor = "grey";
        let statusColor = deviceStatusToColor(DeviceStatus.NoIdentity)[1];
        let statusChange = false;
        switch (log.event.type) {
        case DeviceEventType.Created:
            eventColor = deviceStatusToColor(DeviceStatus.NoIdentity);
            statusColor = deviceStatusToColor(DeviceStatus.NoIdentity)[1];
            statusChange = true;
            break;

        case DeviceEventType.Provisioned:
            eventColor = deviceStatusToColor(DeviceStatus.Active);
            break;

        case DeviceEventType.ReProvisioned:
            statusColor = deviceStatusToColor(DeviceStatus.Active)[1];
            statusChange = false;
            eventColor = "warning";
            break;

        case DeviceEventType.Renewed:
            statusColor = deviceStatusToColor(DeviceStatus.Active)[1];
            statusChange = false;
            eventColor = "success";
            break;

        case DeviceEventType.Decommissioned:
            statusColor = deviceStatusToColor(DeviceStatus.Decommissioned)[1];
            statusChange = true;
            eventColor = "error";
            break;

        case DeviceEventType.ShadowUpdated:
            if (idx < logs.length - 1) {
                const colors = getEventColors(logs[idx + 1], idx + 1, logs);
                return {
                    ...colors,
                    fullNode: false
                };
            }
            break;

        case DeviceEventType.StatusUpdated:
            if (log.event.description.includes("to 'REVOKED'")) {
                eventColor = deviceStatusToColor(DeviceStatus.Revoked);
                statusColor = deviceStatusToColor(DeviceStatus.Revoked)[1];
                statusChange = true;
            } else if (log.event.description.includes("to 'ACTIVE'")) {
                statusColor = deviceStatusToColor(DeviceStatus.Active)[1];
                statusChange = true;
                eventColor = deviceStatusToColor(DeviceStatus.Active);
            } else if (log.event.description.includes("to 'REQUIRES_ACTION'")) {
                eventColor = "error";
            } else if (log.event.description.includes("to 'RENEWAL_PENDING'")) {
                eventColor = deviceStatusToColor(DeviceStatus.RenewalWindow);
                statusColor = deviceStatusToColor(DeviceStatus.RenewalWindow)[1];
                statusChange = true;
            } else if (log.event.description.includes("to 'WARN'")) {
                eventColor = deviceStatusToColor(DeviceStatus.RenewalWindow);
                statusColor = deviceStatusToColor(DeviceStatus.RenewalWindow)[1];
                statusChange = true;
            } else if (log.event.description.includes("to 'EXPIRING_SOON'")) {
                eventColor = deviceStatusToColor(DeviceStatus.AboutToExpire);
                statusColor = deviceStatusToColor(DeviceStatus.AboutToExpire)[1];
                statusChange = true;
            } else if (log.event.description.includes("to 'CRITICAL'")) {
                eventColor = deviceStatusToColor(DeviceStatus.AboutToExpire);
                statusColor = deviceStatusToColor(DeviceStatus.AboutToExpire)[1];
                statusChange = true;
            } else if (log.event.description.includes("to 'EXPIRED'")) {
                eventColor = deviceStatusToColor(DeviceStatus.Expired);
                statusColor = deviceStatusToColor(DeviceStatus.Expired)[1];
                statusChange = true;
            } else {
                eventColor = "grey";
            }
            break;

        default:
            break;
        }

        return {
            node: statusColor,
            fullNode: statusChange,
            connector: statusColor,
            label: eventColor
        };
    };

    const isMobileScreen = useMediaQuery(theme.breakpoints.down("md"));

    const slot: Slot<string> = filteredSlot;

    useEffect(() => {
        const mainEvents = Object.keys(device.events).map((eventTS): DeviceLog => {
            return {
                event: device.events[eventTS],
                ts: moment(eventTS)
            };
        });

        let idSlotEvents: Array<DeviceLog> = [];
        if (includeIDSlotLogs) {
            idSlotEvents = Object.keys(device.identity.events).map((eventTS): DeviceLog => {
                return {
                    event: device.identity.events[eventTS],
                    ts: moment(eventTS)
                };
            });
        }

        setDevEvents([...mainEvents, ...idSlotEvents].sort((a, b) => a.ts.isBefore(b.ts) ? 1 : -1));
    }, [device, includeIDSlotLogs]);

    const cols: GridColDef<CertificateWithVersionAndCA>[] = [
        {
            field: "version",
            headerName: "Version",
            minWidth: 50,
            renderCell: ({ value, id }) => {
                return <Typography fontWeight={"500"}>{value}</Typography>;
            }
        },
        {
            field: "serial_number",
            headerName: "Serial Number",
            minWidth: 100,
            flex: 0.2
            // renderCell: ({ value, row, id }) => {
            //     return <Typography fontWeight={"500"}>{value}</Typography>;
            // }
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            minWidth: 100,
            renderCell: ({ value, row, id }) => {
                return <Label color={row.status === CertificateStatus.Active ? "success" : (row.status === CertificateStatus.Revoked ? "error" : "grey")}>{row.status}</Label>;
            }
        },
        { field: "cn", valueGetter: (value, row) => { return row.subject.common_name; }, headerName: "Common Name", width: 200, flex: 0.2 },
        {
            field: "caid",
            headerName: "CA",
            minWidth: 50,
            flex: 0.1,
            sortable: false,
            filterable: false,
            renderCell: ({ value, row, id }) => {
                if (row.ca) {
                    return <Label color={"primary"} onClick={() => {
                        navigate(`/cas/${row.ca!.id}`);
                    }}
                    >
                        {row.ca.certificate.subject.common_name}
                    </Label>;
                }

                return <Label color={"grey"}>{"unknown"}</Label>;
            }
        },
        {
            field: "valid_from",
            headerName: "Valid From",
            headerAlign: "center",
            minWidth: 110,
            renderCell: ({ value, row, id }) => {
                return <Grid container flexDirection={"column"}>
                    <Grid xs><Typography variant="body2" textAlign={"center"}>{moment(row.valid_from).format("DD/MM/YYYY HH:mm")}</Typography></Grid>
                    <Grid xs><Typography variant="caption" textAlign={"center"} textTransform={"none"} component={"div"}>{moment.duration(moment(row.valid_from).diff(moment())).humanize(true)}</Typography></Grid>
                </Grid>;
            }
        },
        {
            field: "valid_to",
            headerName: "Valid To",
            headerAlign: "center",
            minWidth: 110,
            renderCell: ({ value, row, id }) => {
                return <Grid container flexDirection={"column"}>
                    <Grid xs><Typography variant="body2" textAlign={"center"}>{moment(row.valid_to).format("DD/MM/YYYY HH:mm")}</Typography></Grid>
                    <Grid xs><Typography variant="caption" textAlign={"center"} textTransform={"none"} component={"div"}>{moment.duration(moment(row.valid_to).diff(moment())).humanize(true)}</Typography></Grid>
                </Grid>;
            }
        },
        {
            field: "lifespan",
            headerName: "Lifespan",
            minWidth: 50,
            sortable: false,
            filterable: false,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value, row, id }) => {
                return <Label color="grey">
                    {moment.duration(moment(row.valid_to).diff(row.valid_from)).humanize()}
                </Label>;
            }
        },
        {
            field: "revoke_reason",
            headerName: "Revocation",
            minWidth: 150,
            sortable: false,
            filterable: false,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value, row, id }) => {
                if (row.status === CertificateStatus.Revoked) {
                    return <Grid container flexDirection={"column"} marginBottom={"2px"}>
                        <Grid xs><Typography variant="body2" textAlign={"center"}>{moment(row.revocation_timestamp).format("DD/MM/YYYY HH:mm")}</Typography></Grid>
                        <Grid xs><Typography variant="caption" textAlign={"center"} textTransform={"none"} component={"div"}>{moment.duration(moment(row.revocation_timestamp).diff(moment())).humanize(true)}</Typography></Grid>
                        <Grid xs><Label color={"grey"}>{row.revocation_reason}</Label></Grid>
                    </Grid>;
                }

                return "-";
            }
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            headerAlign: "center",
            width: 100,
            cellClassName: "actions",
            renderCell: ({ value, row, id }) => {
                return (
                    <Grid container spacing={1}>
                        <Grid xs="auto">
                            <Tooltip title="Go to Certificate view">
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                    <IconButton onClick={() => {
                                        navigate(`/certs?sn=${row.serial_number}`);
                                    }}>
                                        <ArrowForwardIcon sx={{ color: theme.palette.primary.main }} fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                        </Grid>
                    </Grid>
                );
            }
        }
    ];

    return (
        <Grid container flexDirection={"column"} height={"100%"} flexWrap={"nowrap"}>
            {
                !isMobileScreen && (
                    <Grid component={Paper} container borderRadius={0} padding={"10px 20px"} zIndex={5}>
                        <Grid xs={12} container spacing={4} alignItems="center">
                            <Grid xs="auto">
                                <Tooltip title="Back to Device List">
                                    <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => {
                                        const url = location.pathname;
                                        // navigate(url.substring(0, url.lastIndexOf("/")));
                                        navigate("/devices");
                                    }}>
                                        <ArrowBackIcon style={{ color: theme.palette.primary.main }} />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Slot Active Version: {slot.active_version}</Typography>
                                <Label color={slotStatusToColor(slot.status)}>{slot.status}</Label>
                            </Grid>
                            <Grid xs container flexDirection="column">
                                <Grid container columnSpacing={8} rowSpacing={0}>
                                    <Grid xs="auto">
                                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Serial Number</Typography>
                                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot.versions[slot.active_version]}</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                )
            }
            <Grid container sx={{ flexGrow: 1 }}>
                <TabsListWithRouter
                    headerStyle={{ width: "100%", padding: "10px 10px 0 10px", background: theme.palette.background.paper, boxShadow: "0px 9px 16px rgba(159, 162, 191, .18), 0px 2px 2px rgba(159, 162, 191, 0.32);" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                    useParamsKey="*"
                    tabs={[
                        {
                            label: "Certificates History",
                            goto: "certificates",
                            path: "certificates",
                            element: (
                                <Grid xs={12} sx={{ height: "100%", padding: "20px" }} component={Paper} borderRadius={0}>
                                    <TableFetchViewer
                                        columns={cols}
                                        fetcher={async (params, controller) => {
                                            const promises = [];
                                            const versionedSN: string[] = [];
                                            for (let i = 0; i <= slot.active_version; i++) {
                                                const sn: string = slot.versions[i];
                                                promises.push(apicalls.cas.getCertificate(sn));
                                                versionedSN.push(sn);
                                            }

                                            const responses = await Promise.all(promises);

                                            const uniqueCAIDs = Array.from(new Set(responses.map((cert) => cert.issuer_metadata.id)));
                                            const casPromises: Promise<CertificateAuthority>[] = uniqueCAIDs.map((caID) => {
                                                return apicalls.cas.getCA(caID);
                                            });

                                            const cas = await Promise.all(casPromises);

                                            return new Promise<ListResponse<CertificateWithVersionAndCA>>(resolve => {
                                                resolve({
                                                    list: responses.map((cert) => {
                                                        const version = versionedSN.indexOf(cert.serial_number);
                                                        const ca = cas.find((ca) => ca.id === cert.issuer_metadata.id);
                                                        return { ...cert, version, ca };
                                                    }),
                                                    next: ""
                                                });
                                            });
                                        }}
                                        sortMode="client"
                                        sortField={{ field: "version", sort: "desc" }}
                                        id={(item) => item.serial_number}
                                        ref={tableRef}
                                        density="compact"
                                    />
                                </Grid>
                            )
                        },
                        {
                            label: "Timeline",
                            goto: "timeline",
                            path: "timeline",
                            element: (
                                <Grid container flexDirection={"column"} component={Paper} borderRadius={0} >
                                    <Grid sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", height: "100%", width: "100%", padding: "0px" }}>
                                        <Timeline position="right" sx={{
                                            [`& .${timelineContentClasses.root}`]: {
                                            }
                                        }}>
                                            {
                                                devEvents.map((ev, idx) => {
                                                    const colors = getEventColors(ev, idx, devEvents);
                                                    let tooltip;

                                                    if (ev.event.type === DeviceEventType.Provisioned) {
                                                        tooltip = "Device has been provisioned with a certificate for the first time";
                                                    }

                                                    if (ev.event.type === DeviceEventType.ReProvisioned) {
                                                        tooltip = "Device has acquired a new certificate using the ENROLL procedure (not using the RE-ENROLL)";
                                                    }

                                                    if (ev.event.type === DeviceEventType.Renewed) {
                                                        tooltip = "Device has acquired a new certificate using the RE-ENROLL procedure";
                                                    }

                                                    return (
                                                        <>
                                                            <TimelineItem key={idx}>
                                                                <TimelineOppositeContent flex={isMobileScreen ? "0.4!important" : "0.1!important"}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        <Typography sx={{ color: theme.palette.text.secondary }} fontSize="13px">{ev.ts.format("DD-MM-YYYY HH:mm")}</Typography>
                                                                        <Typography sx={{ color: theme.palette.text.secondary, marginRight: "5px" }} fontSize="13px">{ev.ts.fromNow()}</Typography>
                                                                        {
                                                                            idx < devEvents.length - 1 && (
                                                                                <Label size="small">{moment.duration(moment(devEvents[idx + 1].ts).diff(ev.ts)).humanize()} later</Label>
                                                                            )
                                                                        }
                                                                    </Typography>
                                                                </TimelineOppositeContent>
                                                                <TimelineSeparator>
                                                                    <TimelineDot sx={{ border: `2px solid ${colors.node}`, background: colors.fullNode ? colors.node : "default" }} />
                                                                    {
                                                                        idx < devEvents.length - 1 && (
                                                                            <TimelineConnector sx={{ backgroundColor: getEventColors(devEvents[idx + 1], idx, devEvents).connector }} />
                                                                        )
                                                                    }
                                                                </TimelineSeparator>
                                                                <TimelineContent sx={{ marginTop: "-2px" }}>
                                                                    <Grid container spacing={1} alignItems={"center"}>
                                                                        {
                                                                            ev.event.type === DeviceEventType.ShadowUpdated && (
                                                                                <Grid xs="auto">
                                                                                    <img src={process.env.PUBLIC_URL + "/assets/AWS.png"} alt="Shadow Updated" style={{ width: "35px", height: "35px" }} />
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                        <Grid xs="auto">
                                                                            <KeyValueLabel
                                                                                label={
                                                                                    <Typography fontSize="12px" fontWeight="600" color={"primary"}>{ev.event.type}</Typography>
                                                                                }
                                                                                value=""
                                                                                tooltip={tooltip}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                    <Box sx={{ marginTop: "10px", borderBottom: "1px solid #ddd" }}>
                                                                        <Typography fontSize="12px">
                                                                            {
                                                                                ev.event.type === DeviceEventType.Provisioned && (
                                                                                    <CertificateStandardFetchViewer sn={slot.versions[0]} clickDisplay clickRevoke onReactivate={() => onChange()} onRevoke={() => onChange()} />
                                                                                )
                                                                            }
                                                                            {ev.event.description.includes("New Active Version")
                                                                                ? (
                                                                                    <Grid container direction={"column"}>
                                                                                        <Grid>
                                                                                            {ev.event.description}
                                                                                        </Grid>
                                                                                        <Grid>
                                                                                            <CertificateStandardFetchViewer sn={slot.versions[parseInt(ev.event.description.replace("New Active Version set to ", ""))]} clickDisplay clickRevoke={true} onReactivate={() => onChange()} onRevoke={() => onChange()} />
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                )
                                                                                : (
                                                                                    <> {ev.event.description}</>
                                                                                )}
                                                                        </Typography>
                                                                    </Box>
                                                                </TimelineContent>
                                                            </TimelineItem>
                                                        </>
                                                    );
                                                })
                                            }
                                        </Timeline>
                                    </Grid>
                                </Grid>
                            )
                        },
                        {
                            label: "Metadata",
                            goto: "metadata",
                            path: "metadata",
                            element: (
                                <Grid component={Paper} borderRadius={0} >
                                    <MetadataInput label="" onChange={async (meta) => {
                                        try {
                                            await apicalls.devices.updateDeviceMetadata(device.id, meta);
                                            enqueueSnackbar("Metadata updated successfully", { variant: "success" });
                                            onChange();
                                        } catch (e) {
                                            const errMsg = errorToString(e);
                                            enqueueSnackbar(`Error updating metadata: ${errMsg}`, { variant: "error" });
                                        }
                                    }} value={device.metadata} />
                                </Grid>
                            )
                        }
                    ]}
                />
            </Grid>
        </Grid>
    );
};
