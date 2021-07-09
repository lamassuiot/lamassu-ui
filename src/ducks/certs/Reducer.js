
import moment from "moment";
import * as actions from "./ActionTypes"

const initialState = {
  list: {},
  error: null,
  loading: false
} 

const certsReducer = (state = initialState, action) => {
  if (actions.ERRORS.includes(action.type)) {
    return { ...state, error: action.payload }
  } else {
    switch (action.type) {
      case actions.GET_CAS_SUCCESS:
        var currentList = {}
        //We need to keep ONLY END_CERT certs
        var certsKeys = Object.keys(state.list)
        var certList = certsKeys.map(key => state.list[key])
        certList = certList.filter(cert=> cert.type == "END_CERT");
        certList.forEach(cert => {
          currentList[cert.serial_number]=cert
        });

        action.payload.forEach(ca => {
          currentList[ca.serial_number] = { ...ca, type: "CA" }
        });
        return {...state, list: currentList };
      
      case actions.GET_CERTS:
        return {...state,  loading: true };
        
      case actions.GET_CERTS_ERROR:
        return {...state,  loading: false };

      case actions.GET_CERTS_SUCCESS:
        var currentList = {}
        //We need to keep ONLY CA certs
        certsKeys = Object.keys(state.list)
        var certList = certsKeys.map(key => state.list[key])
        certList = certList.filter(cert=> cert.type == "CA");
        certList.forEach(cert => {
          currentList[cert.serial_number]=cert
        });

        action.payload.forEach(ca => {
          currentList[ca.serial_number] = { ...ca, type: "END_CERT" }
        });
        return {...state, list: currentList, loading: false};

      default:
        return state;
    }
  }
};

const getSelector = (state) => state.certs

const getLoadingData = (state) => getSelector(state).loading

const getAllCerts = (state) => {
  const certs = getSelector(state)
  const certsKeys = Object.keys(certs.list)
  const certList = certsKeys.map(key => certs.list[key])
  return certList;
}

const getCAs = (state) => {
  const certs = getAllCerts(state)
  return certs.filter(cert=> cert.type == "CA");
}

const getIssuedCertByCAs = (state) => {
  const certs = getAllCerts(state)
  return certs.filter(cert=> cert.type == "END_CERT");
}

const getCertById = (state, id) => {
  const certs = getAllCerts(state)
  const result = certs.filter(cert=> cert.serial_number == id);
  return result.length > 0 ? result[0] : null
}

const getCertsExpiringXDays = (state, daysToExpire) => {
  const certs = getIssuedCertByCAs(state)
  const result = certs.filter(cert=> {
    return moment(cert.valid_to).subtract(daysToExpire, "days").isBefore(moment())
  });
  return result
}

const getCAsExpiringXDays = (state, daysToExpire) => {
  const certs = getCAs(state)
  const result = certs.filter(cert=> {
    return moment(cert.valid_to).subtract(daysToExpire, "days").isBefore(moment())
  });
  return result
}


export default certsReducer;

export {
  getAllCerts,
  getIssuedCertByCAs,
  getCertById,
  getCAs,
  getLoadingData,
  getCertsExpiringXDays,
  getCAsExpiringXDays
}
