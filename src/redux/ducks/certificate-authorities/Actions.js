import * as t from "./ActionTypes";

export const resetCurretRequestStatus = () => ({
    type: t.RESET_CURRENT_REQUEST_STATUS,
})

export const getCAs = () => {
    console.log("Action GetCAS");
    return {
    type: t.GET_CAS,
}}

export const getIssuedCerts = (caName) => ({
    type: t.GET_ISSUED_CERTS,
    payload: {
        caName: caName
    }
})

export const createCA = (selectedConnectors, caName, country, state, locality, organization, organizationUnit, commonName, caTtl, enrollerTtl, keyType, keyBits) => ({
    type: t.CREATE_CA,
    payload: { 
        caName: caName,
        selectedConnectors: selectedConnectors,
        body: {
            subject:{
                country: country,
                state: state,
                locality: locality,
                organization: organization,
                organization_unit: organizationUnit,
                common_name: commonName,
            },
            key_metadata:{
                type: keyType,
                bits: keyBits,

            },
            ca_ttl: caTtl,
            enroller_ttl: enrollerTtl,
        }
    },
})