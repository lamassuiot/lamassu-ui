import React from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { useTheme } from "@mui/material";
import { CAInspector } from "./views/CaInspector";
import { FormattedView } from "components/DashboardComponents/FormattedView";
import { TabsList } from "components/LamassuComponents/dui/TabsList";
import { CreateCA } from "./views/CaActions/CreateCA";
import { CAReadonlyImporter } from "views/CertificateAuthoritiesView/views/CaActions/CAImporterRadonly";
import { CAListView } from "./views/CAListView";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import { CryptoEngine, getEngines } from "ducks/features/cav3/apicalls";
import { CAImporter } from "./views/CaActions/CAImporter";

export const CAView = () => {
    return (
        <FetchViewer fetcher={() => getEngines()} renderer={engines => {
            return (
                <Routes>
                    <Route path="/" element={<RoutedCAList engines={engines} />}>
                        <Route path="create" element={<CaCreationActionsWrapper engines={engines} />} />
                        <Route path=":caName/*" element={<RoutedCaInspector engines={engines} />} />
                    </Route>
                </Routes>
            );
        }}
        />
    );
};

const RoutedCAList = ({ engines }: { engines: CryptoEngine[] }) => {
    const params = useParams();
    const location = useLocation();
    return (
        <CAListView preSelectedCaName={params.caName} engines={engines} />
    );
};

const RoutedCaInspector = ({ engines }: { engines: CryptoEngine[] }) => {
    const params = useParams();

    return (
        <CAInspector caName={params.caName!} engines={engines} />
    );
};

const CaCreationActionsWrapper = ({ engines }: { engines: CryptoEngine[] }) => {
    const theme = useTheme();
    return (
        <FormattedView
            title="Create a new CA"
            subtitle="To create a new CA certificate, please provide the appropriate information"
        >
            <TabsList tabs={[
                {
                    label: "Standard",
                    element: <CreateCA defaultEngine={engines.find(engine => engine.default)!}/>
                },
                {
                    label: "Import",
                    element: <CAImporter defaultEngine={engines.find(engine => engine.default)!}/>
                },
                {
                    label: "Read-Only Import",
                    element: <CAReadonlyImporter />
                }
            ]}
            />
        </FormattedView>
    );
};
