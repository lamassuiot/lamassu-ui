import { ofType } from 'redux-observable';
import { makeRequestWithActions, success } from 'redux/utils';
import { mergeMap } from 'rxjs/operators';
import * as t from "./ActionTypes"
import * as lamassuCaApi from "./ApiCalls";
import  notificationsDuck from "redux/ducks/notifications";
import { of, from } from 'rxjs';

export const getCasEpic = action$ => action$.pipe(
    ofType(t.GET_CAS),
    mergeMap(() => makeRequestWithActions(lamassuCaApi.getCAs(), t.GET_CAS)),
);

export const getIssuedCertsEpic = action$ => action$.pipe(
    ofType(t.GET_ISSUED_CERTS),
    mergeMap( ({payload}) => makeRequestWithActions(lamassuCaApi.getIssuedCerts(payload.caName), t.GET_ISSUED_CERTS, {caName: payload.caName})),
);

export const getCasEpicSucess = action$ => action$.pipe(
    ofType(success(t.GET_CAS)),
    mergeMap(({payload}) => of(notificationsDuck.actions.addNotification(notificationsDuck.constants.SUCCESS, `Retrived ${payload.length} Certificate Authorities from Lamassu CA API`))),
);