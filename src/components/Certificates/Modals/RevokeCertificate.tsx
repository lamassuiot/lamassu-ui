import { Button, Typography } from "@mui/material";
import { Certificate, CertificateStatus, RevocationReason, getRevocationReasonDescription } from "ducks/features/cas/models";
import { Modal } from "components/Modal";
import { Select } from "components/Select";
import { TextField } from "components/TextField";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState } from "react";
import apicalls from "ducks/apicalls";
import { enqueueSnackbar } from "notistack";

interface Props {
    certificate: Certificate
    open: boolean
    onClose: () => void
    onRevoke: () => void
}

export const RevokeCertificateModal = (props: Props) => {
    const [revokeReason, setRevokeReason] = useState("Unspecified");

    return (
        <Modal
            title={"Revoke Certificate"}
            subtitle={""}
            isOpen={props.open}
            onClose={function (): void {
                props.onClose();
            }}
            maxWidth={"md"}
            content={
                <Grid container flexDirection={"column"} spacing={4}>
                    <Grid container flexDirection={"column"} spacing={2}>
                        <Grid>
                            <TextField label="Certificate Common Name" value={props.certificate.serial_number} disabled />
                        </Grid>
                        <Grid>
                            <TextField label="Certificate Common Name" value={props.certificate.subject.common_name} disabled />
                        </Grid>
                    </Grid>
                    <Grid container flexDirection={"column"} spacing={2}>
                        <Grid>
                            <Select label="Select Revocation Reason" value={revokeReason} onChange={(ev: any) => setRevokeReason(ev.target.value!)} options={
                                Object.values(RevocationReason).map((rCode, idx) => {
                                    return {
                                        value: rCode,
                                        render: () => (
                                            <Grid container spacing={1}>
                                                <Grid xs={12}>
                                                    <Typography variant="body1" fontWeight={"bold"}>{rCode}</Typography>
                                                </Grid>
                                                <Grid xs={12}>
                                                    <Typography variant="body2">{getRevocationReasonDescription(rCode)}</Typography>
                                                </Grid>
                                            </Grid>
                                        )
                                    };
                                })
                            } />
                        </Grid>
                    </Grid>
                </Grid>
            }
            actions={
                <Grid container spacing={2}>
                    <Grid xs md="auto">
                        <Button variant="contained" fullWidth onClick={async () => {
                            try {
                                await apicalls.cas.updateCertificateStatus(props.certificate.serial_number, CertificateStatus.Revoked, revokeReason);
                                props.onRevoke();
                                enqueueSnackbar(`Certificate with Serial Number ${props.certificate.serial_number} and CN ${props.certificate.subject.common_name} revoked`, { variant: "success" });
                                props.onClose();
                            } catch (err) {
                                enqueueSnackbar(`Error while revoking Certificate with Serial Number ${props.certificate.serial_number} and CN ${props.certificate.subject.common_name}: ${err}`, { variant: "error" });
                            }
                        }}>Revoke Certificate</Button>
                    </Grid>
                    <Grid xs="auto" md="auto">
                        <Button variant="text" onClick={() => { props.onClose(); }}>Close</Button>
                    </Grid>
                </Grid>
            }
        />
    );
};
