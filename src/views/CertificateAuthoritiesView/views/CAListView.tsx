import { Box, useTheme } from "@mui/system";
import React, { useEffect, useState } from "react";
import * as caActions from "ducks/features/cav3/actions";
import * as caSelector from "ducks/features/cav3/reducer";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { Outlet, useNavigate } from "react-router-dom";
import { Grid, IconButton, InputBase, Paper, Slide, Skeleton, Breadcrumbs, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { CertificateCard } from "views/CertificateAuthoritiesView/components/CertificateCard";
import { AiOutlineSearch, AiOutlineSafetyCertificate } from "react-icons/ai";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Filter, Filters } from "components/FilterInput";
import { CertificateAuthority, CryptoEngine, casFilters } from "ducks/features/cav3/models";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { EnginesIcons } from "components/LamassuComponents/lamassu/CryptoEngineViewer";
import CAViewer from "components/LamassuComponents/lamassu/CAViewer";
import ViewListIcon from "@mui/icons-material/ViewList";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { Tree, TreeNode } from "react-organizational-chart";
import { MapInteractionCSS } from "react-map-interaction";

interface Props {
    preSelectedCaID?: string
    engines: CryptoEngine[]
}

interface CAsEngines {
    cas: Array<CertificateAuthority>
    engines: CryptoEngine[]
}

