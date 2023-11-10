/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { ActionStatus, RequestStatus, RequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { CertificateAuthority } from "./models";

export interface CertificateAuthoritiesState {
    calistStatus: ActionStatus
    caitemStatus: ActionStatus
    list: Array<CertificateAuthority>
    next: string
    total: number
}

const initialState = {
    calistStatus: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None,
        err: ""
    },
    caitemStatus: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None,
        err: ""
    },
    list: [],
    next: "",
    total: 0
};

export const certificateAuthoritiesReducer = createReducer<CertificateAuthoritiesState, RootAction>(initialState)
    .handleAction(actions.caActionsV3.getCAs.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, list: [], total: 0 };
    })

    .handleAction(actions.caActionsV3.getCAs.failure, (state, action) => {
        console.log(action);
        return { ...state, calistStatus: { ...state.calistStatus, isLoading: false, status: RequestStatus.Failed, err: "" } };
    })

    .handleAction(actions.caActionsV3.getCAs.success, (state, action) => {
        return { ...state, calistStatus: { ...state.calistStatus, isLoading: false, status: RequestStatus.Success }, list: action.payload.list, next: action.payload.next };
    })
    .handleAction(actions.caActionsV3.getCAByID.request, (state, action) => {
        return { ...state, caitemStatus: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" } };
    })

    .handleAction(actions.caActionsV3.getCAByID.failure, (state, action) => {
        return { ...state, caitemStatus: { ...state.caitemStatus, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.caActionsV3.getCAByID.success, (state, action) => {
        let list = state.list;
        let caIdx = list.findIndex(ca => ca.id === action.payload.id);
        if (caIdx === -1) {
            list.push(action.payload);
        } else {
            list[caIdx] = action.payload;
        }
        return { ...state, caitemStatus: { ...state.caitemStatus, isLoading: false, status: RequestStatus.Success }, list: [...list] };
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

export const getTotalCAs = (state: RootState): number => {
    const caReducer = getSelector(state);
    return caReducer.total;
};

export const getCA = (state: RootState, id: string): CertificateAuthority | undefined => {
    const caReducer = getSelector(state);
    return caReducer.list.find((ca: CertificateAuthority) => ca.id === id);
};

export const getCAListRequestStatus = (state: RootState): ActionStatus => {
    const caReducer = getSelector(state);
    return caReducer.calistStatus;
};

export const getCAItemRequestStatus = (state: RootState): ActionStatus => {
    const caReducer = getSelector(state);
    return caReducer.caitemStatus;
};
