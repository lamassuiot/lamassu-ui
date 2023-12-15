import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stepper, Step, StepLabel, FormControl, Grid, MenuItem, Typography, useTheme, Alert } from "@mui/material";
import { CloudEvent } from "cloudevents";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import { useDispatch } from "react-redux";
import { createSchema } from "genson-js";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import jsonschema from "jsonschema";
import { JSONPath } from "jsonpath-plus";
import { ColoredButton } from "components/LamassuComponents/ColoredButton";
import { useAuth } from "react-oidc-context";
import { Select } from "components/LamassuComponents/dui/Select";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { apicalls } from "ducks/apicalls";
import { SubChannel, SubChannelType, SubscriptionCondition, SubscriptionConditionType } from "ducks/features/alerts/models";
import { ChannelChip } from "./SubscriptionChip";
import { actions } from "ducks/actions";

interface Props {
    event: CloudEvent | undefined,
    isOpen: boolean,
    onClose: any
}

export const SubscribeDialog: React.FC<Props> = ({ event, isOpen, onClose }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
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

    const steps = [
        "Channels",
        "Filters and Conditions (optional)",
        "Confirmation"
    ];

    return (
        <Dialog open={isOpen} onClose={() => { clean(); onClose(); }} maxWidth={"md"} fullWidth>
            {
                event && (
                    <>
                        <DialogTitle>Subscribe to event: {event.type}</DialogTitle>
                        <DialogContent>
                            <Stepper activeStep={currentStep} alternativeLabel>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                            <Grid container style={{ marginTop: "10px" }} spacing={2} rowGap={4}>
                                {
                                    currentStep === 0 && (
                                        <>
                                            <Grid item xs={12} container spacing={2}>
                                                <Grid item xs={12}>
                                                    <FormControl fullWidth>
                                                        <Select
                                                            label="Channel Type"
                                                            value={subscription.type}
                                                            // @ts-ignore
                                                            onChange={(ev) => {
                                                                // @ts-ignore
                                                                resetSubType(ev.target.value);
                                                            }}
                                                        >
                                                            <MenuItem value={SubChannelType.Email}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs="auto">
                                                                        <EmailOutlinedIcon />
                                                                    </Grid>
                                                                    <Grid item xs>
                                                                        <Typography>Email Notification</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </MenuItem>
                                                            <MenuItem value={SubChannelType.MsTeams}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs="auto">
                                                                        <img src={process.env.PUBLIC_URL + "assets/msteams.png"} height="20px" />
                                                                    </Grid>
                                                                    <Grid item xs>
                                                                        <Typography>Microsoft Teams Webhook</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </MenuItem>
                                                            <MenuItem value={SubChannelType.Webhook}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs="auto">
                                                                        <WebhookOutlinedIcon />
                                                                    </Grid>
                                                                    <Grid item xs>
                                                                        <Typography>Webhook</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                {
                                                    subscription.type === SubChannelType.Email && (
                                                        <Grid item xs={12}>
                                                            <TextField label="Email Address" fullWidth value={email} onChange={(ev) => setSubscription({ ...subscription, config: { email: ev.target.value.trim() } })} />
                                                        </Grid>
                                                    )
                                                }
                                                {
                                                    subscription.type === SubChannelType.MsTeams && (
                                                        <>
                                                            <Grid item xs={12}>
                                                                <TextField label="Name" fullWidth value={subscription.name} onChange={(ev) => setSubscription({ ...subscription, name: ev.target.value.trim() })} />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField label="Incoming Microsoft Teams Webhook URL" fullWidth value={subscription.config.webhook_url} onChange={(ev) => setSubscription({ ...subscription, config: { ...subscription.config, webhook_url: ev.target.value.trim() } })} />
                                                            </Grid>
                                                        </>
                                                    )
                                                }
                                                {
                                                    subscription.type === SubChannelType.Webhook && (
                                                        <>
                                                            <Grid item xs={12}>
                                                                <TextField label="Name" fullWidth value={subscription.name} onChange={(ev) => setSubscription({ ...subscription, name: ev.target.value.trim() })} />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <FormControl fullWidth>
                                                                    <Select
                                                                        label="Method"
                                                                        value={subscription.config.webhook_method}
                                                                        // @ts-ignore
                                                                        onChange={(ev) => setSubscription({ ...subscription, config: { ...subscription.config, webhook_url: ev.target.value.trim() } })}
                                                                    >
                                                                        <MenuItem value="POST">POST</MenuItem>
                                                                        <MenuItem value="PUT">PUT</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField label="Webhook URL" fullWidth value={subscription.config.webhook_url} onChange={(ev) => setSubscription({ ...subscription, config: { ...subscription.config, webhook_url: ev.target.value.trim() } })} />
                                                            </Grid>
                                                        </>
                                                    )
                                                }
                                            </Grid>
                                        </>
                                    )
                                }
                                {
                                    currentStep === 1 && (
                                        <Grid item xs={12} container spacing={2}>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth>
                                                    <Select
                                                        label="Filter or Condition Format"
                                                        value={selectedConditionType}
                                                        // @ts-ignore
                                                        onChange={(select) => setSelectedConditionType(select.target.value)}
                                                    >
                                                        <MenuItem value={"None"}><i>None</i></MenuItem>
                                                        <MenuItem value={SubscriptionConditionType.JsonSchema}>JSON Schema</MenuItem>
                                                        <MenuItem value={SubscriptionConditionType.JsonPath}>JSON Path</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            {
                                                selectedConditionType !== "None" && (
                                                    <>
                                                        {
                                                            selectedConditionType === SubscriptionConditionType.JsonSchema
                                                                ? (
                                                                    <Grid item xs={12}>
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
                                                                    <Grid item xs={12}>
                                                                        <TextField label="JSON Path Expression" fullWidth value={jsonFilter} onChange={(ev) => setJsonFilter(ev.target.value.trim())} />
                                                                    </Grid>
                                                                )
                                                        }
                                                        <Grid item xs={12} container marginTop={"25px"} spacing={2}>
                                                            <Grid item xs={6} container direction="column">
                                                                <Grid item xs="auto">
                                                                    <Typography fontWeight={500}>Input Event</Typography>
                                                                </Grid>
                                                                <Grid item xs container>
                                                                    <Grid item xs>
                                                                        <SyntaxHighlighter wrapLongLines={true} language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 12, padding: 20, borderRadius: 10, width: "100", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight, wordBreak: "break-all", whiteSpace: "pre-wrap" } }}>
                                                                            {JSON.stringify(event, null, 4)}
                                                                        </SyntaxHighlighter>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item xs={6} container direction="column">
                                                                <Grid item xs="auto">
                                                                    <Typography fontWeight={500}>Evaluation Result</Typography>
                                                                </Grid>
                                                                <Grid item xs container>
                                                                    <Grid item xs>
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
                                }
                                {
                                    currentStep === 2 && (
                                        <Grid item xs={12} container spacing={2}>
                                            <Grid item xs={12} container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography>Channel</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <ChannelChip channel={subscription} onClick={(sub) => { }} />
                                                </Grid>
                                            </Grid>
                                            {
                                                selectedConditionType !== "None" && (
                                                    <>
                                                        <Grid item xs={12}>
                                                            <Grid item xs={12} container spacing={2}>
                                                                <Grid item xs="auto">
                                                                    <Typography variant="button">Filter Format:</Typography>
                                                                </Grid>
                                                                <Grid item xs="auto">
                                                                    <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{selectedConditionType}</Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Grid item xs={12} container spacing={2}>
                                                                <Grid item xs="auto">
                                                                    <Typography variant="button">Filter Expression:</Typography>
                                                                </Grid>
                                                                {
                                                                    selectedConditionType === SubscriptionConditionType.JsonSchema && (
                                                                        <Grid item xs={12}>
                                                                            <SyntaxHighlighter wrapLongLines={true} language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 12, padding: 20, borderRadius: 10, width: "100", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight, wordBreak: "break-all", whiteSpace: "pre-wrap" } }}>
                                                                                {JSON.stringify(JSON.parse(jsonFilter), null, 4)}
                                                                            </SyntaxHighlighter>
                                                                        </Grid>
                                                                    )
                                                                }
                                                                {
                                                                    selectedConditionType === SubscriptionConditionType.JsonPath && (
                                                                        <Grid item xs="auto">
                                                                            <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{jsonFilter}</Typography>
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
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Grid container>
                                <Grid item xs>
                                    <Button onClick={() => { clean(); onClose(); }} variant="text">Cancel</Button>
                                </Grid>
                                <Grid item xs="auto" container spacing={2}>
                                    <Grid item xs="auto">
                                        <Button disabled={currentStep === 0} onClick={() => { setCurrentStep(currentStep - 1); }} variant="text">Previous</Button>
                                    </Grid>
                                    <Grid item xs="auto">
                                        {
                                            currentStep < steps.length - 1
                                                ? (
                                                    <ColoredButton
                                                        customtextcolor={theme.palette.primary.main}
                                                        customcolor={theme.palette.primary.light}
                                                        disabled={disableNextStepBtn}
                                                        onClick={() => {
                                                            setCurrentStep(currentStep + 1);
                                                        }}>
                                                        Next
                                                    </ColoredButton>
                                                )
                                                : (

                                                    <Button onClick={async () => {
                                                        let conditions: SubscriptionCondition[] = [];
                                                        if (selectedConditionType !== "None") {
                                                            conditions = [{ condition: jsonFilter, type: selectedConditionType }];
                                                        }
                                                        try {
                                                            await apicalls.alerts.subscribe("_lms_system", event.type, conditions, subscription);
                                                            // dispatch(eventsActions.subscribeAction.request({ eventType: event.type, channels: channels, condition_type: selectedConditionType, conditions: [jsonFilter] }));
                                                            clean();
                                                            dispatch(actions.alertsActions.getSubscriptions.request("_lms_system"));
                                                        } catch (e) {

                                                        }
                                                        onClose();
                                                    }} variant="contained">Subscribe</Button>
                                                )
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </DialogActions>
                    </>
                )
            }
        </Dialog >
    );
};
