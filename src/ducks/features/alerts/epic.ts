import { Epic } from "redux-observable";
import { RootState } from "../../reducers";
import * as actions from "./actions";
import { filter, exhaustMap, catchError, map } from "rxjs/operators";
import { from, of, tap } from "rxjs";

import * as apicalls from "./apicalls";
import { isActionOf, PayloadAction } from "typesafe-actions";
import { RootAction } from "ducks/actions";
import { QueryParameters } from "ducks/models";

export const getEvents: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getEvents.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, QueryParameters>) =>
            from(
                apicalls.getEvents()
            ).pipe(
                map(actions.getEvents.success),
                tap((item: any) => console.log("%c Epic ", "background:#25eeee; border-radius:5px;font-weight: bold;", "", item)),
                catchError((message) => of(actions.getEvents.failure(message)))
            )
        )
    );

export const getSubs: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getSubscriptions.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, string>) =>
            from(
                apicalls.getSubscriptions(action.payload)
            ).pipe(
                map(actions.getSubscriptions.success),
                tap((item: any) => console.log("%c Epic ", "background:#25eeee; border-radius:5px;font-weight: bold;", "", item)),
                catchError((message) => of(actions.getSubscriptions.failure(message)))
            )
        )
    );

export const triggerGetSubs: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter((rootAction, value) => isActionOf([
            actions.subscribe,
            actions.unsubscribe
        ], rootAction)),
        map((val: any) => {
            return actions.getSubscriptions.request("_lms_system");
        })
    );
