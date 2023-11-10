import { Box, Chip, Divider, Grid, IconButton, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import { useDispatch } from "react-redux";
import RefreshIcon from "@mui/icons-material/Refresh";
import * as eventsActions from "ducks/features/alerts/actions";
import * as eventsSelector from "ducks/features/alerts/reducer";
import { useAppSelector } from "ducks/hooks";
import { RequestStatus } from "ducks/reducers_utils";
import moment from "moment";
import { SubscribeDialog } from "./SubscribeDialog";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import { SubChannelType, Subscription } from "ducks/features/alerts/models";
import { ViewSubscriptionDialog } from "./ViewSubscriptionDialog";
import { ColoredButton } from "components/LamassuComponents/ColoredButton";
import { selectors } from "ducks/reducers";

export const AlertsView = () => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [subscriptionEvent, setSubscriptionEvent] = useState<any | undefined>(undefined);
    const [expandedEvents, setExpandedEvents] = useState<Array<string>>([]);

    const [viewSubscription, setViewSubscription] = useState<Subscription>();

    const eventRequestStatus = useAppSelector((state) => selectors.alerts.getEventsRequestStatus(state));
    const subscriptionsRequestStatus = useAppSelector((state) => selectors.alerts.getSubscriptionsRequestStatus(state));

    const registeredEvents = useAppSelector((state) => eventsSelector.getEvents(state));
    const userSubscription = useAppSelector((state) => eventsSelector.getSubscriptions(state));

    useEffect(() => {
        refreshAction();
    }, []);

    const refreshAction = () => {
        dispatch(eventsActions.getEvents.request({}));
        dispatch(eventsActions.getSubscriptions.request({}));
    };

    const events = registeredEvents.map(ev => {
        return {
            EventTitle: ev.event.type,
            EventType: ev.event.type,
            EventSource: ev.event.source,
            // LastSeen: moment(ev.time).format("YYYY-MM-DD HH:mm:ss"),
            // LastSeenDiff: moment(ev.time).fromNow(),
            LastSeen: moment(),
            LastSeenDiff: moment(),
            Subscribed: userSubscription.filter(sub => sub.event_type === ev.event.type).length > 0,
            Event: ev
        };
    });

    return (
        <Box padding="20px" sx={{ height: "calc(100% - 40px)", overflowY: "auto" }}>
            <Box component={Paper}>
                <Box padding="30px">
                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>Notification and Events</Typography>
                </Box>
                <Divider />
                <Grid container spacing="20px" padding="30px">
                    <Grid item container>
                        <Grid item container justifyContent="flex-end">
                            <Grid xs="auto" item>
                                <IconButton style={{ backgroundColor: theme.palette.primary.light }} onClick={() => { refreshAction(); }}>
                                    <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} container>
                            <Grid item xs={2}><Typography fontSize="13px" color="#999eaa">Event</Typography></Grid>
                            <Grid item xs={2} container justifyContent="center"><Typography fontSize="13px" color="#999eaa">Source</Typography></Grid>
                            <Grid item xs={2} container justifyContent="center"><Typography fontSize="13px" color="#999eaa">Last Seen</Typography></Grid>
                            <Grid item xs={2} container justifyContent="center"><Typography fontSize="13px" color="#999eaa">Actions</Typography></Grid>
                            <Grid item xs={2} container justifyContent="center"><Typography fontSize="13px" color="#999eaa">Subscriptions Channels</Typography></Grid>
                            <Grid item xs={2}></Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                    </Grid>
                    {
                        eventRequestStatus.status !== RequestStatus.Pending && subscriptionsRequestStatus.status !== RequestStatus.Pending
                            ? (
                                events.map((event, index) => (
                                    <>
                                        <Grid item xs={12} container alignItems="center" key={index}>
                                            <Grid item xs={2}><Typography>{event.EventTitle}</Typography></Grid>
                                            <Grid item xs={2} container justifyContent="center"><Typography>{event.EventSource}</Typography></Grid>
                                            <Grid item xs={2} container justifyContent="center" alignItems="center" spacing={2}>
                                                <Grid item>
                                                    <Typography>{event.LastSeen}</Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography fontSize={"13px"}>({event.LastSeenDiff})</Typography>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={2} container justifyContent="center">
                                                <ColoredButton
                                                    customtextcolor={theme.palette.primary.main}
                                                    customcolor={theme.palette.primary.light}
                                                    size="small"
                                                    variant={"contained"}
                                                    onClick={() => {
                                                        setSubscriptionEvent(event.Event);
                                                    }}>Add Subscriptions</ColoredButton>
                                            </Grid>
                                            <Grid item xs={2} container justifyContent={"center"} spacing={2}>
                                                {
                                                    userSubscription.filter(sub => sub.event_type === event.EventType).map((sub, idx) => {
                                                        let icon = <></>;
                                                        if (sub.channel.type === SubChannelType.Email) {
                                                            icon = <EmailOutlinedIcon />;
                                                        } else if (sub.channel.type === SubChannelType.MsTeams) {
                                                            icon = <img src={process.env.PUBLIC_URL + "assets/msteams.png"} height="18px" />;
                                                        } else if (sub.channel.type === SubChannelType.Webhook) {
                                                            icon = <WebhookOutlinedIcon />;
                                                        }

                                                        return (
                                                            <Grid key={idx} item xs="auto">
                                                                <Chip
                                                                    icon={icon}
                                                                    label={sub.channel.name}
                                                                    onClick={() => {
                                                                        setViewSubscription(sub);
                                                                    }}
                                                                    // onDelete={() => dispatch(actions.alertsActions.unsubscribe.request({  }))}
                                                                />
                                                            </Grid>
                                                        );
                                                    })
                                                }
                                            </Grid>
                                            <Grid item xs={2} container justifyContent={"flex-end"} spacing={2}>
                                                <Grid item xs="auto">
                                                    <IconButton onClick={() => {
                                                        const idx = expandedEvents.indexOf(event.Event.event.id);
                                                        if (idx > -1) {
                                                            setExpandedEvents(prev => { return prev.filter(id => id !== event.Event.event.id); });
                                                        } else {
                                                            setExpandedEvents(prev => [...prev, event.Event.event.id]);
                                                        }
                                                    }}>
                                                        <KeyboardArrowDownIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        {
                                            expandedEvents.indexOf(event.Event.event.id) >= 0 && (
                                                <Grid item xs={12} container alignItems="center" key={index}>
                                                    <SyntaxHighlighter wrapLongLines={true} language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 12, padding: 20, borderRadius: 10, width: "100%", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight, wordBreak: "break-all", whiteSpace: "pre-wrap" } }}>
                                                        {JSON.stringify(event.Event, null, 4)}
                                                    </SyntaxHighlighter>
                                                </Grid>
                                            )
                                        }

                                    </>
                                ))
                            )
                            : (
                                <>
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                    <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                </>
                            )
                    }
                </Grid>
            </Box>
            <ViewSubscriptionDialog isOpen={viewSubscription !== undefined} subscription={viewSubscription} onClose={() => { setViewSubscription(undefined); }} />
            <SubscribeDialog isOpen={subscriptionEvent !== undefined} event={subscriptionEvent} onClose={() => { setSubscriptionEvent(undefined); }} />
        </Box>
    );
};
