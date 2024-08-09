import { Box } from "@mui/system";
import { Certificate, CertificateAuthority, CertificateStatus } from "ducks/features/cas/models";
import { Device, DeviceEvent, DeviceEventType, Slot, slotStatusToColor } from "ducks/features/devices/models";
import { Divider, IconButton, Paper, Tooltip, Typography, lighten, useTheme, useMediaQuery } from "@mui/material";
import { FetchHandle, TableFetchViewer } from "components/TableFetcherView";
import { GridColDef } from "@mui/x-data-grid";
import { ListResponse } from "ducks/services/api-client";
import { TimelineOppositeContent } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { useEffect, useState } from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent, { timelineContentClasses } from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import apicalls from "ducks/apicalls";
import moment from "moment";

interface Props {
    slotID?: string | undefined,
    device: Device,
}

type CertificateWithVersionAndCA = Certificate & { version: number, ca: CertificateAuthority | undefined }; // Imported certificates may not belong to any CA

type DeviceLog = {
    event: DeviceEvent,
    ts: moment.Moment
}

export const ViewDeviceDetails: React.FC<Props> = ({ slotID, device }) => {
    const theme = useTheme();

    const navigate = useNavigate();
    const tableRef = React.useRef<FetchHandle>(null);

    let filteredSlot = device.identity;
    if (slotID !== undefined && slotID !== "default") {
        filteredSlot = device.slots[slotID];
    }

    const [devEvents, setDevEvents] = useState<DeviceLog[]>([]);
    const [includeIDSlotLogs, setIncludeIDSlotLogs] = useState(false);

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
                        {row.ca.subject.common_name}
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
                                        navigate(`/certificates/${row.serial_number}`);
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
        <Grid container flexDirection={"column"} height={"100%"}>
            {
                !isMobileScreen && (
                    <Grid component={Paper} container borderRadius={0} padding={"10px 20px"} zIndex={5}>
                        <Grid xs={12} container spacing={6} alignItems="center">
                            <Grid xs="auto">
                                <Tooltip title="Back to Device List">
                                    <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => {
                                        const url = location.pathname;
                                        navigate(url.substring(0, url.lastIndexOf("/")));
                                    }}>
                                        <ArrowBackIcon style={{ color: theme.palette.primary.main }} />
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            {/* <Grid xs="auto">
                        <Typography variant="h5" fontWeight="500" fontSize="15px" textAlign={"center"}
                            sx={{ display: "inline", padding: "5px 10px", borderRadius: "5px" }}
                        >
                            Identity Slot
                        </Typography>
                    </Grid> */}
                            <Grid xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Slot Active Version: {slot.active_version}</Typography>
                                <Label color={slotStatusToColor(slot.status)}>{slot.status}</Label>
                            </Grid>
                            <Grid xs container flexDirection="column">
                                <Grid container columnSpacing={8} rowSpacing={0}>
                                    {/* <Grid xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Expiration Date</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{moment(slot!.active_certificate.valid_to).format("DD-MM-YYYY HH:mm")}</Typography>
                            </Grid>
                            <Grid xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>CA Name</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot!.active_certificate.ca_name}</Typography>
                            </Grid> */}
                                    <Grid xs="auto">
                                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Serial Number</Typography>
                                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot.versions[slot.active_version]}</Typography>
                                    </Grid>
                                    {/* <Grid xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Key Properties</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{`${slot!.active_certificate!.key_metadata.type.toUpperCase()} ${slot!.active_certificate!.key_metadata.bits}`}</Typography>
                            </Grid>
                            <Grid xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Key Strength</Typography>
                                <LamassuChip label={slot!.active_certificate!.key_metadata.strength} color={slot!.active_certificate!.key_metadata.strength_color} compact />
                            </Grid>
                            <Grid xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Subject</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>
                                    {decodedCertificateSubject}
                                </Typography>
                            </Grid> */}
                                </Grid>
                            </Grid>
                            <Grid xs="auto">
                                {/* {
                            slot.status && (
                                <Grid xs container alignItems={"center"} justifyContent={"flex-end"}>
                                    <Button variant="outlined" size="small" onClick={() => { setShowCertificate(true); }}>View Certificate</Button>
                                    <Modal
                                        title=""
                                        isOpen={showCertificate}
                                        onClose={() => { setShowCertificate(false); }}
                                        subtitle=""
                                        actions={
                                            <Box>
                                                <Button onClick={() => { setShowCertificate(false); }}>Close</Button>
                                            </Box>
                                        }
                                        content={
                                            <SyntaxHighlighter language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {window.window.atob(slot!.active_certificate.certificate)}
                                            </SyntaxHighlighter>
                                        }
                                    />
                                </Grid>

                            )
                        } */}
                            </Grid>
                        </Grid>
                    </Grid>
                )
            }
            <Grid container sx={{ flexGrow: 1 }} columns={13}>
                <Grid xs md={10} columns={12} sx={{ padding: "30px", height: "100%" }} container>
                    <Grid md={12} container component={Paper} spacing={2}>
                        <Grid xs={12} sx={{ padding: "15px" }}>
                            <Typography variant="h4">Certificates</Typography>
                        </Grid>
                        <Grid xs={12} >
                            <Divider />
                        </Grid>
                        <Grid xs={12} sx={{ height: "calc(100% - 40px)", padding: "20px" }}>
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
                                id={(item) => item.serial_number}
                                sortField={{ field: "valid_from", sort: "desc" }}
                                ref={tableRef}
                                density="compact"
                            />
                        </Grid>
                    </Grid>
                </Grid>
                {
                    !isMobileScreen && (
                        <Grid md={3} container flexDirection={"column"} component={Paper} borderRadius={0} >
                            <Grid sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", height: "0px", padding: "20px" }}>
                                <Timeline position="right" sx={{
                                    [`& .${timelineContentClasses.root}`]: {
                                    }
                                }}>
                                    {
                                        devEvents.map((ev, idx) => {
                                            let eventColor: "success" | "error" | "grey" | "warning" | [string, string] = "grey";
                                            switch (ev.event.type) {
                                            case DeviceEventType.Created:
                                                eventColor = "success";
                                                break;

                                            case DeviceEventType.Provisioned:
                                                eventColor = "success";
                                                break;

                                            case DeviceEventType.ReProvisioned:
                                                eventColor = "warning";
                                                break;

                                            case DeviceEventType.ShadowUpdated:
                                                eventColor = "warning";
                                                break;

                                            case DeviceEventType.Renewed:
                                                eventColor = "success";
                                                break;

                                            case DeviceEventType.Decommissioned:
                                                eventColor = "error";
                                                break;
                                            case DeviceEventType.StatusUpdated:
                                                if (ev.event.description.includes("to 'REVOKED'")) {
                                                    eventColor = "error";
                                                } else if (ev.event.description.includes("to 'ACTIVE'")) {
                                                    eventColor = "success";
                                                } else if (ev.event.description.includes("to 'REQUIRES_ACTION'")) {
                                                    eventColor = "error";
                                                } else if (ev.event.description.includes("to 'ACTIVE_WITH_WARNS'")) {
                                                    eventColor = ["#000000", "#F1DB3D"];
                                                } else if (ev.event.description.includes("to 'WARN'")) {
                                                    eventColor = ["#000000", "#F1DB3D"];
                                                } else if (ev.event.description.includes("to 'ACTIVE_WITH_CRITICAL'")) {
                                                    eventColor = ["#444444", "#F88B56"];
                                                } else if (ev.event.description.includes("to 'CRITICAL'")) {
                                                    eventColor = ["#444444", "#F88B56"];
                                                } else {
                                                    eventColor = "grey";
                                                }
                                                break;

                                            default:
                                                break;
                                            }
                                            return (
                                                <TimelineItem key={idx}>
                                                    <TimelineOppositeContent flex={"0.5!important"}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <Typography sx={{ color: theme.palette.text.secondary }} fontSize="13px">{ev.ts.format("DD-MM-YYYY HH:mm")}</Typography>
                                                            <Typography sx={{ color: theme.palette.text.secondary, marginRight: "5px" }} fontSize="13px">{ev.ts.fromNow()}</Typography>
                                                        </Typography>
                                                    </TimelineOppositeContent>
                                                    <TimelineSeparator >
                                                        <TimelineDot />
                                                        {
                                                            idx !== devEvents.length - 1 && (
                                                                <TimelineConnector />
                                                            )
                                                        }
                                                    </TimelineSeparator>
                                                    <TimelineContent sx={{ marginTop: "-5px" }}>
                                                        <Label color={"primary"}>{ev.event.type}</Label>
                                                        <Box sx={{ marginTop: "10px" }}>
                                                            <Typography fontSize="12px">
                                                                {ev.event.description}
                                                            </Typography>
                                                        </Box>
                                                    </TimelineContent>
                                                </TimelineItem>
                                            );
                                        })
                                    }
                                </Timeline>
                            </Grid>
                        </Grid>
                    )
                }
            </Grid>
        </Grid>
    );
};
