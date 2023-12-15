import { Box, Grid, IconButton, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as eventsActions from "ducks/features/alerts/actions";
import * as eventsSelector from "ducks/features/alerts/reducer";
import { useAppSelector } from "ducks/hooks";
import moment from "moment";
import { SubscribeDialog } from "./SubscribeDialog";
import { Event, Subscription } from "ducks/features/alerts/models";
import { ViewSubscriptionDialog } from "./ViewSubscriptionDialog";
import { LamassuTable } from "components/LamassuComponents/Table";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { SubscriptionChip } from "./SubscriptionChip";
import { apicalls } from "ducks/apicalls";
import { actions } from "ducks/actions";
import StandardWrapperView from "views/StandardWrapperView";
import RefreshIcon from "@mui/icons-material/Refresh";

type EventItem = {
    EventTitle: string
    EventType: string
    EventSource: string
    LastSeen: string
    LastSeenDiff: string
    Subscriptions: Subscription[]
    Event: Event
    Counter: number
}

export const AlertsView = () => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [subscriptionEvent, setSubscriptionEvent] = useState<any | undefined>(undefined);

    const [viewSubscription, setViewSubscription] = useState<Subscription>();

    const registeredEvents = useAppSelector((state) => eventsSelector.getEvents(state));
    const userSubscription = useAppSelector((state) => eventsSelector.getSubscriptions(state));

    useEffect(() => {
        refreshAction();
    }, []);

    const refreshAction = () => {
        dispatch(eventsActions.getEvents.request({}));
        dispatch(eventsActions.getSubscriptions.request("_lms_system"));
    };

    const events = registeredEvents.map((ev): EventItem => {
        return {
            EventTitle: ev.event.type,
            EventType: ev.event.type,
            EventSource: ev.event.source,
            LastSeen: moment(ev.seen_at).format("YYYY-MM-DD HH:mm:ss"),
            LastSeenDiff: moment(ev.seen_at).fromNow(),
            Subscriptions: userSubscription.filter(sub => sub.event_type === ev.event.type),
            Counter: ev.counter,
            Event: ev
        };
    });

    const columnConf = [
        { key: "eventId", title: "Event Type", align: "start", size: 2 },
        { key: "eventSrc", title: "Event Source", align: "center", size: 2 },
        { key: "ctr", title: "Event Counter", align: "center", size: 1 },
        { key: "lastSeen", title: "Last Seen", align: "center", size: 2 },
        { key: "subs", title: "Active Subscriptions", align: "center", size: 3 },
        { key: "actions", title: "", align: "end", size: 3 }
    ];

    const eventsRender = (event: EventItem) => {
        return {
            ctr: (
                <Label>{event.Counter}</Label>
            ),
            eventId: (
                <Label style={{ fontWeight: 500 }}>{event.EventTitle}</Label>
            ),
            eventSrc: (
                <Label>{event.EventTitle}</Label>
            ),
            subs: (
                <Grid container spacing={1} justifyContent={"center"}>
                    {
                        event.Subscriptions.map((sub, idx) => {
                            console.log(sub);

                            return (
                                <Grid item key={idx} >
                                    <SubscriptionChip sub={sub} onClick={(sub) => { }} onDelete={async (sub) => {
                                        try {
                                            await apicalls.alerts.unsubscribe("_lms_system", sub.id);
                                            dispatch(actions.alertsActions.getSubscriptions.request("_lms_system"));
                                        } catch (e) {

                                        }
                                    }} />
                                </Grid>
                            );
                        })
                    }
                </Grid>
            ),
            lastSeen: (
                <Grid container>
                    <Grid item xs={12}>
                        <Label style={{ textAlign: "center" }}>{event.LastSeen}</Label>
                    </Grid>
                    <Grid item xs={12}>
                        <Label style={{ textAlign: "center" }}>{event.LastSeenDiff}</Label>
                    </Grid>
                </Grid>
            ),
            actions: (
                <>
                    <MonoChromaticButton
                        onClick={(ev) => {
                            ev.stopPropagation(); ev.preventDefault();
                            setSubscriptionEvent(event.Event.event);
                        }}>
                        Add Subscriptions
                    </MonoChromaticButton>
                </>
            ),
            expandedRowElement: (
                <Grid container>
                    <Grid item xs="auto">
                        <Box sx={{ background: theme.palette.primary.main, width: "3px", height: "100%" }}></Box>
                    </Grid>
                    <Grid item xs>
                        <CodeCopier code={JSON.stringify(event.Event.event)} isJSON enableDownload={false} />
                    </Grid>
                </Grid>
            )
        };
    };

    return (
        <>

            <StandardWrapperView
                title="Alerts"
                subtitle="Monitor and get notified when operations are requested to the PKI"
                headerActions={[
                    <IconButton key="refresh" style={{ background: theme.palette.primary.light }} onClick={() => {
                        refreshAction();
                    }}>
                        <RefreshIcon style={{ color: theme.palette.primary.main }} />
                    </IconButton>
                ]}
                tabs={[
                    {
                        label: "default",
                        element: (
                            <LamassuTable
                                data={events}
                                listConf={columnConf}
                                listRender={{
                                    renderFunc: eventsRender,
                                    enableRowExpand: true,
                                    columnConf: columnConf
                                }}
                                sort={{
                                    enabled: false
                                }}
                            />
                        )
                    }
                ]}
            />

            <ViewSubscriptionDialog isOpen={viewSubscription !== undefined} subscription={viewSubscription} onClose={() => { setViewSubscription(undefined); }} />
            <SubscribeDialog isOpen={subscriptionEvent !== undefined} event={subscriptionEvent} onClose={() => { setSubscriptionEvent(undefined); }} />
        </>
    );
};
