/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { ActionStatus, RequestStatus, RequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { CertificateAuthority } from "./apicalls";

export interface CertificateAuthoritiesState {
    status: ActionStatus
    list: Array<CertificateAuthority>
    next: string
}

const initialState = {
    status: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None
    },
    list: [],
    next: ""
};

export const certificateAuthoritiesReducer = createReducer<CertificateAuthoritiesState, RootAction>(initialState)
    .handleAction(actions.caActionsV3.getCAs.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read }, list: [], totalCAs: 0 };
    })
    .handleAction(actions.caActionsV3.getCAs.success, (state, action) => {
        return { ...state, caStats: action.payload };
    })

    .handleAction(actions.caActionsV3.getCAs.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.caActionsV3.getCAs.success, (state, action) => {
        console.log(action);

        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Success }, list: action.payload.list, next: action.payload.next };
    });

const getSelector = (state: RootState): CertificateAuthoritiesState => state.cav3;

export const getNextBookmark = (state: RootState): string => {
    const caReducer = getSelector(state);
    return caReducer.next;
};

export const getCAs = (state: RootState): Array<CertificateAuthority> => {
    const caReducer = getSelector(state);
    return caReducer.list.sort((a: CertificateAuthority, b: CertificateAuthority) => (a.subject.common_name > b.subject.common_name) ? 1 : ((b.subject.common_name > a.subject.common_name) ? -1 : 0));
};

export const getCA = (state: RootState, id: string): CertificateAuthority | undefined => {
    const caReducer = getSelector(state);
    return caReducer.list.find((ca: CertificateAuthority) => ca.id === id);
};

export const getCAListRequestStatus = (state: RootState): ActionStatus => {
    const caReducer = getSelector(state);
    return caReducer.status;
};
