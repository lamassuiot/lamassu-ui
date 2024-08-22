import { FetchHandle, FetchViewer } from "components/FetchViewer";
import apicalls from "ducks/apicalls";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { Accordion, AccordionDetails, AccordionSlots, AccordionSummary, Button, IconButton, Paper, Tooltip, Typography, lighten, useTheme } from "@mui/material";
import * as React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Fade from "@mui/material/Fade";
import { FormattedView } from "components/FormattedView";
import moment from "moment";
import { Editor } from "@monaco-editor/react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { SubscribeDialog } from "./SubscribeDialog";
import { Subscription } from "ducks/features/alerts/models";
import { ViewSubscriptionDialog } from "./ViewSubscriptionDialog";
import { SubscriptionChip } from "./SubscriptionChip";
import { enqueueSnackbar } from "notistack";

export const AlertsViewList = () => {
    const theme = useTheme();

    const [expanded, setExpanded] = React.useState<number[]>([]);
    const ref = React.useRef<FetchHandle>(null);

    const [subscriptionEvent, setSubscriptionEvent] = React.useState<any | undefined>(undefined);
    const [viewSubscription, setViewSubscription] = React.useState<Subscription>();

    return (
        <FormattedView title={"Alerts"} subtitle={"Monitor and get notified when operations are requested to the PKI"} actions={(
            <Tooltip title="Reload CA data">
                <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => { ref.current?.refresh(); }}>
                    <RefreshIcon style={{ color: theme.palette.primary.main }} />
                </IconButton>
            </Tooltip >
        )}>
            <FetchViewer fetcher={() => {
                return Promise.all([apicalls.alerts.getEvents(), apicalls.alerts.getSubscriptions("_lms_system")]);
            }} ref={ref} renderer={result => {
                const events = result[0];
                const subs = result[1];
                return (
                    <Grid container spacing={1}>
                        {events.map((event, index) => {
                            const eventSubs = subs.filter(sub => sub.event_type === event.event_types);
                            return (
                                <Grid xs={12} key={index}>
                                    <Accordion
                                        expanded={expanded.includes(index)}
                                        onChange={() => {
                                            setExpanded(expanded.includes(index) ? expanded.filter(i => i !== index) : [...expanded, index]);
                                        }}
                                        slots={{ transition: Fade as AccordionSlots["transition"] }}
                                        slotProps={{ transition: { timeout: 400, unmountOnExit: true } }}
                                        sx={{
                                            "& .MuiAccordion-region": { height: expanded ? "auto" : 0 },
                                            "& .MuiAccordionDetails-root": { display: expanded ? "block" : "none" }
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                            elevation={5}
                                            component={Paper}
                                        >
                                            <Grid container spacing={2} width={"100%"} alignItems={"center"} flexWrap={"wrap"}>
                                                <Grid xs={12} md>
                                                    <Typography variant="h5">{event.event_types}</Typography>
                                                </Grid>
                                                <Grid xs={6} md={2} container flexDirection={"column"} alignItems={"center"} spacing={0}>
                                                    <Grid>
                                                        <Typography variant="caption">Last Seen</Typography>
                                                    </Grid>
                                                    <Grid>
                                                        <Grid container flexDirection={"column"}>
                                                            <Grid xs><Typography variant="body2" textAlign={"center"}>{moment(event.seen_at).format("DD/MM/YYYY HH:mm")}</Typography></Grid>
                                                            <Grid xs><Typography variant="caption" textAlign={"center"} textTransform={"none"} component={"div"}>{moment.duration(moment(event.seen_at).diff(moment())).humanize(true)}</Typography></Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid xs={6} md={2} container flexDirection={"column"} alignItems={"center"} spacing={0}>
                                                    <Grid>
                                                        <Typography variant="caption">Event Counter</Typography>
                                                    </Grid>
                                                    <Grid>
                                                        <Typography variant="body1">{event.counter}</Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid xs={12} md container flexDirection={"column"} alignItems={"center"} spacing={0}>
                                                    <Grid>
                                                        <Typography variant="caption">Active Subscriptions</Typography>
                                                    </Grid>
                                                    <Grid>
                                                        {

                                                            eventSubs.length === 0
                                                                ? (
                                                                    <Typography variant="body2" fontStyle={"italic"} fontSize={"0.75rem"}>No Subscriptions</Typography>
                                                                )
                                                                : (
                                                                    <Grid container spacing={1} alignItems={"center"}>
                                                                        {
                                                                            eventSubs.map((sub, index) => {
                                                                                return (
                                                                                    <Grid xs="auto" key={index}>
                                                                                        <SubscriptionChip sub={sub}
                                                                                            onClick={() => {
                                                                                                setViewSubscription(sub);
                                                                                            }}
                                                                                            onDelete={async () => {
                                                                                                try {
                                                                                                    await apicalls.alerts.unsubscribe("_lms_system", sub.id);
                                                                                                    enqueueSnackbar("Subscription removed", { variant: "success" });
                                                                                                    ref.current?.refresh();
                                                                                                } catch (e) {
                                                                                                    enqueueSnackbar("Failed to remove subscription", { variant: "error" });
                                                                                                }
                                                                                            }} />
                                                                                    </Grid>
                                                                                );
                                                                            })
                                                                        }
                                                                    </Grid>
                                                                )
                                                        }
                                                    </Grid>
                                                </Grid>
                                                <Grid xs={12} md="auto">
                                                    <Button fullWidth variant="contained" color="primary" onClick={(ev) => {
                                                        ev.stopPropagation(); ev.preventDefault();
                                                        setSubscriptionEvent(event.event);
                                                    }}>
                                                        Subscribe
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Editor
                                                theme="vs-dark"
                                                defaultLanguage="json"
                                                height="50vh"
                                                value={JSON.stringify(event.event, null, 4)}
                                                defaultValue="{}"
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            );
                        })}
                    </Grid>
                );
            }} />
            {
                viewSubscription && (
                    <ViewSubscriptionDialog isOpen={viewSubscription !== undefined} subscription={viewSubscription} onClose={() => { setViewSubscription(undefined); }} />
                )
            }
            {
                subscriptionEvent !== undefined && (
                    <SubscribeDialog isOpen={subscriptionEvent !== undefined} event={subscriptionEvent} onClose={() => { setSubscriptionEvent(undefined); }} onSubscribe={() => {
                        ref.current?.refresh();
                    }} />
                )
            }
        </FormattedView>
    );
};
