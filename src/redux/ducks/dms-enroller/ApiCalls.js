import getDmsListMock from "./mocks/get-dms-list.json";

export const getDmsList = async () => {
    /*
    try {
        const resp = await fetch(process.env.REACT_APP_LAMASSU_CA_API + "/v1/pki", {
            headers: {
                "Authorization": "Bearer " + keycloak.token
            }
        })
        const json = await resp.json()
        if (resp.status !== 200) {
            return {error: "Unexpected response from CA API server. " + parseError(json)}
        }else{
            return {
                json: json,
                status: resp.status
            }
        }
    } catch (er) {
        return { error: "Connection error with CA API server. " + parseError(er) }
    }
    */
    return new Promise(resolve => {
        setTimeout(resolve({
            json: getDmsListMock,
            status: 200
        }), 2000)
    });

}