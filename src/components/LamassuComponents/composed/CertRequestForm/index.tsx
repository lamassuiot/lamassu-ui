import { Grid, useTheme } from "@mui/material";
import { TabsList } from "components/LamassuComponents/dui/TabsList";
import React, { useState } from "react";
import CSRImporter from "./CSRImporter";
import CSRInBrowserGenerator from "./CSRInBrowserGenerator";

interface CertRequestFormProps {
    onCreate: (csr: string) => void
}

const CertRequestForm: React.FC<CertRequestFormProps> = ({ onCreate }) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);

    const csrTabs = [
        {
            label: "Generate CSR",
            element: (
                <CSRInBrowserGenerator onCreate={(privKey, csr) => {
                    onCreate(csr);
                }} />
            )
        },
        {
            label: "Import CSR",
            element: (
                <CSRImporter onCreate={(csr) => {
                    onCreate(csr);
                }} />
            )
        }
    ];

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TabsList tabs={csrTabs} />
                </Grid>
            </Grid>
        </>
    );
};

export default CertRequestForm;
