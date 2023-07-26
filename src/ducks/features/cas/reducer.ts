/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { CAInfo, CAStats, Certificate, CertificateAuthority, CryptoEngine, OCAStatus } from "./models";
import { ActionStatus, ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { keyStrengthToColor, statusToColor } from "./utils";
import { GetIssuedCertsResponse } from "./actions";

export interface CertificateAuthoritiesState {
    info: CAInfo
    cryptoEngine: CryptoEngine
    status: ActionStatus
    caStats: CAStats
    list: Array<CertificateAuthority>
    issuedCertsStatus: ActionStatus
    totalCAs: number,
    signedCertificate: string | undefined
}

const initialState = {
    info: {
        build_version: "",
        build_time: ""
    },
    cryptoEngine: {
        type: "",
        provider: "",
        name: "",
        engine_name: "",
        supported_key_types: [],
        metadata: new Map<string, any>()
    },
    status: {
        isLoading: false,
        status: ORequestStatus.Idle,
        type: ORequestType.None
    },
    caStats: {
        issued_certificates: 0,
        cas: 0,
        scan_date: new Date()
    },
    issuedCertsStatus: {
        isLoading: false,
        status: ORequestStatus.Idle,
        type: ORequestType.None
    },
    signedCertificate: undefined,
    list: [],
    totalCAs: 0
};

export const certificateAuthoritiesReducer = createReducer<CertificateAuthoritiesState, RootAction>(initialState)
    .handleAction(actions.caActions.getInfoAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })
    .handleAction(actions.caActions.getInfoAction.success, (state, action) => {
        return { ...state, info: action.payload, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    })
    .handleAction(actions.caActions.getInfoAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.getCryptoEngineAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })
    .handleAction(actions.caActions.getCryptoEngineAction.success, (state, action) => {
        return { ...state, cryptoEngine: action.payload, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    })
    .handleAction(actions.caActions.getCryptoEngineAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.getCAsAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read }, list: [], totalCAs: 0 };
    })
    .handleAction(actions.caActions.getStatsAction.success, (state, action) => {
        return { ...state, caStats: action.payload };
    })

    .handleAction(actions.caActions.getCAsAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.getCAsAction.success, (state, action) => {
        let list: Array<CertificateAuthority> = [];
        action.payload.cas.forEach((ca: CertificateAuthority) => {
            ca.status_color = statusToColor(ca.status);
            ca.key_metadata.strength_color = keyStrengthToColor(ca.key_metadata.strength);
            ca.issued_certs = [];
            ca.total_issued_certificates = 0;

            list.push(ca);
        });

        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: list, totalCAs: action.payload.total_cas };
    })

    .handleAction(actions.caActions.getIssuedCertsActions.request, (state, action) => {
        return { ...state, issuedCertsStatus: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })

    .handleAction(actions.caActions.getIssuedCertsActions.failure, (state, action) => {
        return { ...state, issuedCertsStatus: { ...state.issuedCertsStatus, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.getIssuedCertsActions.success, (state, action) => {
        let list: Array<Certificate> = [];
        const response: GetIssuedCertsResponse = action.payload as GetIssuedCertsResponse;
        const certs = response.certificates ? response.certificates : [];

        certs.forEach((issuedCert: Certificate) => {
            issuedCert.key_metadata.strength_color = keyStrengthToColor(issuedCert.key_metadata.strength);
            issuedCert.status_color = statusToColor(issuedCert.status);

            list.push(issuedCert);
        });

        let cas = state.list;

        for (let i = 0; i < cas.length; i++) {
            // @ts-ignore
            if (cas[i].name === action.meta.caName) {
                cas[i].issued_certs = list;
                cas[i].total_issued_certificates = response.total_certificates;
            }
        }
        return { ...state, issuedCertsStatus: { ...state.issuedCertsStatus, isLoading: false, status: ORequestStatus.Success }, list: cas };
    })

    .handleAction(actions.caActions.createCAAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Create } };
    })

    .handleAction(actions.caActions.createCAAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.createCAAction.success, (state, action) => {
        let currentList = state.list;

        let issuedCert = action.payload;
        issuedCert.key_metadata.strength_color = keyStrengthToColor(issuedCert.key_metadata.strength);
        issuedCert.status_color = statusToColor(issuedCert.status);

        issuedCert.issued_certs = [];
        issuedCert.total_issued_certificates = 0;

        currentList.push(issuedCert);
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: currentList };
    })

    .handleAction(actions.caActions.importCAAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Create } };
    })

    .handleAction(actions.caActions.importCAAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.importCAAction.success, (state, action) => {
        let currentList = state.list;

        let issuedCert = action.payload;
        issuedCert.key_metadata.strength_color = keyStrengthToColor(issuedCert.key_metadata.strength);
        issuedCert.status_color = statusToColor(issuedCert.status);
        issuedCert.issued_certs = [];
        issuedCert.total_issued_certificates = 0;

        currentList.push(issuedCert);
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: currentList };
    })

    .handleAction(actions.caActions.revokeCAAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Delete } };
    })

    .handleAction(actions.caActions.revokeCAAction.success, (state, action) => {
        let currentList: Array<CertificateAuthority> = state.list;
        let index = currentList.map(ca => ca.name).indexOf(action.meta.caName);
        if (index >= 0) {
            currentList[index].status = OCAStatus.REVOKED;
            currentList[index].status_color = statusToColor(currentList[index].status);
        }

        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: currentList };
    })

    .handleAction(actions.caActions.revokeCAAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.revokeCertAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Delete } };
    })

    .handleAction(actions.caActions.revokeCertAction.success, (state, action) => {
        let currentList: Array<CertificateAuthority> = state.list;
        let index = currentList.map(ca => ca.name).indexOf(action.meta.caName);
        if (index >= 0) {
            const certIdx = currentList[index].issued_certs.map((cert: Certificate) => cert.serial_number).indexOf(action.meta.serialNumber);
            if (certIdx >= 0) {
                currentList[index].issued_certs[certIdx].status = statusToColor(OCAStatus.REVOKED);
                currentList[index].issued_certs[certIdx].status = statusToColor(currentList[index].issued_certs[certIdx].status);
            }
        }

        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: currentList };
    })

    .handleAction(actions.caActions.revokeCertAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.caActions.signCertAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Create } };
    })

    .handleAction(actions.caActions.signCertAction.success, (state, action) => {
        return { ...state, status: { isLoading: false, status: ORequestStatus.Success, type: ORequestType.Create }, signedCertificate: action.payload.certificate };
    })

    .handleAction(actions.caActions.signCertAction.failure, (state, action) => {
        return { ...state, status: { isLoading: false, status: ORequestStatus.Failed, type: ORequestType.Create } };
    })

    .handleAction(actions.caActions.resetStateAction, (state, _) => {
        return { ...state, status: { isLoading: false, status: ORequestStatus.Idle, type: ORequestType.None } };
    });

