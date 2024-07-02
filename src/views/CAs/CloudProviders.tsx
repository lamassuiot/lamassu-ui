export const CloudProviders = () => {
    return <></>;
};

// import React, { useState } from "react";

// import { Box, Button, IconButton, Paper, Typography, lighten, useTheme } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import AddIcon from "@mui/icons-material/Add";
// import { Label } from "@mui/icons-material";
// import apicalls from "ducks/apicalls";
// import { CertificateAuthority } from "ducks/features/cas/models";
// import Grid from "@mui/material/Unstable_Grid2";
// import { Modal } from "./Modal";
// import { TableFetchViewer } from "components/TableFetcherView";
// import { GridColDef } from "@mui/x-data-grid";
// import { GridValidRowModel } from "@mui/x-data-grid";

// interface Props {
//     caData: CertificateAuthority
// }

// export const CloudProviders: React.FC<Props> = ({ caData }) => {
//     const theme = useTheme();
//     const navigate = useNavigate();

//     const [isEnableConnectorOpen, setIsEnableConnectorOpen] = useState({ isOpen: false, connectorId: "" });
//     const caMeta = caData.metadata;

//     const cloudConnectorIDs: string[] = window._env_.CLOUD_CONNECTORS;

//     const isCloudConnectorEnabled = (cloudConnector: string) => {
//         let enabled = false;
//         const enabledKey = `lamassu.io/iot/${cloudConnector}`;
//         if (enabledKey in caMeta && caMeta[enabledKey].register === true) {
//             enabled = true;
//         }

//         return enabled;
//     };

//     const cloudConnectorsRender = (cloudConnector: string) => {
//         let enabled = false;
//         const enabledKey = `lamassu.io/iot/${cloudConnector}`;
//         if (enabledKey in caMeta && caMeta[enabledKey].register === true) {
//             enabled = true;
//         }

//         return {
//             connectorId: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>{cloudConnector}</Typography>,
//             connectorIcon: (
//                 <img src={process.env.PUBLIC_URL + "/assets/" + logo} height={"40px"} />
//             ),
//             syncStatus: (
//                 <Label color={enabled ? "success" : "warning"}>{enabled ? "Registered" : "Not Registered"}</Label>
//             ),
//             actions: (
//                 <>
//                     {
//                         !enabled && (
//                             <Box>
//                                 <Grid container spacing={1}>
//                                     <Grid>
//                                         <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.default, width: 35, height: 35 }}>
//                                             <IconButton onClick={(ev) => { ev.stopPropagation(); setIsEnableConnectorOpen({ isOpen: true, connectorId: cloudConnector }); }} >
//                                                 <AddIcon fontSize={"small"} />
//                                             </IconButton>
//                                         </Box>
//                                     </Grid>
//                                 </Grid>
//                             </Box>
//                         )
//                     }
//                 </>
//             ),
//             expandedRowElement: (
//                 enabled && (
//                     <Box sx={{ width: "calc(100% - 65px)", borderLeft: `4px solid ${theme.palette.primary.main}`, background: lighten(theme.palette.background.paper, 0.03), marginLeft: "20px", padding: "20px 20px 0 20px", marginBottom: "20px" }}>
//                         <Grid container flexDirection={"column"} spacing={1}>
//                             {
//                                 Object.keys(caMeta[enabledKey]).map((key, idx) => {
//                                     return (
//                                         <Grid key={idx} container>
//                                             <Grid xs={1}>
//                                                 <Label>{key}</Label>
//                                             </Grid>
//                                             <Grid xs>
//                                                 <Label>{caMeta[enabledKey][key]}</Label>
//                                             </Grid>
//                                         </Grid>
//                                     );
//                                 })
//                             }
//                         </Grid>
//                     </Box>
//                 )
//             )
//         };
//     };

