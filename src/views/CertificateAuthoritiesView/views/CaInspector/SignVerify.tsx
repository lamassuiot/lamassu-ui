import React, { useEffect, useState } from "react";

import { Alert, Grid, MenuItem, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { useForm } from "react-hook-form";
import * as caApiCalls from "ducks/features/cas/apicalls";
import { LoadingButton } from "@mui/lab";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { CertificateAuthority } from "ducks/features/cas/models";

interface Props {
    caData: CertificateAuthority
}

type SignVerifyFormData = {
    sign: {
        message: string,
        messageTypeEncoding: "Base64" | "PlainText",
        messageType: "HASH" | "RAW"
        algorithm: "RSASSA_PSS_SHA_256" | "RSASSA_PSS_SHA_384" | "RSASSA_PSS_SHA_512" | "RSASSA_PKCS1_V1_5_SHA_256" | "RSASSA_PKCS1_V1_5_SHA_384" | "RSASSA_PKCS1_V1_5_SHA_512" | "ECDSA_SHA_256" | "ECDSA_SHA_384" | "ECDSA_SHA_512"
    },
    verify: {
        message: string,
        messageType: "HASH" | "RAW"
        messageTypeEncoding: "Base64" | "PlainText",
        algorithm: "RSASSA_PSS_SHA_256" | "RSASSA_PSS_SHA_384" | "RSASSA_PSS_SHA_512" | "RSASSA_PKCS1_V1_5_SHA_256" | "RSASSA_PKCS1_V1_5_SHA_384" | "RSASSA_PKCS1_V1_5_SHA_512" | "ECDSA_SHA_256" | "ECDSA_SHA_384" | "ECDSA_SHA_512"
        signature: string,
    }
};

export const SignVerifyView: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
                messageType: "HASH",
                messageTypeEncoding: "PlainText",
                algorithm: "RSASSA_PSS_SHA_256",
                message: ""
            },
            verify: {
                messageType: "HASH",
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
        if (watchSign.messageType === "HASH") {
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
        if (watchVerify.messageType === "HASH") {
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
                const resp = await caApiCalls.signPayload(caData.name, msg, data.sign.messageType, data.sign.algorithm);
                setSignResult(resp.signature);
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
                const resp = await caApiCalls.verifyPayload(caData.name, data.verify.signature, msg, data.verify.messageType, data.verify.algorithm);
                setVerifyResult(resp.verification);
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
            <Grid item xs>
                <form onSubmit={handleSignSubmit}>
                    <Grid container flexDirection={"column"} spacing={2}>
                        <Grid item xs>
                            <SubsectionTitle>Sign</SubsectionTitle>
                        </Grid>
                        <Grid item xs>
                            <FormSelect control={control} name="sign.algorithm" label="Algorithm">
                                <MenuItem value={"RSASSA_PSS_SHA_256"}>RSASSA_PSS_SHA_256</MenuItem>
                                <MenuItem value={"RSASSA_PSS_SHA_384"}>RSASSA_PSS_SHA_384</MenuItem>
                                <MenuItem value={"RSASSA_PSS_SHA_512"}>RSASSA_PSS_SHA_512</MenuItem>
                                <MenuItem value={"RSASSA_PKCS1_V1_5_SHA_256"}>RSASSA_PKCS1_V1_5_SHA_256</MenuItem>
                                <MenuItem value={"RSASSA_PKCS1_V1_5_SHA_384"}>RSASSA_PKCS1_V1_5_SHA_384</MenuItem>
                                <MenuItem value={"RSASSA_PKCS1_V1_5_SHA_512"}>RSASSA_PKCS1_V1_5_SHA_512</MenuItem>
                                <MenuItem value={"ECDSA_SHA_256"}>ECDSA_SHA_256</MenuItem>
                                <MenuItem value={"ECDSA_SHA_384"}>ECDSA_SHA_384</MenuItem>
                                <MenuItem value={"ECDSA_SHA_512"}>ECDSA_SHA_512</MenuItem>
                            </FormSelect>
                        </Grid>
                        <Grid item xs>
                            <FormSelect control={control} name="sign.messageType" label="Message Type">
                                <MenuItem value={"HASH"}>Hash</MenuItem>
                                <MenuItem value={"RAW"}>Raw</MenuItem>
                            </FormSelect>
                        </Grid>
                        <Grid item xs>
                            <FormSelect control={control} name="sign.messageTypeEncoding" label="Payload Encoding Format">
                                <MenuItem value={"PlainText"}>Plain text</MenuItem>
                                <MenuItem value={"Base64"}>Base64</MenuItem>
                            </FormSelect>
                        </Grid>
                        <Grid item xs>
                            <FormTextField label="Payload to Sign" control={control} name="sign.message" multiline rows={1} />
                        </Grid>
                        <Grid item xs>
                            <LoadingButton variant="contained" type="submit" loading={isSignLoading} disabled={warnSignInputPayload !== undefined}>Sign</LoadingButton>
                        </Grid>
                        {
                            warnSignInputPayload && (
                                <Grid item>
                                    <Alert severity="warning">
                                        {warnSignInputPayload}
                                    </Alert>
                                </Grid>
                            )
                        }
                        <Grid item xs>
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
            <Grid item xs>
                <form onSubmit={handleVerifySubmit}>
                    <Grid container flexDirection={"column"} spacing={2}>
                        <Grid item xs>
                            <SubsectionTitle>Verify</SubsectionTitle>
                        </Grid>
                        <Grid item xs>
                            <FormSelect control={control} name="verify.algorithm" label="Algorithm">
                                <MenuItem value={"RSASSA_PSS_SHA_256"}>RSASSA_PSS_SHA_256</MenuItem>
                                <MenuItem value={"RSASSA_PSS_SHA_384"}>RSASSA_PSS_SHA_384</MenuItem>
                                <MenuItem value={"RSASSA_PSS_SHA_512"}>RSASSA_PSS_SHA_512</MenuItem>
                                <MenuItem value={"RSASSA_PKCS1_V1_5_SHA_256"}>RSASSA_PKCS1_V1_5_SHA_256</MenuItem>
                                <MenuItem value={"RSASSA_PKCS1_V1_5_SHA_384"}>RSASSA_PKCS1_V1_5_SHA_384</MenuItem>
                                <MenuItem value={"RSASSA_PKCS1_V1_5_SHA_512"}>RSASSA_PKCS1_V1_5_SHA_512</MenuItem>
                                <MenuItem value={"ECDSA_SHA_256"}>ECDSA_SHA_256</MenuItem>
                                <MenuItem value={"ECDSA_SHA_384"}>ECDSA_SHA_384</MenuItem>
                                <MenuItem value={"ECDSA_SHA_512"}>ECDSA_SHA_512</MenuItem>
                            </FormSelect>
                        </Grid>
                        <Grid item xs>
                            <FormSelect control={control} name="verify.messageType" label="Message Type">
                                <MenuItem value={"HASH"}>Hash</MenuItem>
                                <MenuItem value={"RAW"}>Raw</MenuItem>
                            </FormSelect>
                        </Grid>
                        <Grid item xs>
                            <FormSelect control={control} name="verify.messageTypeEncoding" label="Unsigned Payload Encoding Format">
                                <MenuItem value={"PlainText"}>Plain text</MenuItem>
                                <MenuItem value={"Base64"}>Base64</MenuItem>
                            </FormSelect>
                        </Grid>
                        <Grid item xs>
                            <FormTextField label="Unsigned Payload" control={control} name="verify.message" multiline minRows={1} />
                        </Grid>

                        <Grid item xs>
                            <FormTextField label="Signature" control={control} name="verify.signature" multiline minRows={1} />
                        </Grid>

                        <Grid item xs>
                            <LoadingButton variant="contained" type="submit" loading={isVerifyLoading}>Verify</LoadingButton>
                        </Grid>

                        <Grid item xs>
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
