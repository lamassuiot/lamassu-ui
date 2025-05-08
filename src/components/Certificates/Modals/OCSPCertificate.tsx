import { Box, Button } from "@mui/material";
import { Certificate } from "ducks/features/cas/models";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { fromPEM } from "utils/crypto/x509";
import { StepModal } from "components/StepModal";
import apicalls from "ducks/apicalls";

interface Props {
    certificate: Certificate
    open: boolean
    onClose: () => void
}

export const OCSPCertificateVerificationModal = (props: Props) => {
    const toPKIJSCertificate = (certB64EncPEM: string) => {
        const certPEM = atob(certB64EncPEM);
        const raw = fromPEM(certPEM);
        return pkijs.Certificate.fromBER(raw);
    };

    const createRequest = async () => {
        console.log("ocsp request");
        const issuer = await apicalls.cas.getCA(props.certificate.issuer_metadata.id);
        const issuerCert = toPKIJSCertificate(issuer.certificate.certificate);
        const crt = toPKIJSCertificate(props.certificate.certificate);

        // Code extracted from: https://pkijs.org/docs/examples/certificates-and-revocation/working-with-OCSP-requests
        // Create OCSP request
        const ocspReq = new pkijs.OCSPRequest();

        ocspReq.tbsRequest.requestorName = new pkijs.GeneralName({
            type: 4,
            value: crt.subject
        });

        await ocspReq.createForCertificate(crt, {
            hashAlgorithm: "SHA-256",
            issuerCertificate: issuerCert
        });

        const nonce = pkijs.getRandomValues(new Uint8Array(10));
        ocspReq.tbsRequest.requestExtensions = [
            new pkijs.Extension({
                extnID: "1.3.6.1.5.5.7.48.1.2", // nonce
                extnValue: new asn1js.OctetString({ valueHex: nonce.buffer }).toBER()
            })
        ];

        // Encode OCSP request
        const ocspReqRaw = ocspReq.toSchema(true);

        console.log(ocspReqRaw.toString());
        console.log(ocspReqRaw.toJSON());
        console.log(ocspReqRaw.toBER());

        // Send OCSP request to OCSP server
        const ocspRawResp = await fetch("https://lab.lamassu.io/api/va/ocsp", {
            body: ocspReqRaw.toBER(false),
            headers: {
                "Content-Type": "application/ocsp-request"
            },
            method: "POST"
        });
        console.log(ocspRawResp);
    };

    createRequest();

    return (
        <StepModal
            title={`OCSP: Validate certificate ${props.certificate.serial_number}`}
            open={props.open}
            onClose={() => { props.onClose(); }}
            onFinish={() => { props.onClose(); }}
            steps={[
                {
                    title: "Create OCSP request 2",
                    subtitle: "",
                    content: (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid>
                                    <Button variant="contained" color="primary" onClick={createRequest}>
                                        Create OCSP request 1
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )
                }
            ]}
        />);
};