//     const cols: GridColDef<string>[] = [
//         {
//             field: "icon",
//             headerName: "",
//             minWidth: 250,
//             flex: 0.3
//             renderCell: ({ value, row, id }) => {
//                 return
//             }
//         },
//         {
//             field: "status",
//             headerName: "Status",
//             headerAlign: "center",
//             align: "center",
//             minWidth: 100,
//             renderCell: ({ value, row, id }) => {
//                 return <Label color={row.status === CertificateStatus.Active ? "success" : (row.status === CertificateStatus.Revoked ? "error" : "grey")}>{row.status}</Label>;
//             }
//         },
//         { field: "cn", valueGetter: (value, row) => { return row.subject.common_name; }, headerName: "Common Name", minWidth: 250, flex: 0.2 },
//         {
//             field: "key",
//             valueGetter: (value, row) => { return row.key_metadata.strength; },
//             headerName: "Key",
//             minWidth: 175,
//             sortable: false,
//             filterable: false,
//             renderCell: ({ value, row, id }) => {
//                 return <Label color={"grey"}>{`${row.key_metadata.type} ${row.key_metadata.bits} - ${row.key_metadata.strength}`}</Label>;
//             }
//         },
//         {
//             field: "caid",
//             headerName: "CA",
//             minWidth: 50,
//             sortable: false,
//             filterable: false
//         },
//         {
//             field: "valid_from",
//             headerName: "Valid From",
//             headerAlign: "center",
//             minWidth: 110,
//             renderCell: ({ value, row, id }) => {
//                 return <Grid container flexDirection={"column"}>
//                     <Grid xs><Typography variant="body2" textAlign={"center"}>{moment(row.valid_from).format("DD/MM/YYYY HH:mm")}</Typography></Grid>
//                     <Grid xs><Typography variant="caption" textAlign={"center"} textTransform={"none"} component={"div"}>{moment.duration(moment(row.valid_from).diff(moment())).humanize(true)}</Typography></Grid>
//                 </Grid>;
//             }
//         },
//         {
//             field: "valid_to",
//             headerName: "Valid To",
//             headerAlign: "center",
//             minWidth: 110,
//             renderCell: ({ value, row, id }) => {
//                 return <Grid container flexDirection={"column"}>
//                     <Grid xs><Typography variant="body2" textAlign={"center"}>{moment(row.valid_to).format("DD/MM/YYYY HH:mm")}</Typography></Grid>
//                     <Grid xs><Typography variant="caption" textAlign={"center"} textTransform={"none"} component={"div"}>{moment.duration(moment(row.valid_to).diff(moment())).humanize(true)}</Typography></Grid>
//                 </Grid>;
//             }
//         },
//         {
//             field: "lifespan",
//             headerName: "Lifespan",
//             minWidth: 50,
//             sortable: false,
//             filterable: false,
//             headerAlign: "center",
//             align: "center",
//             renderCell: ({ value, row, id }) => {
//                 return <Label color="grey">
//                     {moment.duration(moment(row.valid_to).diff(row.valid_from)).humanize()}
//                 </Label>;
//             }
//         },
//         {
//             field: "actions",
//             type: "actions",
//             headerName: "Actions",
//             headerAlign: "center",
//             width: 100,
//             cellClassName: "actions",
//             renderCell: () => {
//                 return (
//                     <Grid container spacing={1}>
//                         <Grid xs="auto">
//                             <Tooltip title="Show Certificate">
//                                 <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
//                                     <IconButton onClick={() => { }}>
//                                         <VisibilityIcon sx={{ color: theme.palette.primary.main }} fontSize={"small"} />
//                                     </IconButton>
//                                 </Box>
//                             </Tooltip>
//                         </Grid>
//                         <Grid xs="auto">
//                             <Tooltip title="Revoke Certificate">
//                                 <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
//                                     <IconButton>
//                                         <DeleteIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} onClick={() => { }} />
//                                     </IconButton>
//                                 </Box>
//                             </Tooltip>
//                         </Grid>
//                     </Grid>
//                 );
//             }
//         }
//     ];

//     return (
//         <>
//             <TableFetchViewer
//                 columns={cols}
//                 fetcher={(params, controller) => {
//                     return apicalls.cas.getCertificates(params);
//                 }}
//                 queryFilter={filter}
//                 id={(item) => item.serial_number}
//                 ref={tableRef}
//                 density="compact"
//             />

//             {
//                 isEnableConnectorOpen.isOpen && (
//                     <Modal
//                         isOpen={true}
//                         onClose={() => setIsEnableConnectorOpen({ connectorId: "", isOpen: false })}
//                         content={
//                             <Grid container flexDirection={"column"} spacing={2}>
//                                 <Grid>
//                                     You are about to enable the synchronization between this connector and the selected CA. Please, confirm your action.
//                                 </Grid>
//                                 <Grid container flexDirection={"column"} spacing={1}>
//                                     <Grid>
//                                         <Typography variant="button">Connector ID: </Typography>
//                                         <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{isEnableConnectorOpen.connectorId}</Typography>
//                                     </Grid>

//                                     <Grid>
//                                         <Typography variant="button">CA ID: </Typography>
//                                         <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{caData.id}</Typography>
//                                     </Grid>
//                                 </Grid>
//                             </Grid>
//                         }
//                         subtitle=""
//                         title="Register CA in Cloud Provider"
//                         actions={
//                             <Grid container justifyContent={"flex-end"}>
//                                 <Grid>
//                                     <Button onClick={() => setIsEnableConnectorOpen({ connectorId: "", isOpen: false })}>Close</Button>
//                                 </Grid>
//                                 <Grid>
//                                     <Button variant="contained" onClick={async () => {
//                                         const newMeta = caMeta;
//                                         newMeta[`lamassu.io/iot/${isEnableConnectorOpen.connectorId}`] = {
//                                             register: true
//                                         };
//                                         await apicalls.cas.updateCAMetadata(caData.id, newMeta);
//                                         setIsEnableConnectorOpen({ connectorId: "", isOpen: false });
//                                     }
//                                     }>Register</Button>
//                                 </Grid>
//                             </Grid>
//                         }
//                     />
//                 )
//             }
//         </>
//     );
// };
