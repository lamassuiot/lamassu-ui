import { Box, Button, IconButton, MenuItem, Paper, Tooltip, Typography, lighten, useTheme } from "@mui/material";
import { Certificate, CertificateAuthority, CertificateStatus, RevocationReason, getRevocationReasonDescription } from "ducks/features/cas/models";
import { CodeCopier } from "components/CodeCopier";
import { FetchHandle, TableFetchViewer } from "components/TableFetcherView";
import { GridColDef, GridFilterItem } from "@mui/x-data-grid";
import { ListResponse } from "ducks/services/api-client";
import { Modal } from "components/Modal";
import { MultiKeyValueInput } from "components/forms/MultiKeyValue";
import { Select } from "components/Select";
import { TextField } from "components/TextField";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { Ref, useEffect, useImperativeHandle, useState } from "react";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import apicalls from "ducks/apicalls";
import deepEqual from "fast-deep-equal/es6";
import moment from "moment";

interface Props {
    withActions?: boolean
    query?: { field: string, value: string, operator: string }
    ref?: Ref<FetchHandle>
    caID?: string
}

type CertificateWithCA = Certificate & { ca: CertificateAuthority | undefined }; // Imported certificates may not belong to any CA

const Table = React.forwardRef((props: Props, ref: Ref<FetchHandle>) => {
    const tableRef = React.useRef<FetchHandle>(null);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const theme = useTheme();

    const [showDialog, setShowDialog] = useState<Certificate | undefined>(undefined);
    const [revokeDialog, setRevokeDialog] = useState<Certificate | undefined>(undefined);
    const [revokeReason, setRevokeReason] = useState("Unspecified");

    useEffect(() => {
        tableRef.current?.refresh();
    }, [props.query]);

    useImperativeHandle(ref, () => ({
        refresh () {
            tableRef.current?.refresh();
        }
    }));

    const cols: GridColDef<CertificateWithCA>[] = [
        {
            field: "serial_number",
            headerName: "Serial Number",
            minWidth: 250,
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
        { field: "cn", valueGetter: (value, row) => { return row.subject.common_name; }, headerName: "Common Name", width: 150, flex: 0.2 },
        {
            field: "key",
            valueGetter: (value, row) => { return row.key_metadata.strength; },
            headerName: "Key",
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: ({ value, row, id }) => {
                return <Label color={"grey"}>{`${row.key_metadata.type} ${row.key_metadata.bits}`}</Label>;
            }
        },
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
                            <Tooltip title="Show Certificate">
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                    <IconButton onClick={() => {
                                        setShowDialog(row);
                                    }}>
                                        <VisibilityIcon sx={{ color: theme.palette.primary.main }} fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                        </Grid>
                        {
                            row.status !== CertificateStatus.Revoked && (
                                <Grid xs="auto">
                                    <Tooltip title="Revoke Certificate">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                            <IconButton onClick={() => {
                                                setRevokeDialog(row);
                                            }}>
                                                <DeleteIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            )
                        }
                        {
                            row.status === CertificateStatus.Revoked && row.revocation_reason === "CertificateHold" && (
                                <Grid xs="auto">
                                    <Tooltip title="ReActivate certificate">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                            <IconButton onClick={() => {
                                                try {
                                                    apicalls.cas.updateCertificateStatus(row.serial_number, CertificateStatus.Active, revokeReason);
                                                    tableRef.current?.refresh();
                                                    enqueueSnackbar(`Certificate with Serial Number ${row.serial_number} and CN ${row.subject.common_name} reactivated`, { variant: "success" });
                                                } catch (err) {
                                                    enqueueSnackbar(`Error while reactivating Certificate with Serial Number ${row.serial_number} and CN ${row.subject.common_name}: ${err}`, { variant: "error" });
                                                }
                                            }}>
                                                <UnarchiveOutlinedIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>
                                </Grid>

                            )
                        }
                    </Grid>
                );
            }
        }
    ];

    // remove caid col if caID is set
    if (props.caID) {
        cols.splice(cols.findIndex(col => col.field === "caid"), 1);
    }

    let filter: GridFilterItem[] | undefined;
    if (props.query && props.query.field && props.query.value) {
        filter = [{ field: props.query.field, operator: "contains", value: props.query.value, id: "query-input" }];
    }

    return (
        <>
            <TableFetchViewer
                columns={cols}
                fetcher={async (params, controller) => {
                    if (props.query && props.query.field && props.query.value) {
                        // check if params has filter
                        if (params.filters) {
                            const queryIdx = params.filters.findIndex((f) => f.startsWith(props.query!.field!));
                            const filter = `${props.query.field}[${props.query.operator}]${props.query.value}`;
                            if (queryIdx !== -1) {
                                params.filters[queryIdx] = filter;
                            } else {
                                params.filters.push(filter);
                            }
                        }
                    }

                    let certsList: ListResponse<Certificate>;

                    if (props.caID !== undefined && props.caID !== "") {
                        certsList = await apicalls.cas.getIssuedCertificatesByCA(props.caID, params);
                    } else {
                        certsList = await apicalls.cas.getCertificates(params);
                    }

                    const uniqueCAIDs = Array.from(new Set(certsList.list.map((cert) => cert.issuer_metadata.id)));
                    const casPromises: Promise<CertificateAuthority>[] = uniqueCAIDs.map((caID) => {
                        return apicalls.cas.getCA(caID);
                    });

                    let cas: CertificateAuthority[] = [];
                    try {
                        cas = await Promise.all(casPromises);
                    } catch (err) {
                        console.log("Error while fetching CAs: ", err);
                    }

                    return new Promise<ListResponse<CertificateWithCA>>(resolve => {
                        resolve({
                            list: certsList.list.map((cert) => {
                                const ca = cas.find((ca) => ca.id === cert.issuer_metadata.id);
                                return { ...cert, ca };
                            }),
                            next: certsList.next
                        });
                    });
                }}
                id={(item) => item.serial_number}
                sortField={{ field: "valid_from", sort: "desc" }}
                ref={tableRef}
                density="compact"
            />
            <Modal
                title={`Certificate ${showDialog?.serial_number}`}
                subtitle=""
                isOpen={showDialog !== undefined}
                maxWidth={false}
                onClose={() => { setShowDialog(undefined); }}
                actions={
                    <Box>
                        <Button onClick={() => { setShowDialog(undefined); }}>Close</Button>
                    </Box>
                }
                content={
                    showDialog
                        ? (
                            <Grid container spacing={4} width={"100%"}>
                                <Grid xs="auto">
                                    <CodeCopier code={window.window.atob(showDialog!.certificate)} enableDownload downloadFileName={showDialog!.issuer_metadata.id + "_" + showDialog!.serial_number + ".crt"} />
                                </Grid>
                                <Grid xs container flexDirection={"column"}>
                                    <MultiKeyValueInput label="Metadata" value={showDialog!.metadata} onChange={(meta) => {
                                        if (!deepEqual(showDialog!.metadata, meta)) {
                                            apicalls.cas.updateCertificateMetadata(showDialog!.serial_number, meta);
                                        }
                                    }} />
                                </Grid>
                            </Grid>
                        )
                        : (
                            <></>
                        )
                }
            />
            <Modal
                title={"Revoke Certificate"}
                subtitle={""}
                isOpen={revokeDialog !== undefined}
                onClose={function (): void {
                    setRevokeDialog(undefined);
                }}
                maxWidth={"md"}
                content={
                    revokeDialog
                        ? (
                            <Grid container flexDirection={"column"} spacing={4}>
                                <Grid container flexDirection={"column"} spacing={2}>
                                    <Grid>
                                        <TextField label="Certificate Common Name" value={revokeDialog!.serial_number} disabled />
                                    </Grid>
                                    <Grid>
                                        <TextField label="Certificate Common Name" value={revokeDialog!.subject.common_name} disabled />
                                    </Grid>
                                </Grid>
                                <Grid container flexDirection={"column"} spacing={2}>
                                    <Grid>
                                        <Select label="Select Revocation Reason" value={revokeReason} onChange={(ev: any) => setRevokeReason(ev.target.value!)}>
                                            {
                                                Object.values(RevocationReason).map((rCode, idx) => (
                                                    <MenuItem key={idx} value={rCode} >
                                                        <Grid container spacing={1}>
                                                            <Grid xs={12}>
                                                                <Typography variant="body1" fontWeight={"bold"}>{rCode}</Typography>
                                                            </Grid>
                                                            <Grid xs={12}>
                                                                <Typography variant="body2">{getRevocationReasonDescription(rCode)}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )
                        : (
                            <></>
                        )
                }
                actions={
                    <Box>
                        <Button variant="text" onClick={() => { setRevokeDialog(undefined); }}>Close</Button>
                        <Button variant="contained" onClick={async () => {
                            try {
                                await apicalls.cas.updateCertificateStatus(revokeDialog!.serial_number, CertificateStatus.Revoked, revokeReason);
                                tableRef.current?.refresh();
                                enqueueSnackbar(`Certificate with Serial Number ${revokeDialog?.serial_number} and CN ${revokeDialog?.subject.common_name} revoked`, { variant: "success" });
                                setRevokeDialog(undefined);
                            } catch (err) {
                                enqueueSnackbar(`Error while revoking Certificate with Serial Number ${revokeDialog?.serial_number} and CN ${revokeDialog?.subject.common_name}: ${err}`, { variant: "error" });
                            }
                        }}>Revoke Certificate</Button>
                    </Box >
                }
            />
        </>
    );
});

Table.displayName = "CertTable";
export { Table as CertificatesTable };

// export const ProbesTable = React.forwardRef<Props>(Table) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
