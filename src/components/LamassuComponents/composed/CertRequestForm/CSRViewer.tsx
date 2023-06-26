import { Divider, Grid } from "@mui/material";
import React from "react";
import CSRDecoder from "./CSRDecoder";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";

interface CSRDecoderProps {
    csr: string
}

const CSRViewer: React.FC<CSRDecoderProps> = ({ csr }) => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <CodeCopier code={csr} />
            </Grid>
            {
                csr && (
                    <>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <CSRDecoder csr={csr} />
                        </Grid>
                    </>
                )
            }
        </Grid >
    );
};

export default CSRViewer;
