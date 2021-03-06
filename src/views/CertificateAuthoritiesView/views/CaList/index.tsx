import { Box, useTheme } from "@mui/system";
import React, { useEffect, useState } from "react";
import * as caActions from "ducks/features/cas/actions";
import * as caSelector from "ducks/features/cas/reducer";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { Outlet, useNavigate } from "react-router-dom";
import { Grid, IconButton, InputBase, Paper, Typography, Slide, Skeleton } from "@mui/material";
import { CertificateCard } from "views/CertificateAuthoritiesView/components/CertificateCard";
import { AiOutlineSearch } from "react-icons/ai";
import AddIcon from "@mui/icons-material/Add";
import { CertificateAuthority } from "ducks/features/cas/models";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { numberToHumanReadableString } from "components/utils/NumberToHumanReadableString";

interface Props {
    preSelectedCaName?: string
}

export const CaList: React.FC<Props> = ({ preSelectedCaName }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const caList = useAppSelector((state) => caSelector.getCAs(state));
    const totalCAs = useAppSelector((state) => caSelector.getTotalCAs(state));

    const [filteredCaList, setFilteredCaList] = useState(caList);
    const [selectedCa, setSelectedCa] = useState(preSelectedCaName);
    const [isMainModalOpen, setIsMainModalOpen] = useState(true);

    const [paginationOptions, setPaginationOptions] = useState({
        itemsPerPage: 10,
        selectedPage: 0
    });

    const containerRef = React.useRef(null);

    useEffect(() => {
        dispatch(caActions.getCAsAction.request({
            filterQuery: [],
            limit: paginationOptions.itemsPerPage,
            offset: paginationOptions.selectedPage * paginationOptions.itemsPerPage,
            sortField: "name",
            sortMode: "asc"
        }));
    }, []);

    useEffect(() => {
        dispatch(caActions.getCAsAction.request({
            filterQuery: [],
            limit: paginationOptions.itemsPerPage,
            offset: paginationOptions.selectedPage * paginationOptions.itemsPerPage,
            sortField: "name",
            sortMode: "asc"
        }));
    }, [paginationOptions]);

    useEffect(() => {
        setSelectedCa(preSelectedCaName);
    }, [preSelectedCaName]);

    useEffect(() => {
        setFilteredCaList(caList);
    }, [caList]);

    const filterCAs = (name: string) => {
        const filterQuery = [];
        if (name !== "") {
            filterQuery.push("name[contains]=" + name);
        }
        dispatch(caActions.getCAsAction.request({
            filterQuery: filterQuery,
            limit: paginationOptions.itemsPerPage,
            offset: paginationOptions.selectedPage * paginationOptions.itemsPerPage,
            sortField: "name",
            sortMode: "asc"
        }));
    };

    return (
        <Grid container style={{ height: "100%" }}>
            <Grid item xs={12} md={3} container direction="column" style={{ background: theme.palette.background.lightContrast, width: "100%" }}>
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box sx={{ padding: "20px" }}>
                        <Grid item xs={12} container alignItems="flex-start">
                            <Grid item xs={10} container flexDirection={"column"}>
                                <Grid item>
                                    <Box component={Paper} sx={{ padding: "5px", height: 30, display: "flex", alignItems: "center", width: "calc( 100% - 10px)" }}>
                                        <AiOutlineSearch size={20} color={theme.palette.text.primary} style={{ marginLeft: 10, marginRight: 10 }} />
                                        <InputBase onChange={(ev) => filterCAs(ev.target.value)} fullWidth style={{ color: theme.palette.text.primary, fontSize: 14 }} placeholder="CA Name"/>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} style={{ paddingTop: "10px" }} container alignItems={"center"}>
                                    <Grid item xs="auto">
                                        {
                                            !requestStatus.isLoading && (
                                                <Typography style={{ fontWeight: 500, fontSize: 12, color: theme.palette.text.primaryLight }}>{caList.length} RESULTS</Typography>
                                            )
                                        }
                                    </Grid>
                                    <Grid item xs justifyContent="flex-end" container>
                                        <Grid container spacing={1} alignItems="center" sx={{ width: "fit-content" }}>
                                            <Grid item xs="auto">
                                                <Typography style={{ fontWeight: 500, fontSize: 12, color: theme.palette.text.primaryLight }}>
                                                    {`${(paginationOptions.itemsPerPage! * paginationOptions.selectedPage!) + 1}-${paginationOptions.itemsPerPage! * (paginationOptions.selectedPage! + 1)} of ${numberToHumanReadableString(totalCAs, ".")}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs="auto">
                                                <IconButton size="small" disabled={paginationOptions.selectedPage! === 0} onClick={() => { setPaginationOptions({ ...paginationOptions, selectedPage: paginationOptions.selectedPage! - 1 }); }}>
                                                    <ArrowBackIosIcon sx={{ fontSize: "15px" }} />
                                                </IconButton>
                                            </Grid>
                                            <Grid item xs="auto">
                                                <IconButton size="small" disabled={(paginationOptions.selectedPage! + 1) * paginationOptions.itemsPerPage! >= totalCAs} onClick={() => { setPaginationOptions({ ...paginationOptions, selectedPage: paginationOptions.selectedPage! + 1 }); }}>
                                                    <ArrowForwardIosIcon sx={{ fontSize: "15px" }} />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} container justifyContent={"flex-end"}>
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40, marginLeft: 10 }}>
                                    <IconButton style={{ background: theme.palette.primary.light }} onClick={() => { setIsMainModalOpen(true); navigate("actions/create"); }}>
                                        <AddIcon style={{ color: theme.palette.primary.main }} />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box style={{ padding: "0px 20px 20px 20px", overflowY: "auto", height: 300, flexGrow: 1 }}>

                        {
                            requestStatus.isLoading
                                ? (
                                    <>
                                        <Skeleton variant="rectangular" width={"100%"} height={100} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                        <Skeleton variant="rectangular" width={"100%"} height={100} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                        <Skeleton variant="rectangular" width={"100%"} height={100} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    </>
                                )
                                : (
                                    filteredCaList.map((caItem: CertificateAuthority) => (
                                        <Box style={{ marginBottom: 20 }} key={caItem.name}>
                                            <CertificateCard
                                                onClick={() => {
                                                    setIsMainModalOpen(true);
                                                    navigate(caItem.name);
                                                }}
                                                ca={caItem}
                                                selected={selectedCa !== undefined ? caItem.name === selectedCa : false}
                                            />
                                        </Box>
                                    ))
                                )
                        }
                    </Box>
                </Box>
            </Grid>

            <Grid item xs={12} md={9} style={{ height: "100%", overflow: "hidden", background: theme.palette.background.default }} ref={containerRef}>
                <Slide direction="left" in={isMainModalOpen} container={containerRef.current} style={{ height: "100%" }}>
                    <Box>
                        <Outlet />
                    </Box>
                </Slide>
            </Grid>

        </Grid>
    );
};
