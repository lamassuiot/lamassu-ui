import { CAImporter } from "./CAImporter";
import { CAInspector } from "./CAInspector";
import { CAListView } from "./CAListView";
import { CAReadonlyImporter } from "./CAImporterReadonly";
import { CreateCA } from "./CreateCA";
import { CryptoEngine } from "ducks/features/cas/models";
import { FetchViewer } from "components/FetchViewer";
import { FormattedView } from "components/FormattedView";
import { Route, Routes, useParams } from "react-router-dom";
import { TabsList } from "components/TabsList";
import { getEngines } from "ducks/features/cas/apicalls";
import React from "react";
import { UpdateCA } from "./UpdateCA";
import { useTheme } from "@mui/material";
import { CACustomFetchViewer } from "components/CAs/CACustomFetchViewer";

export const CAView = () => {
    const theme = useTheme();

    return (
        <FetchViewer fetcher={() => getEngines()} renderer={engines => {
            return (
                <Routes>
                    <Route path="/" element={<RoutedCAList engines={engines} />}>
                        <Route path="create" element={<CaCreationActionsWrapper engines={engines} />} />
                        <Route path=":caName/*" element={<RoutedCaInspector engines={engines} />} />
                        <Route path="edit/:caName" element={<RoutedCAUpdate />} />
                    </Route>
                </Routes>
            );
        }
        }
        />
    );
};

const RoutedCAUpdate = () => {
    const params = useParams();
    return (
        <CACustomFetchViewer id={params.caName!} renderer={(caData) => {
            return (
                <UpdateCA caData={caData} />
            );
        }} />
    );
};

const RoutedCAList = ({ engines }: { engines: CryptoEngine[] }) => {
    const params = useParams();
    return (
        <CAListView preSelectedCaID={params.caName} engines={engines} />
    );
};

const RoutedCaInspector = ({ engines }: { engines: CryptoEngine[] }) => {
    const params = useParams();

    return (
        <CAInspector caName={params.caName!} engines={engines} />
    );
};

const CaCreationActionsWrapper = ({ engines }: { engines: CryptoEngine[] }) => {
    return (
        <FormattedView
            title="Create a new CA"
            subtitle="To create a new CA certificate, please provide the appropriate information"
        >
            <TabsList tabs={[
                {
                    label: "Standard",
                    element: <CreateCA defaultEngine={engines.find(engine => engine.default)!} />
                },
                {
                    label: "Import",
                    element: <CAImporter defaultEngine={engines.find(engine => engine.default)!} />
                },
                {
                    label: "Read-Only Import",
                    element: <CAReadonlyImporter />
                }
            ]} />
        </FormattedView>
    );
};
