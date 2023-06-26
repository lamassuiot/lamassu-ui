import React, { useEffect, useState } from "react";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stepper, Step, StepLabel, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, useTheme } from "@mui/material";
import { CloudEvent } from "cloudevents";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import { useDispatch } from "react-redux";
import * as eventsActions from "ducks/features/alerts/actions";
import { createSchema } from "genson-js";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import { getColor } from "components/utils/lamassuColors";
import jsonschema from "jsonschema";
import { JSONPath } from "jsonpath-plus";
import { ColoredButton } from "components/LamassuComponents/ColoredButton";
import { useAuth } from "react-oidc-context";

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

    const [channels, setChannels] = useState<Array<any>>([]);

    const [selectedChannelType, setSelectedChannelType] = useState<string>("email");
    const [selectedSubscriptionName, setSelectedSubscriptionName] = useState<string>("email");
    const [selectedSubscriptionConfig, setSelectedSubscriptionConfig] = useState<any>({});

    const [selectedConditionType, setSelectedConditionType] = useState<string>("json_schema");
    const [jsonFilter, setJsonFilter] = useState<string>("");

    const [isJsonFilterValid, setIsJsonFilterValid] = useState<boolean>(false);

    const fulfilsAddSubscriptionRules = (subType: any) => {
        if (selectedSubscriptionName === "") {
            return false;
        }
        switch (subType) {
        case "email":
            if (selectedSubscriptionConfig.email_address && selectedSubscriptionConfig.email_address !== "") {
                return true;
            }
            break;
        case "webhook":
            if (selectedSubscriptionConfig.webhook_url && selectedSubscriptionConfig.webhook_url !== "" && selectedSubscriptionConfig.webhook_method && selectedSubscriptionConfig.webhook_method !== "") {
                return true;
            }
            break;
        case "msteams":
            if (selectedSubscriptionConfig.webhook_url && selectedSubscriptionConfig.webhook_url !== "") {
                return true;
            }
            break;

        default:
            break;
        }
        return false;
    };

    const clean = () => {
        setCurrentStep(0);
        setJsonFilter("");
        setSelectedConditionType("json_schema");
        setChannels([]);
    };

    useEffect(() => {
        const init = async () => {
            if (auth.user) {
                setEmail(auth.user.profile.email);
                if (selectedChannelType === "email") {
                    setSelectedSubscriptionConfig({ email_address: auth.user.profile.email });
                }
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (currentStep === 0 && channels.length === 0) {
            setDisableNextStepBtn(true);
        } else {
            setDisableNextStepBtn(false);
        }
    }, [currentStep, channels]);

    useEffect(() => {
        setSelectedSubscriptionName(
            selectedChannelType
        );
        if (selectedChannelType === "email") {
            setSelectedSubscriptionConfig({
                email_address: email
            });
        } else {
            setSelectedSubscriptionConfig({});
        }
    }, [selectedChannelType]);

    useEffect(() => {
        if (selectedConditionType === "json_schema") {
            setJsonFilter(JSON.stringify(createSchema(event), null, 4));
        } else {
            setJsonFilter("$.data");
        }
    }, [selectedConditionType, event]);

    useEffect(() => {
        if (selectedConditionType === "json_schema") {
            try {
                setIsJsonFilterValid(jsonschema.validate(event, JSON.parse(jsonFilter)).valid);
            } catch (ex) { }
        } else {
            try {
                setIsJsonFilterValid(JSONPath(jsonFilter, JSON.parse(JSON.stringify(event)), undefined, undefined).length > 0);
            } catch (ex) { }
        }
    }, [jsonFilter]);

    const steps = [
        "Channels",
        "Filters and Conditions (optional)",
        "Confirmation"
    ];

    const renderAddedChannels = () => {
        return (
            channels.map((subscription, index) => {
                let icon = <></>;
                if (subscription.type === "email") {
                    icon = <EmailOutlinedIcon />;
                } else if (subscription.type === "msteams") {
                    icon = <img src={process.env.PUBLIC_URL + "assets/msteams.png"} height="18px" />;
                } else if (subscription.type === "webhook") {
                    icon = <WebhookOutlinedIcon />;
                }

                return (
                    <Chip key={index} icon={icon} label={subscription.name} onDelete={() => {
                        setChannels(channels.filter(s => s.name !== subscription.name));
                    }} />
                );
            })
        );
    };

    return (
        <Dialog open={isOpen} onClose={() => { clean(); onClose(); }} maxWidth={"lg"}>
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
                                                    <FormControl variant="standard" fullWidth>
                                                        <InputLabel>Channel Type</InputLabel>
                                                        <Select
                                                            value={selectedChannelType}
                                                            onChange={(select) => setSelectedChannelType(select.target.value)}
                                                        >
                                                            <MenuItem value="email">
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs="auto">
                                                                        <EmailOutlinedIcon />
                                                                    </Grid>
                                                                    <Grid item xs>
                                                                        <Typography>Email Notification</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </MenuItem>
                                                            <MenuItem value="msteams">
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs="auto">
                                                                        <img src={process.env.PUBLIC_URL + "assets/msteams.png"} height="20px" />
                                                                    </Grid>
                                                                    <Grid item xs>
                                                                        <Typography>Microsoft Teams Webhook</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </MenuItem>
                                                            <MenuItem value="webhook">
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
                                                    selectedChannelType === "email" && (
                                                        <Grid item xs={12}>
                                                            <TextField label="Email Address" disabled variant="standard" fullWidth value={email} />
                                                        </Grid>
                                                    )
                                                }
                                                {
                                                    selectedChannelType === "msteams" && (
                                                        <>
                                                            <Grid item xs={12}>
                                                                <TextField label="Name" variant="standard" fullWidth value={selectedSubscriptionName} onChange={(ev) => setSelectedSubscriptionName(ev.target.value.trim())} />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField label="Incoming Microsoft Teams Webhook URL" variant="standard" fullWidth value={selectedSubscriptionConfig.webhook_url} onChange={(ev) => setSelectedSubscriptionConfig((prev: any) => { return { ...prev, webhook_url: ev.target.value.trim() }; })} />
                                                            </Grid>
                                                        </>
                                                    )
                                                }
                                                {
                                                    selectedChannelType === "webhook" && (
                                                        <>
                                                            <Grid item xs={12}>
                                                                <TextField label="Name" variant="standard" fullWidth value={selectedSubscriptionName} onChange={(ev) => setSelectedSubscriptionName(ev.target.value.trim())} />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <FormControl variant="standard" fullWidth>
                                                                    <InputLabel>Method</InputLabel>
                                                                    <Select
                                                                        value={selectedSubscriptionConfig.webhook_method}
                                                                        onChange={(ev) => setSelectedSubscriptionConfig((prev: any) => { return { ...prev, webhook_method: ev.target.value }; })}
                                                                    >
                                                                        <MenuItem value="POST">POST</MenuItem>
                                                                        <MenuItem value="PUT">PUT</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <TextField label="Webhook URL" variant="standard" fullWidth value={selectedSubscriptionConfig.webhook_url} onChange={(ev) => setSelectedSubscriptionConfig((prev: any) => { return { ...prev, webhook_url: ev.target.value.trim() }; })} />
                                                            </Grid>
                                                        </>
                                                    )
                                                }
                                                <Grid item xs={12}>
                                                    <ColoredButton customtextcolor={theme.palette.primary.main} customcolor={theme.palette.primary.light} variant="contained" color="primary" disabled={!fulfilsAddSubscriptionRules(selectedChannelType)} onClick={() => {
                                                        const subs = channels.filter(s => s.name !== selectedSubscriptionName);
                                                        setChannels([...subs, {
                                                            type: selectedChannelType,
                                                            name: selectedSubscriptionName,
                                                            config: selectedSubscriptionConfig
                                                        }]);
                                                    }} >
                                                        Add Channel
                                                    </ColoredButton>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <DialogContentText>
                                                    Channels
                                                </DialogContentText>
                                                <Stack direction="row" spacing={1}>
                                                    {
                                                        renderAddedChannels()
                                                    }
                                                </Stack>
                                            </Grid>
                                        </>
                                    )
                                }
                                {
                                    currentStep === 1 && (
                                        <Grid item xs={12} container spacing={2}>
                                            <Grid item xs={12}>
                                                <FormControl variant="standard" fullWidth>
                                                    <InputLabel>Filter or Condition Format</InputLabel>
                                                    <Select
                                                        value={selectedConditionType}
                                                        onChange={(select) => setSelectedConditionType(select.target.value)}
                                                    >
                                                        <MenuItem value="json_schema">JSON Schema</MenuItem>
                                                        <MenuItem value="json_path">JSON Path</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            {
                                                selectedConditionType === "json_schema"
                                                    ? (
                                                        <Grid item xs={12}>
                                                            <Box sx={{ minHeight: "100px" }}>
                                                                <TextField
                                                                    label="JSON Schema"
                                                                    multiline
                                                                    fullWidth
                                                                    variant="outlined"
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
                                                            <TextField label="JSON Path Expression" variant="standard" fullWidth value={jsonFilter} onChange={(ev) => setJsonFilter(ev.target.value.trim())} />
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
                                                    <Grid item xs container width={"350px"}>
                                                        <Grid item xs>
                                                            {
                                                                isJsonFilterValid
                                                                    ? (
                                                                        <Box sx={{ background: getColor(theme, "green")[1], padding: "10px", borderRadius: "5px" }}>
                                                                            <Typography sx={{ color: getColor(theme, "green")[0] }}>The filter matches this Cloud Event</Typography>
                                                                        </Box>
                                                                    )
                                                                    : (
                                                                        <Box sx={{ background: getColor(theme, "red")[1], padding: "10px", borderRadius: "5px" }}>
                                                                            <Typography sx={{ color: getColor(theme, "red")[0] }}>The filter does not match this Cloud Event</Typography>
                                                                        </Box>
                                                                    )
                                                            }
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )
                                }
                                {
                                    currentStep === 2 && (
                                        <Grid item xs={12} container spacing={2}>
                                            <Grid item xs={12} container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography>Channels</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {
                                                        renderAddedChannels()
                                                    }
                                                </Grid>
                                            </Grid>
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
                                                        selectedConditionType === "json_schema" && (
                                                            <Grid item xs={12}>
                                                                <SyntaxHighlighter wrapLongLines={true} language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 12, padding: 20, borderRadius: 10, width: "100", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight, wordBreak: "break-all", whiteSpace: "pre-wrap" } }}>
                                                                    {JSON.stringify(JSON.parse(jsonFilter), null, 4)}
                                                                </SyntaxHighlighter>
                                                            </Grid>
                                                        )
                                                    }
                                                    {
                                                        selectedConditionType === "json_path" && (
                                                            <Grid item xs="auto">
                                                                <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{jsonFilter}</Typography>
                                                            </Grid>
                                                        )
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )
                                }
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Grid container>
                                <Grid item xs>
                                    <Button onClick={() => { clean(); onClose(); }} variant="outlined">Cancel</Button>
                                </Grid>
                                <Grid item xs="auto" container spacing={2}>
                                    <Grid item xs="auto">
                                        <Button disabled={currentStep === 0} onClick={() => { setCurrentStep(currentStep - 1); }} variant="outlined">Previous</Button>
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

                                                    <Button onClick={() => {
                                                        dispatch(eventsActions.subscribeAction.request({ eventType: event.type, channels: channels, condition_type: selectedConditionType, conditions: [jsonFilter] }));
                                                        clean();
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
