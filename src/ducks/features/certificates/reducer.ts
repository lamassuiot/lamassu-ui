/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { ActionStatus, RequestStatus, RequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { Certificate } from "../cav3/models";

export interface CertificatesState {
    status: ActionStatus
    list: Array<Certificate>
    next: string
}

const initialState = {
    status: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None,
        err: ""
    },
    list: [],
    next: "",
    total: 0
};

export const certificatesReducer = createReducer<CertificatesState, RootAction>(initialState)
    .handleAction(actions.certsActions.getCerts.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, list: [], total: 0 };
    })

    .handleAction(actions.certsActions.getCerts.failure, (state, action) => {
        console.log(action);
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Failed, err: "" } };
    })

    .handleAction(actions.certsActions.getCerts.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Success }, list: action.payload.list, next: action.payload.next };
    });

const getSelector = (state: RootState): CertificatesState => state.certs;

export const getNextBookmark = (state: RootState): string => {
    const caReducer = getSelector(state);
    return caReducer.next;
};

export const getCerts = (state: RootState): Array<Certificate> => {
    const caReducer = getSelector(state);
    return caReducer.list.sort((a: Certificate, b: Certificate) => (a.valid_from > b.valid_from) ? 1 : ((b.valid_from > a.valid_from) ? -1 : 0));
};

export const getStatus = (state: RootState): ActionStatus => {
    const caReducer = getSelector(state);
    return caReducer.status;
};
