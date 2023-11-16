FROM node:18-alpine as build
LABEL authors="hsaiz@ikerlan.es"

WORKDIR /app

# install app dependencies
COPY ./package.json package.json
COPY ./package-lock.json package-lock.json
RUN npm install

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=16384"
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV GENERATE_SOURCEMAP=false

RUN npm run build

#production environment
FROM nginx:1.20-alpine
LABEL authors="hsaiz@ikerlan.es"

COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/server.conf

WORKDIR /usr/share/nginx/html
COPY ./env-docker-config.js /tmpl/env-config.js.tmpl
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 443

# Add bash
RUN apk add --no-cache bash

# Start Nginx server
ENTRYPOINT ["bash", "/docker-entrypoint.sh"]