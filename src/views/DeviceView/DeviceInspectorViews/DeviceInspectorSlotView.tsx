import React, { useState } from "react";
import { Divider, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
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
import { getColor } from "components/utils/lamassuColors";
import { Device } from "ducks/features/devices/models";

interface Props {
    slotID: string | undefined,
    device: Device,
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

    const [showCertificate, setShowCertificate] = useState(false);
    const [showRevokeCertificate, setShowRevokeCertificate] = useState(false);

    // let slot: DeviceSlot | undefined;
    const slot = filteredSlot;
    // if (filteredSlot.length === 1) {
    //     slot = filteredSlot[0];
    // } else {
    //     return (
    //         <>
    //             <Box padding="20px">
    //                 <Typography sx={{ marginTop: "10px", fontStyle: "italic" }}>Device with ID {device.id} does not have slot {slotID}</Typography>
    //             </Box>
    //         </>
    //     );
    // }

    const decodedCertificateSubject = "";

    const certTableColumns = [
        { key: "serialNumber", title: "Serial Number", align: "start", size: 3 },
        { key: "caName", title: "CA Name", align: "center", size: 2 },
        { key: "certificateStatus", title: "Certificate Status", align: "center", size: 1 },
        { key: "issuedDate", title: "Issued Date", align: "center", size: 1 },
        { key: "revokeDate", title: "Revocation Date", align: "center", size: 1 }
    ];

    const certificatesRenderer = (certSN: string) => {
        return {
            serialNumber: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{certSN}</Typography>
            // caName: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{cert.ca_name}</Typography>,
            // certificateStatus: (
            //     <LamassuChip label={cert.status} color={cert.status_color} />
            // ),
            // issuedDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{moment(cert.valid_from).format("DD-MM-YYYY HH:mm")}</Typography>,
            // revokeDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
            //     {cert.status === OSlotCertificateStatus.REVOKED ? moment(cert.revocation_timestamp).format("DD-MM-YYYY HH:mm") : "-"}
            // </Typography>
        };
    };

    return (
        <>
            <Box sx={{ padding: "10px 20px", display: "flex", alignItems: "center", zIndex: 2 }} component={Paper} borderRadius={0}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs="auto">
                        <IconButton style={{ backgroundColor: theme.palette.primary.light }} onClick={() => {
                            const url = location.pathname;
                            navigate(url.substring(0, url.lastIndexOf("/")));
                        }}>
                            <ArrowBackIcon style={{ color: theme.palette.primary.main }} />
                        </IconButton>
                    </Grid>
                    <Grid item xs="auto">
                        <Typography variant="h5" fontWeight="500" fontSize="15px" textAlign={"center"} sx={{ color: theme.palette.text.main, background: theme.palette.background.lightContrast, display: "inline", padding: "5px 10px", borderRadius: "5px" }}>Slot {slotID}</Typography>
                    </Grid>
                    <Grid item xs="auto">
                        <LamassuChip label={slot.status} color={"gray"} />
                    </Grid>
                    <Grid item xs container flexDirection="column">
                        <Grid item container columnSpacing={8} rowSpacing={0}>
                            {/* <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Expiration Date</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{moment(slot!.active_certificate.valid_to).format("DD-MM-YYYY HH:mm")}</Typography>
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>CA Name</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot!.active_certificate.ca_name}</Typography>
                            </Grid> */}
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Serial Number</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot.versions[slot.active_version]}</Typography>
                            </Grid>
                            {/* <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Key Properties</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{`${slot!.active_certificate!.key_metadata.type.toUpperCase()} ${slot!.active_certificate!.key_metadata.bits}`}</Typography>
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Key Strength</Typography>
                                <LamassuChip label={slot!.active_certificate!.key_metadata.strength} color={slot!.active_certificate!.key_metadata.strength_color} compact />
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Subject</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>
                                    {decodedCertificateSubject}
                                </Typography>
                            </Grid> */}
                        </Grid>
                    </Grid>
                    <Grid item xs="auto">
                        {/* {
                            slot.status && (
                                <Grid item xs container alignItems={"center"} justifyContent={"flex-end"}>
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
                <Grid item xs={10} sx={{ padding: "30px", overflowY: "scroll", height: "100%" }} container>
                    <Grid item container flexDirection="column" gap={2}>
                        <Grid item xs="auto" >
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
                                    data={Object.values(slot.versions)} />
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs="auto" >
                            <Box component={Paper}>
                                <Box sx={{ padding: "15px" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 18 }}>Cloud Connectors</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ height: "calc(100% - 40px)", padding: "20px" }}>
                                    <>TBD</>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={3} container flexDirection={"column"} component={Paper} borderRadius={0} sx={{ padding: "20px" }}>
                    <Grid item sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", height: "0px" }}>
                        <Timeline position="left" sx={{ width: "100%", marginLeft: "-20px" }}>
                            {
                                Object.keys(device.logs).map((logTS, idx) => (
                                    <TimelineItem key={idx}>
                                        <TimelineOppositeContent style={{ maxWidth: "1px", paddingLeft: "0px", paddingRight: "0px" }} />
                                        <TimelineSeparator>
                                            <TimelineDot variant="outlined" sx={{ margin: 0 }} />
                                            <TimelineConnector />
                                        </TimelineSeparator>
                                        <TimelineContent sx={{ marginTop: "-11.5px", marginBottom: "25px" }}>
                                            <Typography fontWeight="500">{device.logs[logTS].Criticality}</Typography>
                                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                                <Typography sx={{ color: theme.palette.text.secondary, marginRight: "5px" }} fontSize="13px">{moment(logTS).format("DD-MM-YYYY HH:mm")}</Typography>
                                                <Typography sx={{ color: getColor(theme, "gray")[0] }} fontSize="13px" fontWeight="500">{device.logs[logTS].Criticality}</Typography>
                                            </Box>
                                            <Box sx={{ marginTop: "10px" }}>
                                                <Typography fontSize="12px">
                                                    {device.logs[logTS].message}
                                                </Typography>
                                            </Box>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))
                            }
                        </Timeline>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};
