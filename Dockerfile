FROM node:22-alpine AS build

WORKDIR /app

# install app dependencies
COPY ./package.json package.json
COPY ./package-lock.json package-lock.json
RUN npm install

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=16384 --openssl-legacy-provider"
ENV GENERATE_SOURCEMAP=false

# a dummy env-config.js is required for the build to succeed
COPY ./env-docker-config.js env-config.js
RUN sed -i 's/${CHART_VERSION}/dummy_chart_version/g' env-config.js && \
                sed -i 's/${HELM_REVISION}/dummy_helm_revision/g' env-config.js && \
                sed -i 's/${OIDC_ENABLED}/false/g' env-config.js && \
                sed -i 's/${COGNITO_ENABLED}/false/g' env-config.js && \
                sed -i 's/${COGNITO_HOSTED_UI_DOMAIN}/dummy_cognito_hosted_ui_domain/g' env-config.js && \
                sed -i 's/${OIDC_AUTHORITY}/dummy_oidc_authority/g' env-config.js && \
                sed -i 's/${OIDC_CLIENT_ID}/dummy_oidc_client_id/g' env-config.js && \
                sed -i 's/${DOMAIN}/dummy_domain/g' env-config.js && \
                sed -i 's/$CLOUD_CONNECTORS/[]/g' env-config.js 
RUN cat env-config.js

RUN npm run build

RUN rm env-config.js
#production environment
FROM nginx:1.28.0-alpine-slim

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

ARG SHA1VER= # set by build script
ARG VERSION= # set by build script

WORKDIR /usr/share/nginx/html
COPY ./env-docker-config.js /tmpl/env-config.js.tmpl

RUN now=$(TZ=GMT date +"%Y-%m-%dT%H:%M:%SZ") && \
    sed -i "s/XXX_UI_VERSION/$VERSION/g" "/tmpl/env-config.js.tmpl" && \
    sed -i "s/XXX_BUILD_ID/$SHA1VER/g" "/tmpl/env-config.js.tmpl" && \
    sed -i "s/XXX_BUILD_TIME/$now/g" "/tmpl/env-config.js.tmpl"

COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

# Add bash
RUN apk add --no-cache bash

# Start Nginx server
ENTRYPOINT ["bash", "/docker-entrypoint.sh"]