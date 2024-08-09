import React, { useEffect, useState } from "react";

import { Alert, Typography, useTheme } from "@mui/material";
import { CertificateAuthority } from "ducks/features/cas/models";
import { CodeCopier } from "components/CodeCopier";
import { FormSelect } from "components/forms/Select";
import { FormTextField } from "components/forms/Textfield";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import apicalls from "ducks/apicalls";

interface Props {
    caData: CertificateAuthority
}

type SignVerifyFormData = {
    sign: {
        message: string,
        messageTypeEncoding: "Base64" | "PlainText",
        messageType: "hash" | "raw"
        algorithm: "RSASSA_PSS_SHA_256" | "RSASSA_PSS_SHA_384" | "RSASSA_PSS_SHA_512" | "RSASSA_PKCS1_V1_5_SHA_256" | "RSASSA_PKCS1_V1_5_SHA_384" | "RSASSA_PKCS1_V1_5_SHA_512" | "ECDSA_SHA_256" | "ECDSA_SHA_384" | "ECDSA_SHA_512"
    },
    verify: {
        message: string,
        messageType: "hash" | "raw"
        messageTypeEncoding: "Base64" | "PlainText",
        algorithm: "RSASSA_PSS_SHA_256" | "RSASSA_PSS_SHA_384" | "RSASSA_PSS_SHA_512" | "RSASSA_PKCS1_V1_5_SHA_256" | "RSASSA_PKCS1_V1_5_SHA_384" | "RSASSA_PKCS1_V1_5_SHA_512" | "ECDSA_SHA_256" | "ECDSA_SHA_384" | "ECDSA_SHA_512"
        signature: string,
    }
};

