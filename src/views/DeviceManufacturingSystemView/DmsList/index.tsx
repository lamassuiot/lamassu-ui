import React, { useEffect, useState } from "react";

import { Box, Button, Collapse, Grid, IconButton, Paper, Skeleton, Tooltip, Typography, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { GoLinkExternal } from "react-icons/go";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { IconInput } from "components/LamassuComponents/dui/IconInput";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { Chip } from "components/LamassuComponents/dui/Chip";
import TerminalIcon from "@mui/icons-material/Terminal";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { StepModal } from "components/LamassuComponents/dui/StepModal";
import { TextField } from "components/LamassuComponents/dui/TextField";
import CAFetchViewer from "components/LamassuComponents/lamassu/CAFetchViewer";
import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { pSBC } from "components/utils/colors";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { RootState, selectors } from "ducks/reducers";
import { DMS } from "ducks/features/ra/models";
import { actions } from "ducks/actions";
import RefreshIcon from "@mui/icons-material/Refresh";

export const DmsList = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const navigate = useNavigate();

    const requestStatus = useAppSelector((state: RootState) => selectors.dms.getDMSListRequestStatus(state));
    const dmsList = useAppSelector((state: RootState) => selectors.dms.getDMSs(state));

    const refreshAction = () => dispatch(actions.dmsActions.getDMSs.request({
        bookmark: "",
        filters: [],
        limit: 35,
        sortField: "id",
        sortMode: "asc"
    }));

    useEffect(() => {
        refreshAction();
    }, []);

    let content = <EmptyDMSListHint />;

    if (!requestStatus.isLoading && dmsList.length > 0) {
        content = (
            <Grid container spacing={2}>
                {
                    dmsList.map((dms, idx) => (
                        <Grid item xs={6} xl={4} key={idx}>
                            <DMSCardRenderer dms={dms} />
                        </Grid>
                    ))
                }
            </Grid>
        );
    } else if (requestStatus.isLoading) {
        content = (
            <Box sx={{ width: "100%", marginBottom: "20px" }}>
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            </Box>
        );
    }

    return (
        <Box padding={"20px"}>
            <Grid container flexDirection={"column"} spacing={2}>
                <Grid item container>
                    <Grid item xs={"auto"} container justifyContent={"flex-end"}>
                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40, marginLeft: 10 }}>
                            <IconButton style={{ background: theme.palette.primary.light }} onClick={() => { refreshAction(); }}>
                                <RefreshIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Box>
                    </Grid>
                    <Grid item xs={"auto"} container justifyContent={"flex-end"}>
                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40, marginLeft: 10 }}>
                            <IconButton style={{ background: theme.palette.primary.light }} onClick={() => { navigate("create"); }}>
                                <AddIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
                <Grid item>
                    {content}
                </Grid>
            </Grid>
        </Box>
    );
};

const EmptyDMSListHint: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
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
    );
};
interface DMSCardRendererProps {
    dms: DMS
}

