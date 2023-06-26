import { Divider, Grid, Paper, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";

import { Link, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { CreateDms } from "./DmsActions/CreateDms";
import { UpdateDMS } from "./DmsActions/UpdateDMS";
import { DmsList } from "./DmsList";

export const DMSView = () => {
    return (
        <Routes>
            <Route path="/" element={<Outlet/>}>
                <Route path=":dmsName/edit" element={
                    <RoutedUpdateDMS />
                }/>
                <Route path="create" element={<DmsActionWrapper />} >
                    <Route path="import" element={<CreateDms />} />
                    <Route index element={<CreateDms />} />
                </Route>
                <Route index element={<DmsList />} />
            </Route>
        </Routes>
    );
};

const RoutedUpdateDMS = () => {
    const params = useParams();
    const location = useLocation();
    // console.log(params, location);
    return (
        <UpdateDMS dmsName={params.dmsName!}/>
    );
};

const DmsActionWrapper = () => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <Box sx={{ height: "100%" }} component={Paper}>
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box style={{ padding: "40px 40px 0 40px" }}>
                    <Grid item container spacing={2} justifyContent="flex-start">
                        <Grid item xs={12}>
                            <Box style={{ display: "flex", alignItems: "center" }}>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>Create a new Device Manufacturing System</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>To create a new DMS instance, please provide the appropriate information</Typography>
                    </Grid>
                    <Box style={{ marginTop: 15, position: "relative", left: "-15px" }}>
                        <Tabs value={selectedTab} onChange={(ev, newValue) => setSelectedTab(newValue)}>
                            <Tab component={Link} to="create" label="Default Provision" />
                        </Tabs>
                    </Box>
                </Box>
                <Divider />
                <Box style={{ padding: "20px 40px 20px 40px", /* flexGrow: 1, */ overflowY: "auto", /* height: "100%", */ display: "flex" }}>
                    <Grid container style={{ width: "300px", flexGrow: 1 }}>
                        <Outlet />
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};
