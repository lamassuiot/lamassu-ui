import React, { useEffect, useRef, useState } from "react";

import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { Box, Breadcrumbs, Divider, IconButton, Paper, Slide, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CertificateAuthority, CertificateStatus, CryptoEngine } from "ducks/features/cas/models";
import { CryptoEngineViewer, EnginesIcons } from "components/CryptoEngines/CryptoEngineViewer";
import { MapInteractionCSS } from "react-map-interaction";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { QuerySearchbarInput } from "components/QuerySearchbarInput";
import { Tree, TreeNode } from "react-organizational-chart";
import { emphasize, lighten, styled } from "@mui/material/styles";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AddIcon from "@mui/icons-material/Add";
import CAViewer from "components/CAs/CAViewer";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewListIcon from "@mui/icons-material/ViewList";
import moment from "moment";
import { CASelector } from "components/CAs/CASelector";
import lamassuFullBlue from "assets/lamassu/lamassu_full_blue.svg";
import lamassuFullWhite from "assets/lamassu/lamassu_full_white.svg";
import { ListResponse } from "ducks/services/api-client";
import { useLoading } from "components/Spinner/LoadingContext";
import { getCAs } from "ducks/features/cas/apicalls";
import { ErrorBox } from "components/ErrorBox/ErrorBox";
import useCachedEngines from "components/cache/cachedEngines";

export type CAOutletContext = {
    preselectedCAParent: CertificateAuthority | undefined;
    engines: CryptoEngine[];
    shoulUpdateCAs:() => void;
}

const queryableFields = [
    { key: "subject.common_name", title: "CN", operator: "contains" },
    { key: "id", title: "ID", operator: "contains" }
];

const initialCAState: ListResponse<CertificateAuthority> = {
    list: [],
    next: ""
};