const DMSCardRenderer: React.FC<DMSCardRendererProps> = ({ dms }) => {
    const theme = useTheme();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [enrollDMSCmds, setEnrollDMSCmds] = useState<{ open: boolean, dmsName: string }>({ open: false, dmsName: "" });
    const [enrollDeviceID, setEnrollDeviceID] = useState("");

    const [expanded, setExpanded] = useState(false);

    const splitColors = dms.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-");
    let iconBG = "";
    let iconFG = "";
    if (splitColors.length === 2) {
        iconBG = splitColors[0];
        iconFG = splitColors[1];
    }

    return (
        <>
            <Box component={Paper} padding={"10px"}>
                <Grid container flexDirection={"column"} spacing={1}>
                    <Grid item container spacing={1} flexDirection={"column"}>
                        <Grid item container spacing={1}>
                            <Grid item xs container spacing={1}>
                                <Grid item>
                                    <IconInput readonly label="" size={35} value={{ bg: iconBG, fg: iconFG, name: dms.settings.enrollment_settings.device_provisioning_profile.icon }} />
                                </Grid>
                                <Grid item xs container flexDirection={"column"}>
                                    <Grid item>
                                        <Typography>{dms.name}</Typography>
                                        <Chip label={dms.id} compact color="warn" />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs="auto" container spacing={"20px"}>
                                <Grid item xs="auto" container spacing={1}>
                                    <Grid item xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <Tooltip title="CA Certificates">
                                                <IconButton onClick={(ev) => { navigate(`${dms.id}/cacerts`); }}>
                                                    <AccountBalanceOutlinedIcon fontSize={"small"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    <Grid item xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <Tooltip title="cURL enrollment commands">
                                                <IconButton onClick={(ev) => { setEnrollDMSCmds({ open: true, dmsName: dms.id }); }}>
                                                    <TerminalIcon fontSize={"small"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid item xs="auto" container spacing={1}>
                                    <Grid item xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <Tooltip title="Edit">
                                                <IconButton onClick={(ev) => { navigate(`${dms.id}/edit`); }}>
                                                    <EditIcon fontSize={"small"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    {/* <Grid item xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={(ev) => { navigate(`${dms.id}/edit`); }}>
                                                    <DeleteIcon fontSize={"small"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid> */}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item container spacing={1} flexDirection={"column"}>
                            <Grid item>
                                <Box onClick={() => {
                                    setExpanded(!expanded);
                                }} sx={{ cursor: "pointer", background: theme.palette.mode === "dark" ? "#30444f" : "#ddd", borderRadius: "3px" }}>
                                    <Typography fontSize={"12px"} textAlign={"center"}>
                                        {">> Click to see more options <<"}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Box sx={{ padding: "10px" }}>
                                <Collapse in={expanded}>
                                    <Grid item container spacing={1} flexDirection={"column"}>
                                        <Grid item>
                                            <SubsectionTitle fontSize={"18px"} sx={{ fontVariant: "all-small-caps" }}>Enrollment Settings</SubsectionTitle>
                                        </Grid>
                                        <Grid item>
                                            <KeyValueLabel
                                                label="EST Enrollment Endpoint"
                                                value={
                                                    <Typography style={{ color: theme.palette.text.primary, fontSize: 12 }}>{"https://" + window.location.hostname + "/api/dmsmanager/.well-known/est/" + dms.id + "/simpleenroll"}</Typography>
                                                }
                                            />
                                        </Grid>
                                        <Grid item>
                                            <KeyValueLabel
                                                label="Enrollment CA"
                                                value={
                                                    <CAFetchViewer caName={dms.settings.enrollment_settings.enrollment_ca} size="small" />
                                                }
                                            />
                                        </Grid>
                                        <Grid item>
                                            <KeyValueLabel
                                                label="Validation CAs"
                                                value={
                                                    <Grid container flexDirection={"column"} spacing={1}>
                                                        {
                                                            dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas.map((caName, idx) => {
                                                                return (
                                                                    <Grid item xs key={idx}>
                                                                        <CAFetchViewer caName={caName} size="small" />
                                                                    </Grid>
                                                                );
                                                            })
                                                        }
                                                    </Grid>
                                                }
                                            />
                                        </Grid>

                                        <Grid item container spacing={2}>
                                            <Grid item xs>
                                                <KeyValueLabel
                                                    label="Authentication Mode"
                                                    value={
                                                        <LamassuChip label={dms.settings.enrollment_settings.est_rfc7030_settings.auth_mode} />
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs>
                                                <KeyValueLabel
                                                    label="Registration Mode"
                                                    value={
                                                        <LamassuChip label={dms.settings.enrollment_settings.registration_mode} />
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs>
                                                <KeyValueLabel
                                                    label="Allow Override Enrollment"
                                                    value={
                                                        dms.settings.enrollment_settings.enable_replaceable_enrollment
                                                            ? (
                                                                <Box sx={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                    borderRadius: "100%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    background: pSBC(0.5, theme.palette.info.light)
                                                                }}>
                                                                    <CheckIcon sx={{ color: theme.palette.info.light, fontSize: "12px" }} />
                                                                </Box>
                                                            )
                                                            : (
                                                                <CloseIcon sx={{ color: theme.palette.grey[500] }} />
                                                            )
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs>
                                                <KeyValueLabel
                                                    label="Chain Validation"
                                                    value={
                                                        <LamassuChip label={`${dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.chain_level_validation} LEVELS`} />
                                                    }
                                                />
                                            </Grid>

                                        </Grid>

                                        <Grid item container spacing={1} flexDirection={"column"}>
                                            <Grid item>
                                                <SubsectionTitle fontSize={"18px"} sx={{ fontVariant: "all-small-caps" }}>Re-Enrollment Settings</SubsectionTitle>
                                            </Grid>

                                            <Grid item>
                                                <KeyValueLabel
                                                    label="EST ReEnrollment Endpoint"
                                                    value={
                                                        <Typography style={{ color: theme.palette.text.primary, fontSize: 12 }}>{"https://" + window.location.hostname + "/api/dmsmanager/.well-known/est/" + dms.id + "/simplereenroll"}</Typography>
                                                    }
                                                />
                                            </Grid>

                                        </Grid>
                                        <Grid item>
                                            <KeyValueLabel
                                                label="Additional Validation CAs"
                                                value={
                                                    <Grid container flexDirection={"column"} spacing={1}>
                                                        {
                                                            dms.settings.reenrollment_settings.additional_validation_cas.map((caName, idx) => {
                                                                return (
                                                                    <Grid item xs key={idx}>
                                                                        <CAFetchViewer caName={caName} size="small" />
                                                                    </Grid>
                                                                );
                                                            })
                                                        }
                                                    </Grid>
                                                }
                                            />
                                        </Grid>

                                        <Grid item container spacing={2}>
                                            <Grid item xs>
                                                <KeyValueLabel
                                                    label="Allowed Renewal Delta"
                                                    value={
                                                        <LamassuChip label={dms.settings.reenrollment_settings.reenrollment_delta} />
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs>
                                                <KeyValueLabel
                                                    label="Allow Expired Renewal"
                                                    value={
                                                        dms.settings.reenrollment_settings.enable_expired_renewal
                                                            ? (
                                                                <Box sx={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                    borderRadius: "100%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    background: pSBC(0.5, theme.palette.info.light)
                                                                }}>
                                                                    <CheckIcon sx={{ color: theme.palette.info.light, fontSize: "12px" }} />
                                                                </Box>
                                                            )
                                                            : (
                                                                <CloseIcon sx={{ color: theme.palette.grey[500] }} />
                                                            )
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Collapse>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
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
        </>
    );
};
