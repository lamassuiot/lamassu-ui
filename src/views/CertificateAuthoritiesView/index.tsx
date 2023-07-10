import React, { useState } from "react";
import { Link, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Box } from "@mui/system";
import { Divider, Tab, Tabs, useTheme } from "@mui/material";
import { CaList } from "./views/CaList";
import { CaInspector } from "./views/CaInspector";
import { CreateCA } from "./views/CaActions/CreateCA";
import { ImportCA } from "./views/CaActions/ImportCA";
import { FormattedView } from "components/DashboardComponents/FormattedView";

export const CAView = () => {
    return (
        <Routes>
            <Route path="/" element={<RoutedCaList />}>
                <Route path="actions" element={<CaCreationActionsWrapper />} >
                    <Route path="create" element={<CreateCA />} />
                    <Route path="import" element={<ImportCA />} />
                </Route>
                <Route path=":caName/*" element={<RoutedCaInspector />} />
            </Route>
        </Routes>
    );
};

const RoutedCaList = () => {
    const params = useParams();
    const location = useLocation();
    return (
        <CaList preSelectedCaName={params.caName} />
    );
};

const RoutedCaInspector = () => {
    const params = useParams();

    return (
        <CaInspector caName={params.caName} />
    );
};

const CaCreationActionsWrapper = () => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <FormattedView
            title="Create a new CA"
            subtitle="To create a new CA certificate, please provide the appropriate information"
        >
            <>
                <Box style={{ position: "relative", left: "-15px" }}>
                    <Tabs value={selectedTab} onChange={(ev, newValue) => setSelectedTab(newValue)}>
                        <Tab component={Link} to="create" label="Standard" />
                        <Tab component={Link} to="import" label="Import" />
                    </Tabs>
                </Box>
                <Divider sx={{ width: "100" }} />
                <Box style={{ display: "flex", height: "100%", marginTop: "15px" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Outlet />
                    </Box>
                </Box>
            </>
        </FormattedView>
    );
};
