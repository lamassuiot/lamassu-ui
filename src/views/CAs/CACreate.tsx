import { FormattedView } from "components/FormattedView";
import { useLoading } from "components/Spinner/LoadingContext";
import { TabsList } from "components/TabsList";
import { getEngines } from "ducks/features/cas/apicalls";
import { CertificateAuthority, CryptoEngine } from "ducks/features/cas/models";
import React, { useState, useEffect } from "react";
import { CAImporter } from "./CAImporter";
import { CAReadonlyImporter } from "./CAImporterReadonly";
import { CreateCA } from "./CreateCA";
import { useOutletContext } from "react-router-dom";

const CACreate:React.FC = () => {
    const [defaultEngine, setDefaultEngine] = useState({} as CryptoEngine);
    const { setLoading } = useLoading();
    const { engines } = useOutletContext<{
        preselectedCAParent: CertificateAuthority | undefined;
        engines: CryptoEngine[];
      }>();

    useEffect(() => {
        loadEngines();
    }, []);

    const loadEngines = () => {
        if (engines && engines.length > 0) {
            setDefaultEngine(engines.find(engine => engine.default)!);
        } else {
            console.log("No engines found, fetching engines...");
            fetchEngines();
        }
    };

    const fetchEngines = () => {
        setLoading(true);
        getEngines()
            .then((result) => {
                setDefaultEngine(result.find(engine => engine.default)!);
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => setLoading(false));
    };

    if (defaultEngine === undefined || defaultEngine === null || defaultEngine.id === undefined || defaultEngine.id === null) {
        return <></>;
    }

    return (
        <FormattedView
            title="Create a new CA"
            subtitle="To create a new CA certificate, please provide the appropriate information"
        >
            <TabsList tabs={[
                {
                    label: "Standard",
                    element: <CreateCA defaultEngine={defaultEngine} />
                },
                {
                    label: "Import",
                    element: <CAImporter defaultEngine={defaultEngine} />
                },
                {
                    label: "Read-Only Import",
                    element: <CAReadonlyImporter />
                }
            ]} />
        </FormattedView>
    );
};

export default CACreate;
