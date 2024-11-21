import { Box } from "@mui/system";
import { Certificate, CertificateAuthority, CertificateStatus } from "ducks/features/cas/models";
import { AWSIoTDeviceMetadata, Device, DeviceEvent, Slot, deviceStatusToColor } from "ducks/features/devices/models";
import { IconButton, Paper, Tooltip, Typography, lighten, useTheme, useMediaQuery } from "@mui/material";
import { FetchHandle, TableFetchViewer } from "components/TableFetcherView";
import { GridColDef } from "@mui/x-data-grid";
import { errorToString, ListResponse } from "ducks/services/api-client";
import { TimelineOppositeContent } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Grid from "@mui/material/Unstable_Grid2";
import Label, { BasicColor } from "components/Label";
import React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent, { timelineContentClasses } from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import apicalls from "ducks/apicalls";
import moment from "moment";
import { TabsListWithRouter } from "components/TabsListWithRouter";
import { MetadataInput } from "components/forms/MetadataInput";
import { enqueueSnackbar } from "notistack";
import { FetchViewer } from "components/FetchViewer";
import { EventVisualizer } from "./DeviceEventVisualizer";

interface Props {
    slotID?: string | undefined,
    device: Device,
    onChange: () => void
}

type CertificateWithVersionAndCA = Certificate & { version: number, ca: CertificateAuthority | undefined }; // Imported certificates may not belong to any CA

export const ViewDeviceDetails: React.FC<Props> = ({ slotID, device, onChange }) => {
    const theme = useTheme();

    const navigate = useNavigate();
    const tableRef = React.useRef<FetchHandle>(null);

    let filteredSlot = device.identity;
    if (slotID !== undefined && slotID !== "default") {
        filteredSlot = device.slots[slotID];
    }

    const getEventColors = (ev: DeviceEvent, idx: number, events: DeviceEvent[]): { node: string, fullNode: boolean, connector: string, label: [string, string] | BasicColor } => {
        const eventColor: "success" | "error" | "grey" | "warning" | [string, string] | BasicColor = "grey";
        const statusColor = deviceStatusToColor(ev.status)[1];

        let didStatusChange = false;
        if (idx < events.length - 1) {
            didStatusChange = events[idx + 1].status !== ev.status;
        }

        return {
            node: statusColor,
            fullNode: didStatusChange,
            connector: statusColor,
            label: eventColor
        };
    };

    const isMobileScreen = useMediaQuery(theme.breakpoints.down("md"));
    const slot: Slot<string> = filteredSlot;

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
                                        navigate(`/certs/${row.serial_number}`);
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

    const awsMetadataKeys = Object.keys(device.metadata).filter((key) => key.startsWith("lamassu.io/iot/aws."));
    const awsMetadata = Object.entries(device.metadata).filter(([key, value]) => awsMetadataKeys.includes(key));
    console.log(awsMetadata);

    return (
        <Grid container flexDirection={"column"} height={"100%"} flexWrap={"nowrap"}>
            <Grid component={Paper} container borderRadius={0} padding={"10px 20px"} zIndex={5}>
                {
                    awsMetadata.map(([key, value]) => {
                        const awsDeviceMeta = value as AWSIoTDeviceMetadata;
                        console.log(awsDeviceMeta);

                        return (
                            <Grid xs="auto" key={key} container spacing={4} alignItems="center">
                                <Grid xs="auto">
                                    <img src={process.env.PUBLIC_URL + "/assets/AWS.png"} alt="logo" style={{ width: 35, height: 35 }} />
                                </Grid>
                                <Grid xs="auto" container flexDirection="column" spacing={0.25}>
                                    <Grid xs="auto" container spacing={0.5} alignItems={"center"}>
                                        <Grid xs="auto">
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: awsDeviceMeta.connection_details.is_connected ? theme.palette.success.main : theme.palette.error.main }} />
                                        </Grid>
                                        <Grid xs="auto">
                                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>{awsDeviceMeta.connection_details.is_connected ? "Connected" : "Disconnected"}</Typography>
                                        </Grid>
                                        <Grid xs="auto">
                                            -
                                        </Grid>
                                        <Grid xs="auto">
                                            {
                                                awsDeviceMeta.connection_details.is_connected
                                                    ? (
                                                        <Label size="small">{`IP: ${awsDeviceMeta.connection_details.ip_address}`}</Label>
                                                    )
                                                    : (
                                                        <Label size="small">{awsDeviceMeta.connection_details.disconnection_reason}</Label>
                                                    )
                                            }
                                        </Grid>
                                    </Grid>
                                    <Grid xs="auto" container alignItems="center">
                                        <Grid xs="auto">
                                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>Connector ID:</Typography>
                                        </Grid>
                                        <Grid xs="auto">
                                            <Label size="small">{key}</Label>
                                        </Grid>
                                    </Grid>
                                    <Grid xs="auto" alignItems="center" container>
                                        <Grid xs="auto">
                                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>Last Connection Update:</Typography>
                                        </Grid>
                                        <Grid xs="auto">
                                            <Label size="small">{moment(awsDeviceMeta.connection_details.latest_connection_update).format("DD/MM/YYYY HH:mm")}</Label>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        );
                    })
                }
            </Grid>
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
                                        <FetchViewer
                                            fetcher={() => apicalls.devices.getDeviceEvents(device.id, { sortField: "timestamp", sortMode: "desc" })}
                                            renderer={(response: ListResponse<DeviceEvent>) => {
                                                const events = response.list.sort((a, b) => moment(b.timestamp).diff(a.timestamp));
                                                return (
                                                    <Timeline position="right" sx={{
                                                        [`& .${timelineContentClasses.root}`]: {
                                                        }
                                                    }}>
                                                        {
                                                            events.map((ev, idx) => {
                                                                const colors = getEventColors(ev, idx, response.list);
                                                                return (
                                                                    <>
                                                                        <TimelineItem key={idx}>
                                                                            <TimelineOppositeContent flex={isMobileScreen ? "0.4!important" : "0.1!important"}>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    <Typography sx={{ color: theme.palette.text.secondary }} fontSize="13px">{moment(ev.timestamp).format("DD-MM-YYYY HH:mm")}</Typography>
                                                                                    <Typography sx={{ color: theme.palette.text.secondary, marginRight: "5px" }} fontSize="13px">{moment(ev.timestamp).fromNow()}</Typography>
                                                                                    {
                                                                                        idx < events.length - 1 && (
                                                                                            <Label size="small">{moment.duration(moment(events[idx + 1].timestamp).diff(ev.timestamp)).humanize()} later</Label>
                                                                                        )
                                                                                    }
                                                                                </Typography>
                                                                            </TimelineOppositeContent>
                                                                            <TimelineSeparator>
                                                                                <TimelineDot sx={{ border: `2px solid ${colors.node}`, background: colors.fullNode ? colors.node : "default" }} />
                                                                                {
                                                                                    idx < events.length - 1 && (
                                                                                        <TimelineConnector sx={{ backgroundColor: getEventColors(events[idx + 1], idx, events).connector }} />
                                                                                    )
                                                                                }
                                                                            </TimelineSeparator>
                                                                            <TimelineContent sx={{ marginTop: "-2px" }}>
                                                                                <EventVisualizer event={ev} device={device} refresh={() => {
                                                                                    onChange();
                                                                                }} />
                                                                            </TimelineContent>
                                                                        </TimelineItem>
                                                                    </>
                                                                );
                                                            })
                                                        }
                                                    </Timeline>
                                                );
                                            }}
                                        />
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
        </Grid >
    );
};