export const CAListView: React.FC<Props> = ({ preSelectedCaID, engines }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [viewMode, setViewMode] = React.useState<"list" | "graph">("list");

    const requestStatus = useAppSelector((state) => caSelector.getCAListRequestStatus(state));
    const caList = useAppSelector((state) => caSelector.getCAs(state));

    const [selectedCa, setSelectedCa] = useState(preSelectedCaID);
    const [isMainModalOpen, setIsMainModalOpen] = useState(true);

    const [filters, setFilters] = useState<Filter[]>([]);
    const containerRef = React.useRef(null);

    const [rootChain, setRootChain] = useState<CertificateAuthority[]>([]);

    const refreshAction = () => {
        dispatch(caActions.getCAs.request({
            filters: filters.map(filter => { return `${filter.propertyField.key}[${filter.propertyOperator}]${filter.propertyValue}`; }),
            limit: 150,
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
        setSelectedCa(preSelectedCaID);
    }, [preSelectedCaID]);

    const filterCAs = (name: string) => {
        const filterQuery = [];
        if (name !== "") {
            filterQuery.push("id[contains]=" + name);
        }
        refreshAction();
    };

    const renderCAHierarchy = (parentChain: CertificateAuthority[], ca: CertificateAuthority) => {
        return (
            <TreeNode label={
                <div style={{ marginTop: "8px", display: "flex", justifyContent: "center" }}>
                    <CertificateCard
                        onClick={() => {
                            setSelectedCa(ca.id);
                            navigate(ca.id);
                            setRootChain(parentChain);
                            setViewMode("list");
                        }}
                        ca={ca}
                        style={{ minWidth: "400px", maxWidth: "500px", width: "100%" }}
                        engine={engines.find(engine => ca.engine_id === engine.id)!}
                        selected={false}
                    />
                </div>
            }>
                {
                    caList.filter(caItem => caItem.issuer_metadata.id === ca.id && caItem.level === ca.level + 1).map(caItem => renderCAHierarchy([...parentChain, ca], caItem))
                }
            </TreeNode>
        );
    };

    return (
        <Grid item xs container style={{ height: "100%" }}>
            <Grid item xs={viewMode === "list" ? 4 : 12} xl={viewMode === "list" ? 3 : 12} container direction="column" style={{ background: theme.palette.background.lightContrast, width: "100%" }}>
                <Box style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
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
                                        <IconButton style={{ background: theme.palette.primary.light }} onClick={() => { setViewMode("list"); setIsMainModalOpen(true); navigate("create"); }}>
                                            <AddIcon style={{ color: theme.palette.primary.main }} />
                                        </IconButton>
                                    </Box>
                                </Grid>
                                <Grid item xs={"auto"} container justifyContent={"flex-end"}>
                                    <Box component={Paper} elevation={0} style={{ borderRadius: 8, marginLeft: 10 }}>
                                        <ToggleButtonGroup
                                            value={viewMode}
                                            exclusive
                                            color="primary"
                                            onChange={(event: any, newVal: string | null) => {
                                                if (newVal !== null) {
                                                    setViewMode(newVal === "list" ? "list" : "graph");
                                                }
                                            }}
                                        >
                                            <ToggleButton value="list">
                                                <ViewListIcon />
                                            </ToggleButton>
                                            <ToggleButton value="graph" >
                                                <AccountTreeOutlinedIcon />
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} style={{ paddingTop: "10px" }} container alignItems={"center"}>
                                <Filters fields={casFilters} filters={filters} onChange={(filters) => setFilters([...filters])} />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box style={{ overflowY: "auto", height: 300, flexGrow: 1 }}>
                        {
                            requestStatus.isLoading
                                ? (
                                    <Box padding="10px 20px 20px 20px">
                                        <Skeleton variant="rectangular" width={"100%"} height={75} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                    </Box>
                                )
                                : (
                                    viewMode === "list"
                                        ? (
                                            <Grid container spacing={"20px"} flexDirection={"column"}>
                                                {
                                                    rootChain.length > 0 && (
                                                        <>
                                                            <Grid item>
                                                                <Box component={Paper} sx={{ background: theme.palette.background.default, padding: "10px 5px", borderRadius: 0, borderRight: `1px solid ${theme.palette.background.lightContrast}` }}>
                                                                    {/* <CAViewer elevation={false} caData={selectedParentCA} engine={engines.find(engine => selectedParentCA.engine_id === engine.id)!}/> */}
                                                                    <Breadcrumbs aria-label="breadcrumb" maxItems={2}>
                                                                        <StyledBreadcrumb
                                                                            icon={<AiOutlineSafetyCertificate size={"20px"} />}
                                                                            label="ROOT CAs"
                                                                            onClick={() => setRootChain([])}
                                                                        />
                                                                        {
                                                                            rootChain.map(ca => {
                                                                                const caEngine = engines.find(engine => ca.engine_id === engine.id);
                                                                                return (
                                                                                    <StyledBreadcrumb
                                                                                        key={ca.id}
                                                                                        component="a"
                                                                                        href="#"
                                                                                        onClick={() => {
                                                                                            const newChain = rootChain;
                                                                                            newChain.length = ca.level + 1;
                                                                                            setRootChain([...newChain]);
                                                                                        }}
                                                                                        label={`${ca.level === 0 ? "Root: " : ""} Level ${ca.level}`}
                                                                                        icon={
                                                                                            ca.type !== "EXTERNAL"
                                                                                                ? (
                                                                                                    <Box sx={{ height: "20px", width: "20px", paddingLeft: "5px" }}>
                                                                                                        <img src={EnginesIcons.find(ei => ei.uniqueID === caEngine!.type)!.icon} height={"100%"} width={"100%"} />
                                                                                                    </Box>
                                                                                                )
                                                                                                : (
                                                                                                    <></>
                                                                                                )
                                                                                        }
                                                                                    />
                                                                                );
                                                                            })
                                                                        }
                                                                    </Breadcrumbs>
                                                                    <CAViewer elevation={false} caData={rootChain[rootChain.length - 1]} engine={engines.find(engine => rootChain[rootChain.length - 1].engine_id === engine.id)!} />
                                                                </Box>
                                                            </Grid>
                                                        </>
                                                    )
                                                }
                                                <Grid container padding="30px 20px 20px 40px" spacing={"20px"} flexDirection={"column"}>
                                                    {
                                                        caList.filter(ca => {
                                                            if (rootChain.length === 0) {
                                                                return ca.level === 0;
                                                            }
                                                            return ca.level === rootChain.length && ca.issuer_metadata.id === rootChain[rootChain.length - 1].id;
                                                        }).map((caItem) => (
                                                            <Grid item key={caItem.id}>
                                                                <CertificateCard
                                                                    onClick={() => {
                                                                        setIsMainModalOpen(true);
                                                                        navigate(caItem.id);
                                                                        setRootChain([...rootChain, caItem]);
                                                                    }}
                                                                    ca={caItem}
                                                                    engine={engines.find(engine => caItem.engine_id === engine.id)!}
                                                                    selected={selectedCa !== undefined ? caItem.id === selectedCa : false}
                                                                />
                                                            </Grid>
                                                        ))
                                                    }
                                                </Grid>
                                            </Grid>
                                        )
                                        : (
                                            <MapInteractionCSS>
                                                <div style={{ maxWidth: "100%" }}>
                                                    <Tree
                                                        lineWidth={"4px"}
                                                        lineColor={theme.palette.primary.main}
                                                        lineBorderRadius={"5px"}
                                                        label={
                                                            <Grid container justifyContent={"center"}>
                                                                <Grid item>
                                                                    <img src={process.env.PUBLIC_URL + theme.palette.mode === "light" ? "/assets/LAMASSU_B.svg" : "/assets/LAMASSU.svg"} height={"60px"} />
                                                                </Grid>
                                                            </Grid>
                                                        }>
                                                        {
                                                            caList.filter(ca => ca.level === 0).map(ca => renderCAHierarchy([], ca))
                                                        }
                                                    </Tree>
                                                </div>
                                            </MapInteractionCSS>
                                        )
                                )
                        }
                    </Box>
                </Box >
            </Grid >

            {
                viewMode === "list" && (
                    <Grid item xs xl style={{ height: "100%", overflow: "hidden", background: theme.palette.background.default }} ref={containerRef}>
                        <Slide direction="left" in={isMainModalOpen} container={containerRef.current} style={{ height: "100%" }}>
                            <Box>
                                <Outlet context={[rootChain.length > 0 ? rootChain[rootChain.length - 1] : undefined]} />
                            </Box>
                        </Slide>
                    </Grid>
                )
            }

        </Grid >
    );
};

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: "30px",
        color: theme.palette.text.primary,
        cursor: "pointer",
        fontWeight: theme.typography.fontWeightRegular,
        "&:hover, &:focus": {
            backgroundColor: emphasize(backgroundColor, 0.06)
        },
        "&:active": {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12)
        }
    };
}) as typeof Chip; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591