const getSelector = (state: RootState): CertificateAuthoritiesState => state.cas;

export const getInfo = (state: RootState): CAInfo => {
    const caReducer = getSelector(state);
    return caReducer.info;
};

export const getCryptoEngine = (state: RootState): CryptoEngine => {
    const caReducer = getSelector(state);
    return caReducer.cryptoEngine;
};

export const getStats = (state: RootState): CAStats => {
    const caReducer = getSelector(state);
    return caReducer.caStats;
};

export const getTotalCAs = (state: RootState): number => {
    const caReducer = getSelector(state);
    return caReducer.totalCAs;
};

export const getCAs = (state: RootState): Array<CertificateAuthority> => {
    const caReducer = getSelector(state);
    return caReducer.list.sort((a: CertificateAuthority, b: CertificateAuthority) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
};

export const getCA = (state: RootState, caName: string): CertificateAuthority | undefined => {
    const caReducer = getSelector(state);
    const filteredCAs = caReducer.list.filter((ca: CertificateAuthority) => ca.name === caName);
    if (filteredCAs.length === 1) {
        return filteredCAs[0];
    }
    return undefined;
};

export const getRequestStatus = (state: RootState): ActionStatus => {
    const caReducer = getSelector(state);
    return caReducer.status;
};

export const getIssuedCertsRequestStatus = (state: RootState) => {
    const caReducer = getSelector(state);
    return caReducer.issuedCertsStatus;
};

export const getIssuedCerts = (state: RootState, caName: string): Array<Certificate> | undefined => {
    const ca = getCA(state, caName);
    if (ca !== undefined) {
        return ca.issued_certs;
    }
    return undefined;
};
export const getTotalIssuedCerts = (state: RootState, caName: string): number | undefined => {
    const ca = getCA(state, caName);
    if (ca !== undefined) {
        return ca.total_issued_certificates;
    }
    return undefined;
};
export const getSignedCertificate = (state: RootState): string | undefined => {
    const caReducer = getSelector(state);
    return caReducer.signedCertificate;
};