export const SignVerifyView: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [isSignLoading, setIsSignLoading] = useState(false);
    const [signResult, setSignResult] = useState<string | undefined>();
    const [signError, setSignError] = useState<string | undefined>();
    const [warnSignInputPayload, setWarnSignInputPayload] = useState<string | undefined>();

    const [isVerifyLoading, setIsVerifyLoading] = useState(false);
    const [verifyResult, setVerifyResult] = useState<boolean | undefined>();
    const [verifyError, setVerifyError] = useState<string | undefined>();
    const [warnVerifyInputPayload, setWarnVerifyInputPayload] = useState<string | undefined>();

    const { control, setValue, reset, getValues, handleSubmit, formState: { errors }, watch } = useForm<SignVerifyFormData>({
        defaultValues: {
            sign: {
                messageType: "raw",
                messageTypeEncoding: "PlainText",
                algorithm: "RSASSA_PSS_SHA_256",
                message: ""
            },
            verify: {
                messageType: "raw",
                messageTypeEncoding: "PlainText",
                algorithm: "RSASSA_PSS_SHA_256",
                message: "",
                signature: ""
            }
        }
    });

    const watchSign = watch("sign");
    const watchVerify = watch("verify");

    useEffect(() => {
        if (watchSign.messageType === "hash") {
            let msg = watchSign.message;
            if (watchSign.messageTypeEncoding === "Base64") {
                try {
                    msg = window.atob(msg);
                    const splitAlg = watchSign.algorithm.split("_");
                    const shaAlgoLength = parseInt(splitAlg[splitAlg.length - 1]);
                    if (msg.length * 4 !== shaAlgoLength) {
                        setWarnSignInputPayload(`The payload is not a valid hash. Make sure to hash the data to sign with SHA${shaAlgoLength}`);
                    } else {
                        setWarnSignInputPayload(undefined);
                    }
                } catch (error) {
                    setWarnSignInputPayload("The payload is not a valid Base64. Make sure to encode the input in Base64 or switch to 'PlainText' encoding format");
                }
            }
        } else {
            if (watchSign.messageTypeEncoding === "Base64") {
                try {
                    window.atob(watchSign.message);
                    setWarnSignInputPayload(undefined);
                } catch (error) {
                    setWarnSignInputPayload("The payload is not a valid Base64. Make sure to encode the input in Base64 or switch to 'PlainText' encoding format");
                }
            } else {
                setWarnSignInputPayload(undefined);
            }
        }
    }, [watchSign.algorithm, watchSign.message, watchSign.messageTypeEncoding, watchSign.messageType]);

    useEffect(() => {
        if (watchVerify.messageType === "hash") {
            let msg = watchVerify.message;
            if (watchVerify.messageTypeEncoding === "Base64") {
                try {
                    msg = window.atob(msg);
                    const splitAlg = watchVerify.algorithm.split("_");
                    const shaAlgoLength = parseInt(splitAlg[splitAlg.length - 1]);
                    if (msg.length * 4 !== shaAlgoLength) {
                        setWarnVerifyInputPayload(`The payload is not a valid hash. Make sure to hash the data to sign with SHA${shaAlgoLength}`);
                    } else {
                        setWarnVerifyInputPayload(undefined);
                    }
                } catch (error) {
                    setWarnVerifyInputPayload("The payload is not a valid Base64. Make sure to encode the input in Base64 or switch to 'PlainText' encoding format");
                }
            }
        } else {
            if (watchVerify.messageTypeEncoding === "Base64") {
                try {
                    window.atob(watchVerify.message);
                    setWarnVerifyInputPayload(undefined);
                } catch (error) {
                    setWarnVerifyInputPayload("The payload is not a valid Base64. Make sure to encode the input in Base64 or switch to 'PlainText' encoding format");
                }
            } else {
                setWarnVerifyInputPayload(undefined);
            }
        }
    }, [watchVerify.algorithm, watchVerify.message, watchVerify.messageTypeEncoding, watchVerify.messageType]);

    const handleSignSubmit = handleSubmit(data => {
        const run = async () => {
            setSignResult(undefined);
            setSignError(undefined);
            try {
                setIsSignLoading(true);
                let msg = data.sign.message;
                if (data.sign.messageTypeEncoding === "PlainText") {
                    msg = window.btoa(msg);
                }
                const resp = await apicalls.cas.signPayload(caData.id, msg, data.sign.messageType, data.sign.algorithm);
                setSignResult(resp.signed_data);
            } catch (error) {
                if (typeof error === "string") {
                    setSignError(error);
                } else if (error instanceof Error) {
                    setSignError(error.message);
                } else {
                    setSignError("");
                }
            }
            setIsSignLoading(false);
        };

        run();
    });

    const handleVerifySubmit = handleSubmit(data => {
        const run = async () => {
            setVerifyError(undefined);
            setVerifyResult(undefined);
            try {
                setIsVerifyLoading(true);
                let msg = data.verify.message;
                if (data.verify.messageTypeEncoding === "PlainText") {
                    msg = window.btoa(msg);
                }
                const resp = await apicalls.cas.verifyPayload(caData.id, data.verify.signature, msg, data.verify.messageType, data.verify.algorithm);
                setVerifyResult(resp.valid);
            } catch (error) {
                if (typeof error === "string") {
                    setVerifyError(error);
                } else if (error instanceof Error) {
                    setVerifyError(error.message);
                } else {
                    setVerifyError("");
                }
            }
            setIsVerifyLoading(false);
        };

        run();
    });

    return (
        <Grid container spacing={"40px"}>
            <Grid xs={12} md>
                <form onSubmit={handleSignSubmit}>
                    <Grid container flexDirection={"column"} spacing={2}>
                        <Grid xs>
                            <Typography variant="h4">Sign</Typography>
                        </Grid>
                        <Grid xs>
                            <FormSelect control={control} name="sign.algorithm" label="Algorithm" options={[
                                { value: "RSASSA_PSS_SHA_256", render: "RSASSA_PSS_SHA_256" },
                                { value: "RSASSA_PSS_SHA_384", render: "RSASSA_PSS_SHA_384" },
                                { value: "RSASSA_PSS_SHA_512", render: "RSASSA_PSS_SHA_512" },
                                { value: "RSASSA_PKCS1_V1_5_SHA_256", render: "RSASSA_PKCS1_V1_5_SHA_256" },
                                { value: "RSASSA_PKCS1_V1_5_SHA_384", render: "RSASSA_PKCS1_V1_5_SHA_384" },
                                { value: "RSASSA_PKCS1_V1_5_SHA_512", render: "RSASSA_PKCS1_V1_5_SHA_512" },
                                { value: "ECDSA_SHA_256", render: "ECDSA_SHA_256" },
                                { value: "ECDSA_SHA_384", render: "ECDSA_SHA_384" },
                                { value: "ECDSA_SHA_512", render: "ECDSA_SHA_512" }
                            ]}/>
                        </Grid>
                        <Grid xs>
                            <FormSelect control={control} name="sign.messageType" label="Message Type"options={[
                                { value: "hash", render: "Hash" },
                                { value: "raw", render: "Raw" }
                            ]}/>
                        </Grid>
                        <Grid xs>
                            <FormSelect control={control} name="sign.messageTypeEncoding" label="Payload Encoding Format" options={[
                                { value: "PlainText", render: "Plain text" },
                                { value: "Base64", render: "Base64" }
                            ]}/>
                        </Grid>
                        <Grid xs>
                            <FormTextField label="Payload to Sign" control={control} name="sign.message" multiline rows={3} maxRows={5} />
                        </Grid>
                        <Grid xs>
                            <LoadingButton variant="contained" type="submit" loading={isSignLoading} disabled={warnSignInputPayload !== undefined}>Sign</LoadingButton>
                        </Grid>
                        {
                            warnSignInputPayload && (
                                <Grid>
                                    <Alert severity="warning">
                                        {warnSignInputPayload}
                                    </Alert>
                                </Grid>
                            )
                        }
                        <Grid xs>
                            {
                                !isSignLoading && (
                                    <>
                                        {
                                            signResult !== undefined && (
                                                <Alert severity="info">
                                                    Successfully signed payload (in Base64 encoding):
                                                    <CodeCopier code={signResult} />
                                                </Alert>
                                            )
                                        }
                                        {
                                            signError !== undefined && (
                                                <Alert severity="error">
                                                    Something went wrong: {signError}
                                                </Alert>

                                            )
                                        }
                                    </>
                                )
                            }
                        </Grid>
                    </Grid>
                </form>
            </Grid>
            <Grid xs>
                <form onSubmit={handleVerifySubmit}>
                    <Grid container flexDirection={"column"} spacing={2}>
                        <Grid xs>
                            <Typography variant="h4">Verify</Typography>
                        </Grid>
                        <Grid xs>
                            <FormSelect control={control} name="verify.algorithm" label="Algorithm" options={[
                                { value: "RSASSA_PSS_SHA_256", render: "RSASSA_PSS_SHA_256" },
                                { value: "RSASSA_PSS_SHA_384", render: "RSASSA_PSS_SHA_384" },
                                { value: "RSASSA_PSS_SHA_512", render: "RSASSA_PSS_SHA_512" },
                                { value: "RSASSA_PKCS1_V1_5_SHA_256", render: "RSASSA_PKCS1_V1_5_SHA_256" },
                                { value: "RSASSA_PKCS1_V1_5_SHA_384", render: "RSASSA_PKCS1_V1_5_SHA_384" },
                                { value: "RSASSA_PKCS1_V1_5_SHA_512", render: "RSASSA_PKCS1_V1_5_SHA_512" },
                                { value: "ECDSA_SHA_256", render: "ECDSA_SHA_256" },
                                { value: "ECDSA_SHA_384", render: "ECDSA_SHA_384" },
                                { value: "ECDSA_SHA_512", render: "ECDSA_SHA_512" }
                            ]}/>
                        </Grid>
                        <Grid xs>
                            <FormSelect control={control} name="verify.messageType" label="Message Type" options={[
                                { value: "hash", render: "Hash" },
                                { value: "raw", render: "Raw" }
                            ]}/>
                        </Grid>
                        <Grid xs>
                            <FormSelect control={control} name="verify.messageTypeEncoding" label="Unsigned Payload Encoding Format" options={[
                                { value: "PlainText", render: "Plain text" },
                                { value: "Base64", render: "Base64" }
                            ]}/>
                        </Grid>
                        <Grid xs>
                            <FormTextField label="Unsigned Payload" control={control} name="verify.message" multiline rows={3} maxRows={5} />
                        </Grid>

                        <Grid xs>
                            <FormTextField label="Signature" control={control} name="verify.signature" multiline rows={3} maxRows={5} />
                        </Grid>

                        <Grid xs>
                            <LoadingButton variant="contained" type="submit" loading={isVerifyLoading}>Verify</LoadingButton>
                        </Grid>

                        <Grid xs>
                            {
                                !isVerifyLoading && (
                                    <>
                                        {
                                            verifyResult !== undefined && (
                                                verifyResult === true
                                                    ? (
                                                        <Alert severity="info">
                                                            Successfully verified payload!
                                                        </Alert>
                                                    )
                                                    : (
                                                        <Alert severity="error">
                                                            Payload was not signed by this CA
                                                        </Alert>
                                                    )
                                            )
                                        }
                                        {
                                            verifyError !== undefined && (
                                                <Alert severity="error">
                                                    Something went wrong: {verifyError}
                                                </Alert>

                                            )
                                        }
                                    </>
                                )
                            }
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        </Grid>
    );
};
