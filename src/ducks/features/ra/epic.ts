import { Epic } from "redux-observable";
import { RootState } from "../../reducers";
import * as actions from "./actions";
import { filter, exhaustMap, catchError, map } from "rxjs/operators";
import { from, of, tap } from "rxjs";

import * as apicalls from "./apicalls";
import { isActionOf, PayloadAction } from "typesafe-actions";
import { RootAction } from "ducks/actions";
import { QueryParameters } from "ducks/models";

export const getDMSs: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getDMSs.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, QueryParameters>) =>
            from(
                apicalls.getDMSs({
                    sortMode: action.payload.sortMode,
                    sortField: action.payload.sortField,
                    limit: action.payload.limit,
                    filters: action.payload.filters,
                    bookmark: action.payload.bookmark
                })
            ).pipe(
                map(actions.getDMSs.success),
                tap((item: any) => console.log("%c Epic ", "background:#25eeee; border-radius:5px;font-weight: bold;", "", item)),
                catchError((message) => of(actions.getDMSs.failure(message)))
            )
        )
    );

export const getDMS: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getDMSByID.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, string>) =>
            from(
                apicalls.getDMSByID(action.payload)
            ).pipe(
                map(actions.getDMSByID.success),
                tap((item: any) => console.log("%c Epic ", "background:#25eeee; border-radius:5px;font-weight: bold;", "", item)),
                catchError((message) => of(actions.getDMSByID.failure(message)))
            )
        )
    );

export const triggerGetDMSs: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter((rootAction, value) => isActionOf([
            actions.updateDMS,
            actions.createDMS
        ], rootAction)),
        tap((item: any) => console.log("%c Epic ", "background:#ff5555; border-radius:5px;font-weight: bold;", "", item)),
        map((val: any) => {
            return actions.getDMSs.request({
                sortMode: "asc",
                sortField: "",
                limit: 35,
                filters: [],
                bookmark: ""
            });
        })
    );
