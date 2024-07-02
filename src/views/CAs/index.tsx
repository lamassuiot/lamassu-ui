import { CAImporter } from "./CAImporter";
import { CAInspector } from "./CAInspector";
import { CAListView } from "./CAListView";
import { CAReadonlyImporter } from "./CAImporterReadonly";
import { CreateCA } from "./CreateCA";
import { CryptoEngine } from "ducks/features/cas/models";
import { FetchViewer } from "components/FetchViewer";
import { FormattedView } from "components/FormattedView";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { TabsList } from "components/TabsList";
import { getEngines } from "ducks/features/cas/apicalls";
import React from "react";

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
        <CAListView preSelectedCaID={params.caName} engines={engines} />
    );
};

const RoutedCaInspector = ({ engines }: { engines: CryptoEngine[] }) => {
    const params = useParams();
    console.log(params.caName);

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
            ]}/>
        </FormattedView>
    );
};
