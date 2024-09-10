import { Box, Button } from "@mui/material";
import { Certificate } from "ducks/features/cas/models";
import { CodeCopier } from "components/CodeCopier";
import { Modal } from "components/Modal";
import { MetadataInput } from "components/forms/MetadataInput";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import apicalls from "ducks/apicalls";
import { errorToString } from "ducks/services/api-client";
import { enqueueSnackbar } from "notistack";

interface Props {
    certificate: Certificate
    open: boolean
    onClose: () => void
}

export const ShowCertificateModal = (props: Props) => {
    return (
        <Modal
            title={`Certificate ${props.certificate.serial_number}`}
            subtitle=""
            isOpen={props.open}
            maxWidth={false}
            onClose={() => { props.onClose(); }}
            actions={
                <Box>
                    <Button fullWidth onClick={() => { props.onClose(); }}>Close</Button>
                </Box>
            }
            content={
                <Grid container spacing={4} width={"100%"}>
                    <Grid xs={12} md="auto">
                        <CodeCopier code={window.window.atob(props.certificate.certificate)} enableDownload downloadFileName={props.certificate.issuer_metadata.id + "_" + props.certificate.serial_number + ".crt"} />
                    </Grid>
                    <Grid xs={12} md>
                        <MetadataInput label="Metadata" value={props.certificate.metadata} onChange={(meta) => {
                            try {
                                apicalls.cas.updateCertificateMetadata(props.certificate.serial_number, meta);
                                enqueueSnackbar("Certificate metadata updated", { variant: "success" });
                            } catch (e) {
                                const err = errorToString(e);
                                enqueueSnackbar(`Failed to update certificate metadata: ${err}`, { variant: "error" });
                            }
                        }} />
                    </Grid>
                </Grid>
            }
        />);
};
