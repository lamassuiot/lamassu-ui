import { Epic } from "redux-observable";
import { RootState } from "../../reducers";
import * as actions from "./actions";
import { filter, exhaustMap, catchError, map } from "rxjs/operators";
import { from, of, tap } from "rxjs";

import * as apicalls from "./apicalls";
import { isActionOf, PayloadAction } from "typesafe-actions";
import { RootAction } from "ducks/actions";
import { QueryParameters } from "ducks/models";

export const getDevices: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getDevices.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, QueryParameters>) =>
            from(
                apicalls.getDevices({
                    sortMode: action.payload.sortMode,
                    sortField: action.payload.sortField,
                    limit: action.payload.limit,
                    filters: action.payload.filters,
                    bookmark: action.payload.bookmark
                })
            ).pipe(
                map(actions.getDevices.success),
                tap((item: any) => console.log("%c Epic ", "background:#25eeee; border-radius:5px;font-weight: bold;", "", item)),
                catchError((message) => of(actions.getDevices.failure(message)))
            )
        )
    );

export const getDeviceByID: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getDeviceByID.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, string>) =>
            from(
                apicalls.getDeviceByID(
                    action.payload
                )
            ).pipe(
                map(actions.getDeviceByID.success),
                tap((item: any) => console.log("%c Epic ", "background:#25eeee; border-radius:5px;font-weight: bold;", "", item)),
                catchError((message) => of(actions.getDeviceByID.failure(message)))
            )
        )
    );
