import React, { useEffect, useState } from "react";
import { Divider, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { LamassuTable } from "components/LamassuComponents/Table";
import { useDispatch } from "react-redux";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { TimelineOppositeContent } from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { Device, DeviceEvent, DeviceEventType, Slot, slotStatusToColor } from "ducks/features/devices/models";
import { apicalls } from "ducks/apicalls";
import { Certificate, CertificateStatus } from "ducks/features/cav3/models";
import Grid from "@mui/material/Unstable_Grid2";
import { Switch } from "components/LamassuComponents/dui/Switch";
import Label from "components/LamassuComponents/dui/typographies/Label";

interface Props {
    slotID?: string | undefined,
    device: Device,
}

type CertResponse = {
    version: number,
    cert: Certificate
}

type DeviceLog = {
    event: DeviceEvent,
    ts: moment.Moment
}

export const DeviceInspectorSlotView: React.FC<Props> = ({ slotID, device }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    let filteredSlot = device.identity;
    if (slotID !== undefined && slotID !== "default") {
        filteredSlot = device.slots[slotID];
    }

    const [devEvents, setDevEvents] = useState<DeviceLog[]>([]);

    const [certificates, setCertificates] = useState<CertResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [includeIDSlotLogs, setIncludeIDSlotLogs] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showRevokeCertificate, setShowRevokeCertificate] = useState(false);

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

    useEffect(() => {
        const run = async () => {
            setIsLoading(true);
            const promises = [];
            for (let i = 0; i <= slot.active_version; i++) {
                const sn: string = slot.versions[i];
                promises.push(apicalls.cas.getCertificate(sn));
            }

            const responses = await Promise.all(promises);

            const cerResponses: CertResponse[] = [];
            for (let i = 0; i <= slot.active_version; i++) {
                cerResponses.push({ version: i, cert: responses.find(crt => crt.serial_number === slot.versions[i])! });
            }
            setCertificates([...cerResponses]);
            setIsLoading(false);
        };

        run();
    }, [slot]);

    const certTableColumns = [
        { key: "version", title: "Version", align: "start", size: 1 },
        { key: "serialNumber", title: "Serial Number", align: "start", size: 5 },
        { key: "caName", title: "CA Name", align: "center", size: 2 },
        { key: "certificateStatus", title: "Certificate Status", align: "center", size: 1 },
        { key: "issuedDate", title: "Issued Date", align: "center", size: 2 },
        { key: "lifespan", title: "Lifespan", align: "center", size: 2 },
        { key: "expiredDate", title: "Expiration Date", align: "center", size: 2 },
        { key: "revokeDate", title: "Revocation Date", align: "center", size: 2 }
    ];

    const certificatesRenderer = (cert: CertResponse) => {
        return {
            version: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{cert.version}</Typography>,
            serialNumber: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{cert.cert.serial_number}</Typography>,
            caName: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{cert.cert.issuer_metadata.id}</Typography>,
            certificateStatus: (
                <LamassuChip label={cert.cert.status} color={
                    cert.cert.status === CertificateStatus.Active ? "green" : "red"
                } />
            ),
            issuedDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{moment(cert.cert.valid_from).format("DD-MM-YYYY HH:mm")}</Typography>,
            expiredDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div>
                        {moment(cert.cert.valid_to).format("DD-MM-YYYY HH:mm")}
                    </div>
                    <div>
                        {moment.duration(moment(cert.cert.valid_to).diff(moment())).humanize(true)}
                    </div>
                </div>
            </Typography>,
            lifespan: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{
                moment.duration(moment(cert.cert.valid_to).diff(moment(cert.cert.valid_from))).humanize(false)
            }</Typography>,
            revokeDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>

                {
                    cert.cert.status === CertificateStatus.Revoked
                        ? (
                            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div>
                                    {moment(cert.cert.revocation_timestamp).format("DD-MM-YYYY HH:mm")}
                                </div>
                                <div>
                                    {moment.duration(moment(cert.cert.revocation_timestamp).diff(moment())).humanize(true)}
                                </div>
                                <div>
                                    <LamassuChip compact label={cert.cert.revocation_reason} />
                                </div>
                            </div>
                        )
                        : (
                            <>
                                {"-"}
                            </>
                        )
                }
            </Typography>
        };
    };

    return (
        <>
            <Box sx={{ padding: "10px 20px", display: "flex", alignItems: "center", zIndex: 2 }} component={Paper} borderRadius={0}>
                <Grid container spacing={6} alignItems="center">
                    <Grid xs="auto">
                        <IconButton style={{ backgroundColor: theme.palette.primary.light }} onClick={() => {
                            const url = location.pathname;
                            navigate(url.substring(0, url.lastIndexOf("/")));
                        }}>
                            <ArrowBackIcon style={{ color: theme.palette.primary.main }} />
                        </IconButton>
                    </Grid>
                    <Grid xs="auto">
                        <Typography variant="h5" fontWeight="500" fontSize="15px" textAlign={"center"}
                            sx={{ color: theme.palette.text.main, background: theme.palette.background.lightContrast, display: "inline", padding: "5px 10px", borderRadius: "5px" }}
                        >
                            Identity Slot
                        </Typography>
                    </Grid>
                    <Grid xs="auto">

                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Slot Active Version: {slot.active_version}</Typography>
                        <LamassuChip label={slot.status} color={slotStatusToColor(slot.status)} />
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
            </Box>
            <Grid container sx={{ flexGrow: 1, overflowY: "hidden", height: "300px" }} columns={13}>
                <Grid xs={10} sx={{ padding: "30px", overflowY: "scroll", height: "100%" }} container>
                    <Grid container flexDirection="column" gap={2}>
                        <Grid xs="auto" >
                            <Box component={Paper}>
                                <Box sx={{ padding: "15px" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 18 }}>Certificates</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ height: "100%", padding: "20px" }}>
                                    <LamassuTable listRender={{
                                        columnConf: certTableColumns,
                                        renderFunc: certificatesRenderer,
                                        enableRowExpand: false
                                    }}
                                    data={certificates.sort((a, b) => a.version > b.version ? -1 : 1)} />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid xs={3} container flexDirection={"column"} component={Paper} borderRadius={0} >
                    <Grid container justifyContent={"flex-end"} sx={{ background: theme.palette.primary.light, borderBottom: `2px solid ${theme.palette.primary.main}`, padding: "10px 20px" }}>
                        <Grid xs="auto" container alignItems={"flex-end"} flexDirection={"column"} justifyContent={"flex-end"} >
                            <Grid>
                                <Label sx={{ color: theme.palette.primary.main }}>Include Identity Slot logs</Label>
                            </Grid>
                            <Grid>
                                <Switch label="" value={includeIDSlotLogs} onChange={(ev) => setIncludeIDSlotLogs(!includeIDSlotLogs)} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", height: "0px", padding: "20px" }}>
                        <Timeline position="left" sx={{ width: "100%", marginLeft: "-20px" }}>
                            {
                                devEvents.map((ev, idx) => {
                                    let eventColor:string | [string, string] = "gray";
                                    switch (ev.event.type) {
                                    case DeviceEventType.Created:
                                        eventColor = "green";
                                        break;

                                    case DeviceEventType.Provisioned:
                                        eventColor = "green";
                                        break;

                                    case DeviceEventType.ReProvisioned:
                                        eventColor = "orange";
                                        break;

                                    case DeviceEventType.ShadowUpdated:
                                        eventColor = "orange";
                                        break;

                                    case DeviceEventType.Renewed:
                                        eventColor = "green";
                                        break;
                                    case DeviceEventType.Decommissioned:
                                        eventColor = "red";
                                        break;
                                    case DeviceEventType.StatusUpdated:
                                        if (ev.event.description.includes("to 'REVOKED'")) {
                                            eventColor = "red";
                                        } else if (ev.event.description.includes("to 'ACTIVE'")) {
                                            eventColor = "green";
                                        } else if (ev.event.description.includes("to 'REQUIRES_ACTION'")) {
                                            eventColor = "red";
                                        } else if (ev.event.description.includes("to 'ACTIVE_WITH_WARNS'")) {
                                            eventColor = ["#000000", "#F1DB3D"];
                                        } else if (ev.event.description.includes("to 'WARN'")) {
                                            eventColor = ["#000000", "#F1DB3D"];
                                        } else if (ev.event.description.includes("to 'ACTIVE_WITH_CRITICAL'")) {
                                            eventColor = ["#444444", "#F88B56"];
                                        } else if (ev.event.description.includes("to 'CRITICAL'")) {
                                            eventColor = ["#444444", "#F88B56"];
                                        } else {
                                            eventColor = "gray";
                                        }
                                        break;

                                    default:
                                        break;
                                    }
                                    return (
                                        <TimelineItem key={idx}>
                                            <TimelineOppositeContent style={{ maxWidth: "1px", paddingLeft: "0px", paddingRight: "0px" }} />
                                            <TimelineSeparator>
                                                <TimelineDot variant="outlined" sx={{ margin: 0 }} />
                                                {
                                                    idx !== devEvents.length - 1 && (
                                                        <TimelineConnector />
                                                    )
                                                }
                                            </TimelineSeparator>
                                            <TimelineContent sx={{ marginTop: "-11.5px", marginBottom: "25px", display: "flex", flexDirection: "column", alignItems: "end" }}>
                                                <LamassuChip label={ev.event.type} color={eventColor} />
                                                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                                                    <Typography sx={{ color: theme.palette.text.secondary, marginRight: "5px" }} fontSize="13px">{ev.ts.format("DD-MM-YYYY HH:mm")}</Typography>
                                                    <Typography sx={{ color: theme.palette.text.secondary, marginRight: "5px" }} fontSize="13px">{ev.ts.fromNow()}</Typography>
                                                </Box>
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
            </Grid>
        </>
    );
};
