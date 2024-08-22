import React, { useEffect, useState } from "react";
import { Alert, Box, FormControl, Typography, useTheme } from "@mui/material";
import { CloudEvent } from "cloudevents";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import { createSchema } from "genson-js";
import jsonschema from "jsonschema";
import { JSONPath } from "jsonpath-plus";
import { useAuth } from "react-oidc-context";
import { SubChannel, SubChannelType, SubscriptionCondition, SubscriptionConditionType } from "ducks/features/alerts/models";
import { Select } from "components/Select";
import { TextField } from "components/TextField";
import { StepModal } from "components/StepModal";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { Editor } from "@monaco-editor/react";
import { ChannelChip } from "./SubscriptionChip";
import apicalls from "ducks/apicalls";
import { enqueueSnackbar } from "notistack";

interface Props {
    event: CloudEvent,
    isOpen: boolean,
    onClose: ()=>void
    onSubscribe: ()=>void
}

export const SubscribeDialog: React.FC<Props> = ({ event, isOpen, onClose, ...rest }) => {
    const theme = useTheme();
    const auth = useAuth();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [disableNextStepBtn, setDisableNextStepBtn] = useState<boolean>(false);

    const [email, setEmail] = useState<string>();

    const [subscription, setSubscription] = useState<SubChannel>({ type: SubChannelType.Email, config: { email: "" } });

    const [selectedConditionType, setSelectedConditionType] = useState<SubscriptionConditionType | "None">("None");
    const [jsonFilter, setJsonFilter] = useState<string>("");

    const [isJsonFilterValid, setIsJsonFilterValid] = useState<boolean>(false);

    const fulfilsAddSubscriptionRules = (sub: SubChannel) => {
        switch (sub.type) {
        case SubChannelType.Email:
            if (sub.config.email !== "") {
                return true;
            }
            break;
        case SubChannelType.Webhook:
            if (sub.name !== "" && sub.config.webhook_url !== "" && sub.config.webhook_method !== "") {
                return true;
            }
            break;
        case SubChannelType.MsTeams:
            if (sub.name !== "" && sub.config.webhook_url !== "") {
                return true;
            }
            break;
        }

        return false;
    };

    const clean = () => {
        setCurrentStep(0);
        setJsonFilter("");
        setSelectedConditionType(SubscriptionConditionType.JsonPath);
        setSubscription({ type: SubChannelType.Email, config: { email: "" } });
    };

    const trySetEmail = () => {
        if (auth.user) {
            setEmail(auth.user.profile.email);
            if (auth.user.profile.email) {
                setSubscription({ type: SubChannelType.Email, config: { email: auth.user.profile.email } });
            } else {
                setSubscription({ type: SubChannelType.Email, config: { email: "" } });
            }
        } else {
            setSubscription({ type: SubChannelType.Email, config: { email: "" } });
        }
    };

    const resetSubType = (type: SubChannelType) => {
        switch (type) {
        case SubChannelType.Email:
            trySetEmail();
            break;
        case SubChannelType.Webhook:
            setSubscription({ type: SubChannelType.Webhook, name: "", config: { webhook_method: "POST", webhook_url: "" } });
            break;
        case SubChannelType.MsTeams:
            setSubscription({ type: SubChannelType.MsTeams, name: "", config: { webhook_url: "" } });
            break;
        default:
            break;
        }
    };

    useEffect(() => {
        const init = async () => {
            trySetEmail();
        };
        init();
    }, []);

    useEffect(() => {
        if (currentStep === 0) {
            setDisableNextStepBtn(!fulfilsAddSubscriptionRules(subscription));
        } else {
            setDisableNextStepBtn(false);
        }
    }, [currentStep, subscription]);

    useEffect(() => {
        if (selectedConditionType === SubscriptionConditionType.JsonSchema) {
            setJsonFilter(JSON.stringify(createSchema(event), null, 4));
        } else {
            setJsonFilter("$.data");
        }
    }, [selectedConditionType, event]);

    useEffect(() => {
        if (selectedConditionType === SubscriptionConditionType.JsonSchema) {
            try {
                setIsJsonFilterValid(jsonschema.validate(event, JSON.parse(jsonFilter)).valid);
            } catch (ex) { }
        } else if (selectedConditionType === SubscriptionConditionType.JsonPath) {
            try {
                setIsJsonFilterValid(JSONPath(jsonFilter, JSON.parse(JSON.stringify(event)), undefined, undefined).length > 0);
            } catch (ex) { }
        }
    }, [jsonFilter, selectedConditionType]);

    return (
        <StepModal open={isOpen} onClose={() => { clean(); onClose(); }} size={"md"} title={"Subscribe to event"} onFinish={async () => {
            let conditions: SubscriptionCondition[] = [];
            if (selectedConditionType !== "None") {
                conditions = [{ condition: jsonFilter, type: selectedConditionType }];
            }
            try {
                await apicalls.alerts.subscribe("_lms_system", event.type, conditions, subscription);
                enqueueSnackbar("Subscription created", { variant: "success" });
                clean();
                rest.onSubscribe();
                onClose();
            } catch (e) {
                enqueueSnackbar("Error creating subscription", { variant: "error" });
            }
        }} steps={[{
            title: "Channels",
            subtitle: "",
            content: (
                <Grid container columns={12} spacing={2}>
                    <Grid xs={12}>
                        <Select
                            fullWidth
                            label="Channel Type"
                            value={subscription.type}
                            // @ts-ignore
                            onChange={(ev) => {
                                // @ts-ignore
                                resetSubType(ev.target.value);
                            }}
                            options={[
                                {
                                    value: SubChannelType.Email,
                                    render: () => (
                                        <Grid sx={{ width: "100%" }} container spacing={2} alignItems={"center"}>
                                            <Grid xs="auto">
                                                <EmailOutlinedIcon />
                                            </Grid>
                                            <Grid xs>
                                                <Typography>Email Notification</Typography>
                                            </Grid>
                                        </Grid>
                                    )
                                },
                                {
                                    value: SubChannelType.MsTeams,
                                    render: () => (
                                        <Grid container spacing={2} alignItems={"center"}>
                                            <Grid xs="auto">
                                                <img src={process.env.PUBLIC_URL + "assets/msteams.png"} height="20px" />
                                            </Grid>
                                            <Grid xs>
                                                <Typography>Microsoft Teams Webhook</Typography>
                                            </Grid>
                                        </Grid>
                                    )
                                },
                                {
                                    value: SubChannelType.Webhook,
                                    render: () => (
                                        <Grid container spacing={2} alignItems={"center"}>
                                            <Grid xs="auto">
                                                <WebhookOutlinedIcon />
                                            </Grid>
                                            <Grid xs>
                                                <Typography>Webhook</Typography>
                                            </Grid>
                                        </Grid>
                                    )
                                }
                            ]}
                        />
                    </Grid>
                    {
                        subscription.type === SubChannelType.Email && (
                            <Grid xs={12}>
                                <TextField label="Email Address" fullWidth value={email} onChange={(ev) => setSubscription({ ...subscription, config: { email: ev.target.value.trim() } })} />
                            </Grid>
                        )
                    }
                    {
                        subscription.type === SubChannelType.MsTeams && (
                            <>
                                <Grid xs={12}>
                                    <TextField label="Name" fullWidth value={subscription.name} onChange={(ev) => setSubscription({ ...subscription, name: ev.target.value.trim() })} />
                                </Grid>
                                <Grid xs={12}>
                                    <TextField label="Incoming Microsoft Teams Webhook URL" fullWidth value={subscription.config.webhook_url} onChange={(ev) => setSubscription({ ...subscription, config: { ...subscription.config, webhook_url: ev.target.value.trim() } })} />
                                </Grid>
                            </>
                        )
                    }
                    {
                        subscription.type === SubChannelType.Webhook && (
                            <>
                                <Grid xs={12}>
                                    <TextField label="Name" fullWidth value={subscription.name} onChange={(ev) => setSubscription({ ...subscription, name: ev.target.value.trim() })} />
                                </Grid>
                                <Grid xs={12}>
                                    <FormControl fullWidth>
                                        <Select
                                            label="Method"
                                            value={subscription.config.webhook_method}
                                            // @ts-ignore
                                            onChange={(ev) => setSubscription({ ...subscription, config: { ...subscription.config, webhook_url: ev.target.value.trim() } })}
                                            options={[
                                                { value: "POST", render: "POST" },
                                                { value: "PUT", render: "PUT" }
                                            ]}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid xs={12}>
                                    <TextField label="Webhook URL" fullWidth value={subscription.config.webhook_url} onChange={(ev) => setSubscription({ ...subscription, config: { ...subscription.config, webhook_url: ev.target.value.trim() } })} />
                                </Grid>
                            </>
                        )
                    }
                </Grid>
            )
        },
        {
            title: "Filters and Conditions (optional)",
            subtitle: "",
            content: (
                <Grid xs={12} container spacing={2}>
                    <Grid xs={12}>
                        <Select
                            fullWidth
                            label="Filter or Condition Format"
                            value={selectedConditionType}
                            // @ts-ignore
                            onChange={(select) => setSelectedConditionType(select.target.value)}
                            options={[
                                { value: "None", render: () => <i>None</i> },
                                { value: SubscriptionConditionType.JsonSchema, render: "JSON Schema" },
                                { value: SubscriptionConditionType.JsonPath, render: "JSON Path" }
                            ]}
                        />
                    </Grid>
                    {
                        selectedConditionType !== "None" && (
                            <>
                                {
                                    selectedConditionType === SubscriptionConditionType.JsonSchema
                                        ? (
                                            <Grid xs={12}>
                                                <Box sx={{ minHeight: "100px" }}>
                                                    <TextField
                                                        label="JSON Schema"
                                                        multiline
                                                        fullWidth
                                                        value={jsonFilter}
                                                        inputProps={{
                                                            spellCheck: false,
                                                            style: {
                                                                fontFamily: "\"Fira code\", \"Fira Mono\", monospace",
                                                                fontSize: 12,
                                                                lineHeight: 1
                                                            }
                                                        }}
                                                        onChange={(ev) => setJsonFilter(ev.target.value.trim())}
                                                    />

                                                </Box>
                                            </Grid>
                                        )
                                        : (
                                            <Grid xs={12}>
                                                <TextField label="JSON Path Expression" fullWidth value={jsonFilter} onChange={(ev) => setJsonFilter(ev.target.value.trim())} />
                                            </Grid>
                                        )
                                }
                                <Grid xs={12} container spacing={2} sx={{ padding: "15px" }}>
                                    <Grid xs={12} md={6} container>
                                        <Grid xs={12}>
                                            <Typography fontWeight={500}>Input Event</Typography>
                                        </Grid>
                                        <Grid xs={12} >
                                            <Editor
                                                theme="vs-dark"
                                                defaultLanguage="json"
                                                height="50vh"
                                                value={JSON.stringify(event, null, 4)}
                                                defaultValue="{}"
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid xs={12} md={6} container direction="column">
                                        <Grid xs="auto">
                                            <Typography fontWeight={500}>Evaluation Result</Typography>
                                        </Grid>
                                        <Grid xs container>
                                            <Grid xs>
                                                {
                                                    isJsonFilterValid
                                                        ? (
                                                            <Alert severity="success">
                                                                The filter matches this Cloud Event
                                                            </Alert>
                                                        )
                                                        : (
                                                            <Alert severity="error">
                                                                The filter does not match this Cloud Event
                                                            </Alert>
                                                        )
                                                }
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </>
                        )
                    }
                </Grid>
            )
        },
        {
            title: "Confirmation",
            subtitle: "",
            content: (
                <Grid xs={12} container spacing={2}>
                    <Grid xs={12} container spacing={2} alignItems={"center"}>
                        <Grid xs={12}>
                            <Typography>Channel</Typography>
                        </Grid>
                        <Grid xs={12}>
                            <ChannelChip channel={subscription} onClick={(sub) => { }} />
                        </Grid>
                    </Grid>
                    {
                        selectedConditionType !== "None" && (
                            <>
                                <Grid xs={12}>
                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs="auto">
                                            <Typography variant="button">Filter Format:</Typography>
                                        </Grid>
                                        <Grid xs="auto">
                                            <Typography variant="button" style={{ padding: 5, fontSize: 12 }}>{selectedConditionType}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid xs={12}>
                                    <Grid xs={12} container spacing={2}>
                                        <Grid xs="auto">
                                            <Typography variant="button">Filter Expression:</Typography>
                                        </Grid>
                                        {
                                            selectedConditionType === SubscriptionConditionType.JsonSchema && (
                                                <Grid xs={12}>
                                                    <Editor
                                                        theme="vs-dark"
                                                        defaultLanguage="json"
                                                        height="50vh"
                                                        value={JSON.stringify(JSON.parse(jsonFilter), null, 4)}
                                                        defaultValue="{}"
                                                    />
                                                </Grid>
                                            )
                                        }
                                        {
                                            selectedConditionType === SubscriptionConditionType.JsonPath && (
                                                <Grid xs="auto">
                                                    <Typography variant="button" style={{ padding: 5, fontSize: 12 }}>{jsonFilter}</Typography>
                                                </Grid>
                                            )
                                        }
                                    </Grid>
                                </Grid>
                            </>
                        )
                    }
                </Grid>
            )
        }
        ]} />
    );
};
