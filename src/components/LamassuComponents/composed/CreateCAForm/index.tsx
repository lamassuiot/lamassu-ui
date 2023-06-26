import { Grid, useTheme } from "@mui/material";
import { TabsList } from "components/LamassuComponents/dui/TabsList";
import React, { useState } from "react";
import GenerateCA from "./GenerateCA";
import CertificateImporter from "./CertificateImporter";

const CreateCAForm = () => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);

    const caTabs = [
        {
            label: "Generate CA",
            element: (
                <GenerateCA />
            )
        },
        {
            label: "Import CA",
            element: (
                <CertificateImporter onCreate={(csr) => {
                }} />
            )
        }
    ];

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TabsList tabs={caTabs} />
                </Grid>
            </Grid>
        </>
    );
};

export default CreateCAForm;
