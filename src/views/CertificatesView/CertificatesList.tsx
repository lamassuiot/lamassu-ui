import React, { useEffect, useState } from "react";
import { Box, Button, Grid, MenuItem, Paper, Typography, useTheme } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListWithDataControllerConfigProps } from "components/LamassuComponents/Table";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { selectors } from "ducks/reducers";
import { actions } from "ducks/actions";
import { Certificate, CertificateStatus, RevocationReason, certificateFilters, getRevocationReasonDescription } from "ducks/features/cav3/models";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { apicalls } from "ducks/apicalls";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { Select } from "components/LamassuComponents/dui/Select";
import { Filter } from "components/FilterInput";
// import { Certificate24Regular } from `@fluentui/react-icons`;

import {
    DataGridBody,
    DataGridRow,
    DataGrid,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridCell,
    TableColumnDefinition,
    createTableColumn,
    TableCellLayout,
    Caption2,
    Text
} from "@fluentui/react-components";
import { CertificateRegular } from "@fluentui/react-icons";

export const CertificateListView = () => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;
    const [searchParams, _] = useSearchParams();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => selectors.certs.getStatus(state));
    const certList = useAppSelector((state) => selectors.certs.getCerts(state));
    const totalCertificates = -1;

    const [showCertificate, setShowCertificate] = useState<string | undefined>(undefined);
    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState({ isOpen: false, serialNumber: "" });
    const [revokeReason, setRevokeReason] = useState("Unspecified");

    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(() => {
        const urlFilters = searchParams.getAll("filter");
        const filters: Filter[] = [];

        urlFilters.forEach(f => {
            // check filter syntax
            if (f.includes("[") && f.includes("]")) {
                const propName = f.substring(0, f.indexOf("["));
                const op = f.substring(f.indexOf("[") + 1, f.indexOf("]"));
                const val = f.substring(f.indexOf("]") + 1, f.length);
                if (propName !== "" && op !== "" && val !== "") {
                    const field = certificateFilters.find(field => field.key === propName);
                    if (field) {
                        filters.push({
                            propertyField: field,
                            propertyOperator: op,
                            propertyValue: val
                        });
                    }
                }
            }
        });

        return {
            filters: {
                activeFilters: filters,
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
        };
    });

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

    // const devicesTableColumns = [
    //     { key: "serial", title: "Serial Number", query: "serial_number", sortFieldKey: "serial_number", align: "start", size: 4 },
    //     { key: "status", title: "Status", sortFieldKey: "status", align: "center", size: 1 },
    //     { key: "cn", title: "Common Name", align: "center", size: 2 },
    //     { key: "key", title: "Key", align: "center", size: 2 },
    //     { key: "caid", title: "CA ID", align: "center", size: 3 },
    //     { key: "valid_to", title: "Valid From", sortFieldKey: "valid_to", align: "center", size: 2 },
    //     { key: "valid_from", title: "Valid To", sortFieldKey: "valid_from", align: "center", size: 2 },
    //     { key: "lifespan", title: "Lifespan", align: "center", size: 1 },
    //     { key: "revocation", title: "Revocation", align: "center", sortFieldKey: "revocation_timestamp", size: 2 },
    //     { key: "actions", title: "", align: "end", size: 2 }
    // ];

    // const certRender = (cert: Certificate) => {
    //     return {
    //         serial: (
    //             <Typography style={{ fontWeight: "700", fontSize: 14, color: theme.palette.text.primary }}>{
    //                 cert.serial_number}
    //             </Typography>
    //         ),
    //         cn: (
    //             <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, wordBreak: "break-word" }}>{cert.subject.common_name}</Typography>
    //         ),
    //         caid: (
    //             <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{cert.issuer_metadata.id}</Typography>
    //         ),
    //         key: (
    //             <LamassuChip style={{ textAlign: "center" }} label={`${cert.key_metadata.type} ${cert.key_metadata.bits} - ${cert.key_metadata.strength}`} />
    //         ),
    //         status: (
    //             <LamassuChip label={cert.status} color={
    //                 cert.status === CertificateStatus.Active ? "green" : "red"
    //             } />
    //         ),
    //         valid_to: (
    //             <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{moment(cert.valid_from).format("DD-MM-YYYY HH:mm")}</Typography>
    //         ),
    //         valid_from: (
    //             <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
    //                 <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
    //                     <div>
    //                         {moment(cert.valid_to).format("DD-MM-YYYY HH:mm")}
    //                     </div>
    //                     <div>
    //                         {moment.duration(moment(cert.valid_to).diff(moment())).humanize(true)}
    //                     </div>
    //                 </div>
    //             </Typography>
    //         ),
    //         lifespan: (
    //             <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{
    //                 moment.duration(moment(cert.valid_to).diff(moment(cert.valid_from))).humanize(false)
    //             }</Typography>
    //         ),
    //         revocation: (
    //             <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
    //                 {
    //                     cert.status === CertificateStatus.Revoked
    //                         ? (
    //                             <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
    //                                 <div>
    //                                     {moment(cert.revocation_timestamp).format("DD-MM-YYYY HH:mm")}
    //                                 </div>
    //                                 <div>
    //                                     {moment.duration(moment(cert.revocation_timestamp).diff(moment())).humanize(true)}
    //                                 </div>
    //                                 <div>
    //                                     <LamassuChip compact label={cert.revocation_reason} />
    //                                 </div>
    //                             </div>
    //                         )
    //                         : (
    //                             <>
    //                                 {"-"}
    //                             </>
    //                         )
    //                 }
    //             </Typography>
    //         ),
    //         actions: (
    //             <Box>
    //                 <Grid container spacing={1}>
    //                     <Grid item>
    //                         <Tooltip title="Show Certificate">
    //                             <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
    //                                 <IconButton onClick={() => { setShowCertificate(cert.serial_number); }}>
    //                                     <VisibilityIcon fontSize={"small"} />
    //                                 </IconButton>
    //                             </Box>
    //                         </Tooltip>
    //                         <Modal
    //                             title={`Certificate ${cert.serial_number}`}
    //                             subtitle=""
    //                             isOpen={showCertificate === cert.serial_number}
    //                             maxWidth={false}
    //                             onClose={() => { setShowCertificate(undefined); }}
    //                             actions={
    //                                 <Box>
    //                                     <Button onClick={() => { setShowCertificate(undefined); }}>Close</Button>
    //                                 </Box>
    //                             }
    //                             content={
    //                                 <Grid container spacing={4} width={"100%"}>
    //                                     <Grid item xs="auto">
    //                                         <CodeCopier code={window.window.atob(cert.certificate)} enableDownload downloadFileName={cert.issuer_metadata.id + "_" + cert.serial_number + ".crt"} />
    //                                     </Grid>
    //                                     <Grid item xs container flexDirection={"column"}>
    //                                         <MultiKeyValueInput label="Metadata" value={cert.metadata} onChange={(meta) => {
    //                                             if (!deepEqual(cert.metadata, meta)) {
    //                                                 apicalls.cas.updateCertificateMetadata(cert.serial_number, meta);
    //                                             }
    //                                         }} />
    //                                     </Grid>
    //                                 </Grid>
    //                             }
    //                         />
    //                     </Grid>
    //                     {
    //                         cert.status !== CertificateStatus.Revoked && (
    //                             <Grid item>
    //                                 <Tooltip title="Revoke Certificate">
    //                                     <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
    //                                         <IconButton>
    //                                             <DeleteIcon fontSize={"small"} onClick={() => { setIsRevokeDialogOpen({ isOpen: true, serialNumber: cert.serial_number }); }} />
    //                                         </IconButton>
    //                                     </Box>
    //                                 </Tooltip>
    //                             </Grid>
    //                         )
    //                     }
    //                     {
    //                         cert.status === CertificateStatus.Revoked && (
    //                             cert.revocation_reason === "CertificateHold" && (
    //                                 <Grid item>
    //                                     <Tooltip title="ReActivate certificate">
    //                                         <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
    //                                             <IconButton>
    //                                                 <UnarchiveOutlinedIcon fontSize={"small"} onClick={() => {
    //                                                     apicalls.cas.updateCertificateStatus(cert.serial_number, CertificateStatus.Active);
    //                                                 }} />
    //                                             </IconButton>
    //                                         </Box>
    //                                     </Tooltip>
    //                                 </Grid>
    //                             )
    //                         )
    //                     }
    //                 </Grid>
    //             </Box >
    //         )
    //     };
    // };

    const columns: TableColumnDefinition<Certificate>[] = [
        createTableColumn<Certificate>({
            columnId: "serial",
            compare: (a, b) => {
                return a.serial_number.localeCompare(b.serial_number);
            },
            renderHeaderCell: () => {
                return "Serial Number";
            },
            renderCell: (item) => {
                return (
                    // <>
                    //     <Text block={true}>{item.subject.common_name}</Text>
                    //     <Caption2>{item.serial_number}</Caption2>
                    // </>
                    <TableCellLayout media={<CertificateRegular />}>
                        <Text block={true}>{item.subject.common_name}</Text>
                        <Caption2>{item.serial_number}</Caption2>
                    </TableCellLayout>
                );
            }
        })

    ];

    return (
        <Box sx={{ padding: "20px", height: "calc(100% - 40px)" }}>
            <Box padding={"20px"} component={Paper}>
                <DataGrid
                    items={certList}
                    columns={columns}
                    sortable
                    selectionMode="multiselect"
                    getRowId={(item) => item.serial_number}
                    focusMode="composite"
                >
                    <DataGridHeader>
                        <DataGridRow
                            selectionCell={{
                                checkboxIndicator: { "aria-label": "Select all rows" }
                            }}
                        >
                            {({ renderHeaderCell }) => (
                                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                            )}
                        </DataGridRow>
                    </DataGridHeader>
                    <DataGridBody<Certificate>>
                        {({ item, rowId }) => (
                            <DataGridRow<Certificate>
                                key={rowId}
                                selectionCell={{
                                    checkboxIndicator: { "aria-label": "Select row" }
                                }}
                            >
                                {({ renderCell }) => (
                                    <DataGridCell>{renderCell(item)}</DataGridCell>
                                )}
                            </DataGridRow>
                        )}
                    </DataGridBody>
                </DataGrid>
            </Box>
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
