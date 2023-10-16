import { Box, useTheme } from "@mui/system";
import React, { useEffect, useState } from "react";
import * as caActions from "ducks/features/cav3/actions";
import * as caSelector from "ducks/features/cav3/reducer";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { Outlet, useNavigate } from "react-router-dom";
import { Grid, IconButton, InputBase, Paper, Slide, Skeleton } from "@mui/material";
import { CertificateCard } from "views/CertificateAuthoritiesView/components/CertificateCard";
import { AiOutlineSearch } from "react-icons/ai";
import AddIcon from "@mui/icons-material/Add";
import { CertificateAuthority, CryptoEngine, List } from "ducks/features/cav3/apicalls";
import RefreshIcon from "@mui/icons-material/Refresh";
import { FieldType, Filter, Filters } from "components/FilterInput";

interface Props {
    preSelectedCaName?: string
    engines: CryptoEngine[]
}

interface CAsEngines {
    cas: List<CertificateAuthority>
    engines: CryptoEngine[]
}

export const CAListView: React.FC<Props> = ({ preSelectedCaName, engines }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => caSelector.getCAListRequestStatus(state));
    const caList = useAppSelector((state) => caSelector.getCAs(state));

    const [selectedCa, setSelectedCa] = useState(preSelectedCaName);
    const [isMainModalOpen, setIsMainModalOpen] = useState(true);

    const [filters, setFilters] = useState<Filter[]>([]);
    const containerRef = React.useRef(null);

    const refreshAction = () => {
        dispatch(caActions.getCAs.request({
            filters: filters.map(filter => { return `${filter.propertyField.key}[${filter.propertyOperator}]${filter.propertyValue}`; }),
            limit: 25,
            sortField: "id",
            sortMode: "asc",
            bookmark: ""
        }));
    };

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        refreshAction();
    }, [filters]);

    useEffect(() => {
        setSelectedCa(preSelectedCaName);
    }, [preSelectedCaName]);

    const filterCAs = (name: string) => {
        const filterQuery = [];
        if (name !== "") {
            filterQuery.push("id[contains]=" + name);
        }
        refreshAction();
    };

    return (
        <Grid container style={{ height: "100%" }}>
            <Grid item xs={12} xl={3} md={4} container direction="column" style={{ background: theme.palette.background.lightContrast, width: "100%" }}>
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box sx={{ padding: "20px" }}>
                        <Grid item xs={12} container flexDirection={"column"}>
                            <Grid item container>
                                <Grid item xs>
                                    <Box component={Paper} sx={{ padding: "5px", height: 30, display: "flex", alignItems: "center", width: "calc( 100% - 10px)" }}>
                                        <AiOutlineSearch size={20} color={theme.palette.text.primary} style={{ marginLeft: 10, marginRight: 10 }} />
                                        <InputBase onChange={(ev) => filterCAs(ev.target.value)} fullWidth style={{ color: theme.palette.text.primary, fontSize: 14 }} placeholder="CA ID" />
                                    </Box>
                                </Grid>
                                <Grid item xs={"auto"} container justifyContent={"flex-end"}>
                                    <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40, marginLeft: 10 }}>
                                        <IconButton style={{ background: theme.palette.primary.light }} onClick={() => { refreshAction(); }}>
                                            <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                        </IconButton>
                                    </Box>
                                </Grid>
                                <Grid item xs={"auto"} container justifyContent={"flex-end"}>
                                    <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40, marginLeft: 10 }}>
                                        <IconButton style={{ background: theme.palette.primary.light }} onClick={() => { setIsMainModalOpen(true); navigate("create"); }}>
                                            <AddIcon style={{ color: theme.palette.primary.main }} />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} style={{ paddingTop: "10px" }} container alignItems={"center"}>
                                <Filters fields={[
                                    { key: "id", label: "CA ID", type: FieldType.String },
                                    { key: "status", label: "Status", type: FieldType.Enum, fieldOptions: ["ACTIVE", "EXPIRED", "REVOKED"] },
                                    { key: "valid_to", label: "Expires At", type: FieldType.Date },
                                    { key: "valid_from", label: "Valid From", type: FieldType.Date }
                                ]} onChange={(filters) => setFilters([...filters])} />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box style={{ padding: "10px 20px 20px 20px", overflowY: "auto", height: 300, flexGrow: 1 }}>
                        {
                            requestStatus.isLoading
                                ? (
                                    <Box padding={"30px"}>
                                        <Skeleton variant="rectangular" width={"100%"} height={75} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                    </Box>
                                )
                                : (
                                    <Grid container spacing={"20px"} flexDirection={"column"}>
                                        {
                                            caList.map((caItem) => (
                                                <Grid item key={caItem.id}>
                                                    <CertificateCard
                                                        onClick={() => {
                                                            setIsMainModalOpen(true);
                                                            navigate(caItem.id);
                                                        }}
                                                        ca={caItem}
                                                        engine={engines.find(engine => caItem.engine_id === engine.id)!}
                                                        selected={selectedCa !== undefined ? caItem.id === selectedCa : false}
                                                    />
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                )
                        }
                    </Box>
                </Box >
            </Grid >

            <Grid item xs={12} xl={9} md={8} style={{ height: "100%", overflow: "hidden", background: theme.palette.background.default }} ref={containerRef}>
                <Slide direction="left" in={isMainModalOpen} container={containerRef.current} style={{ height: "100%" }}>
                    <Box>
                        <Outlet />
                    </Box>
                </Slide>
            </Grid>

        </Grid >
    );
};
