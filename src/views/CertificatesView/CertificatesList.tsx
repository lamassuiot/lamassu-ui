import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ListWithDataController, ListWithDataControllerConfigProps } from "components/LamassuComponents/Table";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import deepEqual from "fast-deep-equal/es6";
import { selectors } from "ducks/reducers";
import { actions } from "ducks/actions";
import { Certificate, CertificateStatus, certificateFilters } from "ducks/features/cav3/models";
import { LamassuChip } from "components/LamassuComponents/Chip";
import moment from "moment";

export const CertificateListView = () => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => selectors.certs.getStatus(state));
    const certList = useAppSelector((state) => selectors.certs.getCerts(state));
    const totalCertificates = -1;

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
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{cert.subject.common_name}</Typography>
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
                <></>
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
                    console.log(ev);
                    if (!deepEqual(ev, tableConfig)) {
                        console.log(ev);
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
        </Box>
    );
};
