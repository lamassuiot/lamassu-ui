window._env_ =  {
    INFO: {
        UI_VERSION: `XXX_UI_VERSION`,
        BUILD_ID: `XXX_BUILD_ID`,
        BUILD_TIME: `XXX_BUILD_TIME`,
        CHART_VERSION: `${CHART_VERSION}`,
        HELM_REVISION: `${HELM_REVISION}`,
    },
    AUTH: {
        ENABLED: ${OIDC_ENABLED},
        COGNITO: {
            ENABLED: ${COGNITO_ENABLED},
            HOSTED_UI_DOMAIN: `${COGNITO_HOSTED_UI_DOMAIN}`,
        },
        OIDC: {
            AUTHORITY: `${OIDC_AUTHORITY}`,
            CLIENT_ID: `${OIDC_CLIENT_ID}`,
        },
    },
    LAMASSU_CA_API: `https://${DOMAIN}/api/ca`,
    LAMASSU_DMS_MANAGER_API: `https://${DOMAIN}/api/dmsmanager`,
    LAMASSU_DEVMANAGER:`https://${DOMAIN}/api/devmanager`,
    LAMASSU_ALERTS:`https://${DOMAIN}/api/alerts`,
    LAMASSU_VA:`https://${DOMAIN}/api/va`,
    LAMASSU_VDMS:``,
    LAMASSU_VDEVICE:``,
    CLOUD_CONNECTORS: $CLOUD_CONNECTORS
}