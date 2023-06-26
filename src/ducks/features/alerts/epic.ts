import { Epic } from "redux-observable";
import { RootState } from "../../reducers";
import * as actions from "./actions";
import { filter, exhaustMap, catchError, map } from "rxjs/operators";
import { from, of, tap, forkJoin, defaultIfEmpty } from "rxjs";
import * as notificationsActions from "ducks/features/notifications/actions";

import * as apicalls from "./apicalls";
import { isActionOf, PayloadAction } from "typesafe-actions";
import { RootAction } from "ducks/actions";

export const getInfoEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getInfoAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action) =>
            from(apicalls.getInfo()).pipe(
                map(actions.getInfoAction.success),
                catchError((message) => of(actions.getInfoAction.failure(message)))
            )
        )
    );

export const getEventsEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getEvents.request)),
        tap((item: any) => console.log("%c Epic ", "background:#25eee3; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap(() =>
            from(apicalls.getEvents()).pipe(
                map(actions.getEvents.success),
                catchError((message) => of(actions.getEvents.failure(message)))
            )
        )
    );

export const getSubscriptionsEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getSubscriptions.request)),
        tap((item: any) => console.log("%c Epic ", "background:#25eee3; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap(() =>
            from(apicalls.getSubscriptions()).pipe(
                map(actions.getSubscriptions.success),
                catchError((message) => of(actions.getSubscriptions.failure(message)))
            )
        )
    );

export const subscribeEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.subscribeAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#25eee3; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, actions.SubscribeAction>) =>
            forkJoin(
                action.payload.channels.map(async channel => {
                    try {
                        apicalls.subscribe(action.payload.eventType, channel, action.payload.condition_type, action.payload.conditions);
                        return new Promise(resolve => resolve(true));
                    } catch (er) {
                        return new Promise(resolve => resolve(true));
                    }
                })
            ).pipe(
                defaultIfEmpty({}),
                tap((item: any) => console.log("%c Epic ", "background:#887751; border-radius:5px;font-weight: bold;", "", item)),
                map(actions.subscribeAction.success),
                catchError((message) => of(actions.subscribeAction.failure(message)))
            )
        )
    );

export const unsubscribeEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.unsubscribeAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#25eee3; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, actions.UnsubscribeAction>) =>
            from(apicalls.unsubscribe(action.payload.SubscriptionID)).pipe(
                map(actions.unsubscribeAction.success),
                catchError((message) => of(actions.unsubscribeAction.failure(message)))
            )
        )
    );

export const triggerRefreshSubs: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter((rootAction, value) => isActionOf([
            actions.subscribeAction.success,
            actions.unsubscribeAction.success
        ], rootAction)),
        tap((item: any) => console.log("%c Epic ", "background:#884101; border-radius:5px;font-weight: bold;", "", item)),
        map(actions.getSubscriptions.request)
    );

export const reportError: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter((rootAction, value) => isActionOf([
            actions.getEvents.failure,
            actions.getSubscriptions.failure,
            actions.subscribeAction.failure,
            actions.unsubscribeAction.failure
        ], rootAction)),
        tap((item: any) => console.log("%c Epic ", "background:#884101; border-radius:5px;font-weight: bold;", "", item)),
        map(({ type, payload }: { type: string, payload: Error }) => { return notificationsActions.addNotificationAction({ message: type + ": " + payload.message, type: "ERROR" }); })
    );
