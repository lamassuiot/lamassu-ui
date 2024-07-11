export const helmYaml = `
tls:
  type: letsEncrypt
  certManagerOptions:
    clusterIssuer: "letsencrypt-prod"

postgres:
  hostname: "postgresql"
  port: 5432
  username: "admin"
  password: "AAAA"
amqp:
  hostname: "rabbitmq"
  port: 5672
  username: "admin"
  password: "AAAA"
  tls: false
services:
  ca:
    domain: lab.lamassu.io
    engines:
      awsSecretsManager:
      - id: aws-sm-ikerlan-zpd
        access_key_id: DDDD
        secret_access_key: AAA/
        region: eu-west-1
        auth_method: static
        metadata:
          account: ikerlan-zpd
  keycloak:
    enabled: true
    image: ghcr.io/lamassuiot/keycloak:2.1.0
    adminCreds:
      username: "admin"
      password: SDFSDFSDF
  awsConnector:
    enabled: true
    connectorID: "aws.111111111"
    credentials:
      access_key_id: 3333
      secret_access_key: 343333333333
      region: eu-west-1
      auth_method: static
ingress:
  enabled: true
  hostname: lab.lamassu.io
  annotations: |
    kubernetes.io/ingress.class: "public"

simulationTools:
  enabled: false
`