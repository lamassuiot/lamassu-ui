import { Epic } from "redux-observable";
import { RootState } from "../../reducers";
import * as actions from "./actions";
import * as notificationsActions from "ducks/features/notifications/actions";
import { filter, exhaustMap, mergeMap, catchError, map } from "rxjs/operators";
import { from, of, tap } from "rxjs";

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

export const getDMSEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getDMSAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, actions.GetDMSAction>) =>
            from(apicalls.getDMS(
                action.payload.name
            )).pipe(
                map(actions.getDMSAction.success),
                catchError((message) => of(actions.getDMSAction.failure(message)))
            )
        )
    );

export const getDMSListEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.getDMSListAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, actions.GetDMSsAction>) =>
            from(apicalls.getDMSList(
                action.payload.limit,
                action.payload.offset,
                action.payload.sortMode,
                action.payload.sortField,
                action.payload.filterQuery
            )).pipe(
                map(actions.getDMSListAction.success),
                catchError((message) => of(actions.getDMSListAction.failure(message)))
            )
        )
    );
export const createDMSEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.createDMSWithFormAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, any>) =>
            from(apicalls.createDMS(action.payload)).pipe(
                map(actions.createDMSWithFormAction.success),
                catchError((message) => of(actions.createDMSWithFormAction.failure(message)))
            )
        )
    );
export const approveDMSEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.approveDMSRequestAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        mergeMap((action: PayloadAction<string, actions.ApproveDMSRequest>) =>
            from(apicalls.updateDMSStatus(action.payload.dmsName, action.payload.status)).pipe(
                mergeMap(() =>
                    from(apicalls.updateDMSAuthorizedCAs(action.payload.dmsName, action.payload.authorized_cas)).pipe(
                        map(actions.approveDMSRequestAction.success),
                        catchError((message) => of(actions.approveDMSRequestAction.failure(message)))
                    )
                ),
                catchError((message) => of(actions.approveDMSRequestAction.failure(message)))
            )
        )
    );
export const updateDMSAuthorizedCAsEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.approveDMSRequestAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        mergeMap((action: PayloadAction<string, actions.UpdateAuthorizedCAsRequest>) =>
            from(apicalls.updateDMSAuthorizedCAs(action.payload.dmsName, action.payload.authorized_cas)).pipe(
                map(actions.approveDMSRequestAction.success),
                catchError((message) => of(actions.approveDMSRequestAction.failure(message)))
            )
        )
    );

export const revokeDMSEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.revokeDMSAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, actions.RevokeDMSRequest>) =>
            from(apicalls.updateDMSStatus(action.payload.dmsName, action.payload.status)).pipe(
                map(actions.revokeDMSAction.success),
                catchError((message) => of(actions.revokeDMSAction.failure(message)))
            )
        )
    );

export const declimeDMSEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter(isActionOf(actions.declineDMSRequestAction.request)),
        tap((item: any) => console.log("%c Epic ", "background:#399999; border-radius:5px;font-weight: bold;", "", item)),
        exhaustMap((action: PayloadAction<string, actions.DeclineDMSRequest>) =>
            from(apicalls.updateDMSStatus(action.payload.dmsName, action.payload.status)).pipe(
                map(actions.declineDMSRequestAction.success),
                catchError((message) => of(actions.declineDMSRequestAction.failure(message)))
            )
        )
    );

export const updateAfterSuccessStatusChangeEpic: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter((rootAction, value) => isActionOf([
            actions.approveDMSRequestAction.success,
            actions.declineDMSRequestAction.success,
            actions.revokeDMSAction.success
        ], rootAction)),
        tap((item: any) => console.log("%c Epic ", "background:#884101; border-radius:5px;font-weight: bold;", "", item)),
        map(() => actions.getDMSListAction.request({
            filterQuery: [],
            limit: 10,
            offset: 0,
            sortField: "id",
            sortMode: "asc"
        }))
    );

export const reportError: Epic<RootAction, RootAction, RootState, {}> = (action$, store$) =>
    action$.pipe(
        filter((rootAction, value) => isActionOf([
            actions.getDMSListAction.failure,
            actions.createDMSWithFormAction.failure,
            actions.approveDMSRequestAction.failure,
            actions.declineDMSRequestAction.failure,
            actions.revokeDMSAction.failure
        ], rootAction)),
        tap((item: any) => console.log("%c Epic ", "background:#884101; border-radius:5px;font-weight: bold;", "", item)),
        map(({ type, payload }: { type: string, payload: Error }) => { return notificationsActions.addNotificationAction({ message: type + ": " + payload.message, type: "ERROR" }); })
    );
