import React, { useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, MenuItem, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ListWithDataController, ListWithDataControllerConfigProps } from "components/LamassuComponents/Table";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import deepEqual from "fast-deep-equal/es6";
import { selectors } from "ducks/reducers";
import { actions } from "ducks/actions";
import { Certificate, CertificateStatus, RevocationReason, certificateFilters, getRevocationReasonDescription } from "ducks/features/cav3/models";
import { LamassuChip } from "components/LamassuComponents/Chip";
import moment from "moment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { apicalls } from "ducks/apicalls";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { MultiKeyValueInput } from "components/LamassuComponents/dui/MultiKeyValueInput";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { Select } from "components/LamassuComponents/dui/Select";

export const CertificateListView = () => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => selectors.certs.getStatus(state));
    const certList = useAppSelector((state) => selectors.certs.getCerts(state));
    const totalCertificates = -1;

    const [showCertificate, setShowCertificate] = useState<string | undefined>(undefined);
    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState({ isOpen: false, serialNumber: "" });
    const [revokeReason, setRevokeReason] = useState("Unspecified");

    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(
        {
            filters: {
                activeFilters: [],
                options: certificateFilters
            },
            sort: {
                enabled: true,
                selectedField: "valid_from",
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

    const refreshAction = () => dispatch(actions.certsActions.getCerts.request({
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
        { key: "serial", title: "Serial Number", query: "serial_number", sortFieldKey: "serial_number", align: "start", size: 4 },
        { key: "status", title: "Status", sortFieldKey: "status", align: "center", size: 1 },
        { key: "cn", title: "Common Name", align: "center", size: 2 },
        { key: "key", title: "Key", align: "center", size: 2 },
        { key: "caid", title: "CA ID", align: "center", size: 3 },
        { key: "valid_to", title: "Valid From", sortFieldKey: "valid_to", align: "center", size: 2 },
        { key: "valid_from", title: "Valid To", sortFieldKey: "valid_from", align: "center", size: 2 },
        { key: "lifespan", title: "Lifespan", align: "center", size: 1 },
        { key: "revocation", title: "Revocation", align: "center", sortFieldKey: "revocation_timestamp", size: 2 },
        { key: "actions", title: "", align: "end", size: 2 }
    ];

    const certRender = (cert: Certificate) => {
        return {
            serial: (
                <Typography style={{ fontWeight: "700", fontSize: 14, color: theme.palette.text.primary }}>{
                    cert.serial_number}
                </Typography>
            ),
            cn: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, wordBreak: "break-word" }}>{cert.subject.common_name}</Typography>
            ),
            caid: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{cert.issuer_metadata.id}</Typography>
            ),
            key: (
                <LamassuChip style={{ textAlign: "center" }} label={`${cert.key_metadata.type} ${cert.key_metadata.bits} - ${cert.key_metadata.strength}`} />
            ),
            status: (
                <LamassuChip label={cert.status} color={
                    cert.status === CertificateStatus.Active ? "green" : "red"
                } />
            ),
            valid_to: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{moment(cert.valid_from).format("DD-MM-YYYY HH:mm")}</Typography>
            ),
            valid_from: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div>
                            {moment(cert.valid_to).format("DD-MM-YYYY HH:mm")}
                        </div>
                        <div>
                            {moment.duration(moment(cert.valid_to).diff(moment())).humanize(true)}
                        </div>
                    </div>
                </Typography>
            ),
            lifespan: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{
                    moment.duration(moment(cert.valid_to).diff(moment(cert.valid_from))).humanize(false)
                }</Typography>
            ),
            revocation: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
                    {
                        cert.status === CertificateStatus.Revoked
                            ? (
                                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div>
                                        {moment(cert.revocation_timestamp).format("DD-MM-YYYY HH:mm")}
                                    </div>
                                    <div>
                                        {moment.duration(moment(cert.revocation_timestamp).diff(moment())).humanize(true)}
                                    </div>
                                    <div>
                                        <LamassuChip compact label={cert.revocation_reason} />
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
            ),
            actions: (
                <Box>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Tooltip title="Show Certificate">
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                    <IconButton onClick={() => { setShowCertificate(cert.serial_number); }}>
                                        <VisibilityIcon fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                            <Modal
                                title={`Certificate ${cert.serial_number}`}
                                subtitle=""
                                isOpen={showCertificate === cert.serial_number}
                                maxWidth={false}
                                onClose={() => { setShowCertificate(undefined); }}
                                actions={
                                    <Box>
                                        <Button onClick={() => { setShowCertificate(undefined); }}>Close</Button>
                                    </Box>
                                }
                                content={
                                    <Grid container spacing={4} width={"100%"}>
                                        <Grid item xs="auto">
                                            <CodeCopier code={window.window.atob(cert.certificate)} enableDownload downloadFileName={cert.issuer_metadata.id + "_" + cert.serial_number + ".crt"} />
                                        </Grid>
                                        <Grid item xs container flexDirection={"column"}>
                                            <MultiKeyValueInput label="Metadata" value={cert.metadata} onChange={(meta) => {
                                                if (!deepEqual(cert.metadata, meta)) {
                                                    apicalls.cas.updateCertificateMetadata(cert.serial_number, meta);
                                                }
                                            }} />
                                        </Grid>
                                    </Grid>
                                }
                            />
                        </Grid>
                        {
                            cert.status !== CertificateStatus.Revoked && (
                                <Grid item>
                                    <Tooltip title="Revoke Certificate">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <IconButton>
                                                <DeleteIcon fontSize={"small"} onClick={() => { setIsRevokeDialogOpen({ isOpen: true, serialNumber: cert.serial_number }); }} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            )
                        }
                        {
                            cert.status === CertificateStatus.Revoked && (
                                cert.revocation_reason === "CertificateHold" && (
                                    <Grid item>
                                        <Tooltip title="ReActivate certificate">
                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                <IconButton>
                                                    <UnarchiveOutlinedIcon fontSize={"small"} onClick={() => {
                                                        apicalls.cas.updateCertificateStatus(cert.serial_number, CertificateStatus.Active);
                                                    }} />
                                                </IconButton>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                )
                            )
                        }
                    </Grid>
                </Box >
            )
        };
    };

    return (
        <Box sx={{ padding: "20px", height: "calc(100% - 40px)" }}>
            <ListWithDataController
                data={certList}
                totalDataItems={totalCertificates}
                listConf={devicesTableColumns}
                listRender={{
                    renderFunc: certRender,
                    enableRowExpand: false
                }}
                isLoading={requestStatus.isLoading}
                emptyContentComponent={
                    <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "100%" }}>

                    </Grid>
                }
                config={tableConfig}
                onChange={(ev) => {
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
            <Modal
                title={"Revoke Certificate"}
                subtitle={""}
                isOpen={isRevokeDialogOpen.isOpen}
                onClose={function (): void {
                    setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" });
                }}
                content={(
                    <Grid container flexDirection={"column"} spacing={4} width={"1500px"}>
                        <Grid item>
                            <TextField label="Certificate Serial Number" value={isRevokeDialogOpen.serialNumber} disabled />
                        </Grid>
                        <Grid item container flexDirection={"column"} spacing={2}>
                            <Grid item>
                                <Select label="Select Revocation Reason" value={revokeReason} onChange={(ev: any) => setRevokeReason(ev.target.value!)}>
                                    {
                                        Object.values(RevocationReason).map((rCode, idx) => (
                                            <MenuItem key={idx} value={rCode} >
                                                <Grid container spacing={2}>
                                                    <Grid item xs={2}>
                                                        <Typography>{rCode}</Typography>
                                                    </Grid>
                                                    <Grid item xs="auto">
                                                        <Typography fontSize={"12px"}>{getRevocationReasonDescription(rCode)}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
                actions={
                    <Box>
                        <Button onClick={() => { setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" }); }}>Close</Button>
                        <MonoChromaticButton onClick={async () => {
                            apicalls.cas.updateCertificateStatus(isRevokeDialogOpen.serialNumber, CertificateStatus.Revoked, revokeReason);
                            setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" });
                        }}>Revoke Certificate</MonoChromaticButton>
                    </Box>
                }
            />
        </Box>
    );
};