export const CAListView: React.FC = () => {
    const theme = useTheme();
    const params = useParams();
    const navigate = useNavigate();
    const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));
    const firstRender = useRef(true);

    const [viewMode, setViewMode] = React.useState<"list" | "graph">("list");
    const preSelectedCaID = params.caName;
    const [selectedCa, setSelectedCa] = useState(preSelectedCaID);
    const [isMainModalOpen, setIsMainModalOpen] = useState(true);

    const containerRef = React.useRef(null);

    const [rootChain, setRootChain] = useState<CertificateAuthority[]>([]);

    const [query, setQuery] = React.useState<{ value: string, field: string, operator: string }>({ value: "", field: queryableFields[0].key, operator: queryableFields[0].operator });
    const filters: string[] = [];
    if (query.field !== "" && query.value !== "") {
        filters.push(`${query.field}[${query.operator}]${query.value}`);
    }

    const [cas, setCas] = useState<ListResponse<CertificateAuthority>>(initialCAState);
    const [engines, setEngines] = useState([] as CryptoEngine[]);
    const { setLoading } = useLoading();
    const [error, setError] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const { getEnginesData } = useCachedEngines();

    useEffect(() => {
        setLoading(true);
        getEnginesData()
            .then((result) => {
                setEngines(result);
            })
            .catch(error => {
                setError(error);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadCas();
    }, []);

    useEffect(() => {
        setSelectedCa(preSelectedCaID);
        if (preSelectedCaID === undefined) {
            setRootChain([]);
        } else {
            getFullChain(cas.list.find(ca => ca.id === preSelectedCaID)!);
        }
    }, [preSelectedCaID]);

    useEffect(() => {
        setViewMode("list");
    }, [isMediumScreen]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (query.field !== "" && query.value !== "") {
            setRootChain([]);
            setIsSearching(true);
            loadCas();
        } else if (query.field !== "" && query.value === "") {
            setIsSearching(false);
            loadCas();
        }
    }, [query]);

    const loadCas = () => {
        setLoading(true);
        getCAs({ filters })
            .then((result) => {
                setCas(result);
                const current = result.list.filter(ca => ca.id === selectedCa)[0];
                if (current && !isSearching) {
                    getFullChain(current, result);
                }
            })
            .catch(error => {
                setError(error);
            })
            .finally(() => setLoading(false));
    };

    const getFullChain = (ca: CertificateAuthority, caList?: ListResponse<CertificateAuthority>) => {
        if (ca === undefined) {
            return;
        }

        if (!caList) {
            caList = cas;
        }

        const chain: CertificateAuthority[] = [];
        let currentCA = ca;

        while (currentCA.level > 0) {
            const parent = caList.list.find(
                (element) => element.id === currentCA.certificate.issuer_metadata.id
            );

            if (!parent) {
                break;
            }

            chain.unshift(parent);

            currentCA = parent;
        }

        chain.push(ca);

        setRootChain(chain);
    };

    const handleRefresh = () => {
        loadCas();
    };

    const handleChange = (value: string, field:string) => {
        const newOperator = queryableFields.find((f) => f.key === field)?.operator || "contains";

        if (value === query.value &&
            field === query.field &&
            newOperator === query.operator
        ) {
            return;
        }

        setQuery({ value, field, operator: newOperator });
    };

    if (error) {
        return <ErrorBox error={error} errorPrefix="Could not fetch CA list" />;
    }

    const renderCAHierarchy = (caList: CertificateAuthority[], parentChain: CertificateAuthority[], ca: CertificateAuthority) => {
        return (
            <TreeNode key={ca.id} label={
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
                        engine={engines.find(engine => ca.certificate.engine_id === engine.id)!}
                        selected={false}
                    />
                </div>
            }>
                {
                    caList.filter(caItem => caItem.certificate.issuer_metadata.id === ca.id && caItem.level === ca.level + 1).map(caItem => renderCAHierarchy(caList, [...parentChain, ca], caItem))
                }
            </TreeNode>
        );
    };

    if (!isMediumScreen) {
        return (
            <Grid container flexDirection={"column"} sx={{ height: "100%" }} flexWrap={"nowrap"}>
                <Grid container spacing={2} padding={2} >
                    <Grid xs>
                        <CASelector multiple={false} label="" onSelect={(ca) => {
                            if (!Array.isArray(ca) && ca) {
                                setIsMainModalOpen(true);
                                navigate(ca.id);
                            }
                        }} />
                    </Grid>
                    <Grid xs={"auto"}>
                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.divider, width: 40, height: 40 }}>
                            <Tooltip title="Create New CA">
                                <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => { setViewMode("list"); setIsMainModalOpen(true); navigate("create"); }}>
                                    <AddIcon style={{ color: theme.palette.primary.main }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>
                <Grid flex={1}>
                    <Box component={Paper} borderRadius={0} sx={{ height: "100%" }}>
                        <Outlet context={{ preselectedCAParent: [], engines, shoulUpdateCAs: () => loadCas() }} />
                    </Box>
                </Grid>
            </Grid>
        );
    }

    const printCAs = () => {
        if (viewMode === "list") {
            return <Grid container flexDirection={"column"} sx={{ padding: 0 }}>
                {
                    rootChain.length > 0 && (
                        <>
                            <Grid xs>
                                <Box component={Paper} sx={{ padding: "10px 5px", borderRadius: 0, borderRight: `1px solid ${theme.palette.divider}`, width: "100%" }}>
                                    {/* <CAViewer elevation={false} caData={selectedParentCA} engine={engines.find(engine => selectedParentCA.engine_id === engine.id)!}/> */}
                                    <Breadcrumbs aria-label="breadcrumb" maxItems={2}>
                                        <StyledBreadcrumb
                                            icon={<AiOutlineSafetyCertificate size={"20px"} />}
                                            label="ROOT CAs"
                                            onClick={() => setRootChain([])}
                                        />
                                        {
                                            rootChain.map(ca => {
                                                const caEngine = engines.find(engine => ca.certificate.engine_id === engine.id);
                                                return (
                                                    <StyledBreadcrumb
                                                        key={ca.id}
                                                        component="a"
                                                        href="#"
                                                        onClick={() => {
                                                            if (rootChain.length <= ca.level + 1) {
                                                                getFullChain(ca);
                                                            } else {
                                                                const newChain = rootChain;
                                                                newChain.length = ca.level + 1;
                                                                setRootChain([...newChain]);
                                                            }
                                                        }}
                                                        label={`${ca.level === 0 ? "Root: " : ""} Level ${ca.level}`}
                                                        icon={
                                                            ca.certificate.type !== "EXTERNAL"
                                                                ? (
                                                                    <Box sx={{ height: "20px", width: "20px", paddingLeft: "5px" }}>
                                                                        {EnginesIcons.find(ei => ei.uniqueID === caEngine!.type)!.icon}
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
                                    <CAViewer elevation={false} caData={rootChain[rootChain.length - 1]} engine={engines.find(engine => rootChain[rootChain.length - 1].certificate.engine_id === engine.id)!} />
                                </Box>
                            </Grid>
                        </>
                    )
                }
                <Grid container padding={"20px"} spacing={"10px"} flexDirection={"column"} className="ca-list">
                    {
                        cas.list.filter(ca => {
                            if (rootChain.length === 0) {
                                return ca.level === 0;
                            }
                            return ca.level === rootChain.length && ca.certificate.issuer_metadata.id === rootChain[rootChain.length - 1].id;
                        }).map((caItem) => (
                            <Grid key={caItem.id}>
                                <CertificateCard
                                    onClick={() => {
                                        setIsMainModalOpen(true);
                                        navigate(caItem.id);
                                        setRootChain([...rootChain, caItem]);
                                        setIsSearching(false);
                                    }}
                                    ca={caItem}
                                    engine={engines.find(engine => caItem.certificate.engine_id === engine.id)!}
                                    selected={selectedCa !== undefined ? caItem.id === selectedCa : false}
                                />
                            </Grid>
                        ))
                    }
                </Grid>
            </Grid>;
        }
        return (
            <MapInteractionCSS
                defaultValue={{
                    scale: 0.5,
                    translation: { x: 0, y: 0 }
                }}
            >
                <div style={{ maxWidth: "100vw" }}>
                    <Tree
                        lineWidth={"4px"}
                        lineColor={theme.palette.primary.main}
                        lineBorderRadius={"5px"}
                        label={
                            <Grid container justifyContent={"center"}>
                                <Grid>
                                    <img src={theme.palette.mode === "light" ? lamassuFullBlue : lamassuFullWhite} height={"60px"} />
                                </Grid>
                            </Grid>
                        }>
                        {
                            cas.list.filter(ca => ca.level === 0).map(ca => renderCAHierarchy(cas.list, [], ca))
                        }
                    </Tree>
                </div>
            </MapInteractionCSS>
        );
    };

    return (
        <Grid xs container style={{ height: "100%" }} >
            <Grid xs={viewMode === "list" ? 4 : 12} xl={viewMode === "list" ? 3 : 12} container direction="column">
                <Box style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
                    <Box sx={{ padding: "20px" }}>
                        <Grid container spacing={1} sx={{ maxWidth: "calc(100vw - 80px)" }}>
                            <Grid xs={12} container>
                                <Grid xs>
                                    <Box style={{ borderRadius: 8 }}>
                                        <ToggleButtonGroup
                                            value={viewMode}
                                            size="small"
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
                                <Grid xs={"auto"} container>
                                    <Grid xs={"auto"}>
                                        <Box style={{ borderRadius: 8, background: theme.palette.divider, width: 40, height: 40 }}>
                                            <Tooltip title="Reload CA List">
                                                <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={handleRefresh}>
                                                    <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    <Grid xs={"auto"}>
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.divider, width: 40, height: 40 }}>
                                            <Tooltip title="Create New CA">
                                                <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => { setViewMode("list"); setIsMainModalOpen(true); navigate("create"); }}>
                                                    <AddIcon style={{ color: theme.palette.primary.main }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid xs={12}>
                                <QuerySearchbarInput
                                    sx={{ width: "100%" }}
                                    onChange={({ query, field }) => { handleChange(query, field); }}
                                    fieldSelector={queryableFields}
                                />
                            </Grid>
                            {/*
                            <Grid style={{ paddingTop: "10px" }} container alignItems={"center"}>
                                <Filters fields={casFilters} filters={filters} onChange={(filters) => setFilters([...filters])} />
                            </Grid>
                            */}
                        </Grid>
                    </Box>

                    <Box style={{ overflowY: "auto", height: 300, flexGrow: 1 }}>
                        { printCAs()}
                    </Box>
                </Box>
            </Grid>
            {
                viewMode === "list" && (
                    <Grid xs xl style={{ height: "100%", background: theme.palette.background.paper }} ref={containerRef}>
                        <Slide direction="left" in={isMainModalOpen} container={containerRef.current} style={{ height: "100%" }}>
                            <Box>
                                <Outlet context={{
                                    preselectedCAParent: rootChain.length > 0 ? rootChain[rootChain.length - 1] : undefined,
                                    engines,
                                    shoulUpdateCAs: () => loadCas()
                                }} />
                            </Box>
                        </Slide>
                    </Grid>
                )
            }
        </Grid>
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

interface CertificateCardProps {
    ca: CertificateAuthority
    engine: CryptoEngine
    selected: boolean,
    elevation?: boolean,
    onClick?: any,
    style?: any
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ ca, engine, elevation = true, selected = false, onClick = () => { }, style = {} }) => {
    const theme = useTheme();

    const card = (
        <>
            <Grid container sx={{}}>
                <Grid xs="auto" container>
                    <Grid>
                        <Box style={{ width: "10px", height: "60%", borderTopRightRadius: 10, borderBottomRightRadius: 10, background: selected ? theme.palette.primary.main : "transparent", position: "relative", top: "20%" }} />
                    </Grid>
                </Grid>

                <Grid xs container flexDirection={"column"} spacing={"5px"}>
                    <Grid xs>
                        <Box style={{ padding: "0 10px 0 20px" }}>
                            <Grid container justifyContent="center" alignItems="center" spacing={1}>
                                {
                                    ca.certificate.type !== "EXTERNAL" && (
                                        <Grid xs="auto">
                                            <CryptoEngineViewer engine={engine} simple />
                                        </Grid>
                                    )
                                }

                                <Grid xs={12} lg>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`${ca.certificate.key_metadata.type} ${ca.certificate.key_metadata.bits} - ${ca.certificate.key_metadata.strength}`}</Typography>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 20, lineHeight: "24px", wordBreak: "break-word" }}>{ca.certificate.subject.common_name}</Typography>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 12 }}>{ca.id}</Typography>
                                </Grid>

                                <Grid xs={12} lg="auto" container direction="column" justifyContent="center" alignItems="center">
                                    <Grid>
                                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>Hierarchy Level</Typography>
                                    </Grid>
                                    <Grid>
                                        <Label>{ca.level === 0 ? "ROOT" : `Level ${ca.level}`}</Label>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    <Grid xs>
                        <Divider />
                    </Grid>

                    <Grid xs="auto">
                        <Box sx={{ padding: "5px 20px" }}>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Grid xs>
                                    {
                                        ca.certificate.status !== CertificateStatus.Active
                                            ? (
                                                <Label color={"error"}>
                                                    {`${ca.certificate.status} · ${moment(ca.certificate.valid_to).format("DD/MM/YYYY")} ·  ${moment.duration(moment(ca.certificate.status === CertificateStatus.Revoked ? ca.certificate.revocation_timestamp : ca.certificate.valid_to).diff(moment())).humanize(true)}`}
                                                </Label>
                                            )
                                            : (
                                                <Typography style={{ fontWeight: "400", fontSize: "13px" }} >{`${ca.certificate.status} · ${moment(ca.certificate.valid_to).format("DD/MM/YYYY")} ·  ${moment.duration((moment(ca.certificate.valid_to).diff(moment()))).humanize(true)}`}</Typography>
                                            )
                                    }
                                </Grid>
                                <Grid xs="auto">
                                    {
                                        ca.certificate.type !== "MANAGED" && (
                                            <Label color="primary">{ca.certificate.type}</Label>
                                        )
                                    }
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );

    if (!elevation) {
        return card;
    }

    return (
        <>
            <Box elevation={selected ? 4 : 1}
                component={Paper}
                onClick={onClick}
                style={{ width: "auto", height: "100%", borderRadius: 10, cursor: "pointer", ...style }}
            >
                {
                    card
                }
            </Box >
        </>
    );
};
