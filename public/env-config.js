window._env_ =  {
    INFO: {
        UI_VERSION: `XXX_UI_VERSION`,
        BUILD_ID: `XXX_BUILD_ID`,
        BUILD_TIME: `XXX_BUILD_TIME`,
        CHART_VERSION: `dummy_chart_version`,
        HELM_REVISION: `dummy_helm_revision`,
    },
    AUTH: {
        ENABLED: false,
        COGNITO: {
            ENABLED: false,
            HOSTED_UI_DOMAIN: `dummy_cognito_hosted_ui_domain`,
        },
        OIDC: {
            AUTHORITY: `dummy_oidc_authority`,
            CLIENT_ID: `dummy_oidc_client_id`,
        },
    },
    LAMASSU_CA_API: `https://dummy_domain/api/ca`,
    LAMASSU_DMS_MANAGER_API: `https://dummy_domain/api/dmsmanager`,
    LAMASSU_DEVMANAGER_API:`https://dummy_domain/api/devmanager`,
    LAMASSU_ALERTS_API:`https://dummy_domain/api/alerts`,
    LAMASSU_VA_API:`https://dummy_domain/api/va`,
    LAMASSU_VDMS:``,
    LAMASSU_VDEVICE:``,
    CLOUD_CONNECTORS: []
}
