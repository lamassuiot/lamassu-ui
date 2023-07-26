import React, { useState } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { useTheme } from "@mui/material";
import { CaList } from "./views/CaList";
import { CaInspector } from "./views/CaInspector";
import { FormattedView } from "components/DashboardComponents/FormattedView";
import { TabsList } from "components/LamassuComponents/dui/TabsList";
import { CreateCA } from "./views/CaActions/CreateCA";
import { ImportCA } from "./views/CaActions/ImportCA";

export const CAView = () => {
    return (
        <Routes>
            <Route path="/" element={<RoutedCaList />}>
                <Route path="create" element={<CaCreationActionsWrapper />} />
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
        <CaInspector caName={params.caName!} />
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
            <TabsList tabs={[
                {
                    label: "Standard",
                    element: <CreateCA />
                },
                {
                    label: "Import",
                    element: <ImportCA onCreate={function (crt: string, key: string): void {

                    }} />
                },
                {
                    label: "Read-Only Import",
                    element: <ImportCA onCreate={function (crt: string, key: string): void {

                    }} />
                }
            ]}

            />
        </FormattedView>
    );
};
