import { Box, Grid, Paper, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as eventsActions from "ducks/features/alerts/actions";
import * as eventsSelector from "ducks/features/alerts/reducer";
import { useAppSelector } from "ducks/hooks";
import moment from "moment";
import { SubscribeDialog } from "./SubscribeDialog";
import { Event, Subscription } from "ducks/features/alerts/models";
import { ViewSubscriptionDialog } from "./ViewSubscriptionDialog";
import { selectors } from "ducks/reducers";
import { LamassuTable } from "components/LamassuComponents/Table";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";

type EventItem = {
    EventTitle: string
    EventType: string
    EventSource: string
    LastSeen: string
    LastSeenDiff: string
    Subscribed: boolean
    Event: Event
    Counter: number
}

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

    const events = registeredEvents.map((ev): EventItem => {
        return {
            EventTitle: ev.event.type,
            EventType: ev.event.type,
            EventSource: ev.event.source,
            LastSeen: moment(ev.seen_at).format("YYYY-MM-DD HH:mm:ss"),
            LastSeenDiff: moment(ev.seen_at).fromNow(),
            Subscribed: userSubscription.filter(sub => sub.event_type === ev.event.type).length > 0,
            Counter: ev.counter,
            Event: ev
        };
    });

    const columnConf = [
        { key: "eventId", title: "Event Type", align: "start", size: 2 },
        { key: "eventSrc", title: "Event Source", align: "center", size: 2 },
        { key: "ctr", title: "Event Counter", align: "center", size: 1 },
        { key: "lastSeen", title: "Last Seen", align: "center", size: 2 },
        { key: "actions", title: "", align: "end", size: 5 }
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
            <Box sx={{ padding: "30px", height: "calc(100% - 60px)", display: "flex", flexDirection: "column" }}>
                <Box component={Paper} sx={{ padding: "20px", height: "1px", flex: 1, overflowY: "auto" }}>
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
                </Box>
            </Box>
            <ViewSubscriptionDialog isOpen={viewSubscription !== undefined} subscription={viewSubscription} onClose={() => { setViewSubscription(undefined); }} />
            <SubscribeDialog isOpen={subscriptionEvent !== undefined} event={subscriptionEvent} onClose={() => { setSubscriptionEvent(undefined); }} />
        </>
    );
};
