import { Box, IconButton, Paper, Tooltip, Typography, lighten, useTheme } from "@mui/material";
import { Certificate, CertificateAuthority, CertificateStatus } from "ducks/features/cas/models";
import { FetchHandle, TableFetchViewer } from "components/TableFetcherView";
import { GridColDef, GridFilterItem } from "@mui/x-data-grid";
import { ListResponse } from "ducks/services/api-client";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { Ref, useImperativeHandle, useState } from "react";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import apicalls from "ducks/apicalls";
import moment from "moment";
import { ShowCertificateModal } from "./Modals/ShowCertificate";
import { RevokeCertificateModal } from "./Modals/RevokeCertificate";
import { GrValidate } from "react-icons/gr";
import { OCSPCertificateVerificationModal } from "./Modals/OCSPCertificate";

interface Props {
    withActions?: boolean
    filter?: GridFilterItem | undefined;
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
    const [ocspDialog, setOcspDialog] = useState<Certificate | undefined>(undefined);
    const [revokeDialog, setRevokeDialog] = useState<Certificate | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        refresh () {
            tableRef.current?.refresh();
        }
    }));

    const cols: GridColDef<CertificateWithCA>[] = [
        {
            field: "serial_number",
            headerName: "Serial Number",
            minWidth: 150,
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
                return <Label color={row.status === CertificateStatus.Active ? ["#ffffff", "#008000"] : (row.status === CertificateStatus.Revoked ? "error" : "grey")}>{row.status}</Label>;
            }
        },
        { field: "subject.common_name", valueGetter: (value, row) => { return row.subject.common_name; }, headerName: "Common Name", width: 150, flex: 0.2 },
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
            width: 150,
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
                            false && (
                                <Grid xs="auto">
                                    <Tooltip title="OCSP">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                            <IconButton onClick={() => {
                                                setOcspDialog(row);
                                            }}>
                                                <GrValidate color={theme.palette.primary.main} fontSize={"18px"} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            )
                        }
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
                                                    apicalls.cas.updateCertificateStatus(row.serial_number, CertificateStatus.Active, "");
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

    return (
        <>
            <TableFetchViewer
                columns={cols}
                fetcher={async (params, controller) => {
                    // if (props.query && props.query.field && props.query.value) {
                    // check if params has filter
                    // if (params.filters) {
                    //     const queryIdx = params.filters.findIndex((f) => f.startsWith(props.query!.field!));
                    //     const filter = `${props.query.field}[${props.query.operator}]${props.query.value}`;
                    //     if (queryIdx !== -1) {
                    //         params.filters[queryIdx] = filter;
                    //     } else {
                    //         params.filters.push(filter);
                    //     }
                    // }
                    // }

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

                filter={!props.query || (props.query && props.query?.value === "") ? props.filter : { ...props.query, id: "query" }}
                id={(item) => item.serial_number}
                sortField={{ field: "valid_from", sort: "desc" }}
                ref={tableRef}
                density="compact"
            />
            {
                ocspDialog && (
                    <OCSPCertificateVerificationModal certificate={ocspDialog!} onClose={() => {
                        setOcspDialog(undefined);
                    }} open={true} />
                )
            }
            {
                showDialog && (
                    <ShowCertificateModal certificate={showDialog!} onClose={() => {
                        setShowDialog(undefined);
                    }} open={true} />
                )
            }
            {
                revokeDialog && (
                    <RevokeCertificateModal certificate={revokeDialog!} onClose={() => {
                        setRevokeDialog(undefined);
                    }} open={true} onRevoke={() => {
                        tableRef.current?.refresh();
                    }} />
                )
            }
        </>
    );
});

Table.displayName = "CertTable";
export { Table as CertificatesTable };

// export const ProbesTable = React.forwardRef<Props>(Table) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
