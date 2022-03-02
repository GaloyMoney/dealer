FROM node:16-alpine AS BUILD_IMAGE

ARG WALLET_LAYOUT

WORKDIR /app

RUN apk update && apk add git

COPY  ./*.json ./yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY ./src ./src
COPY ./*.js ./

RUN WALLET_LAYOUT=${WALLET_LAYOUT} yarn build:node && yarn build:files && yarn build:webpack


# FROM gcr.io/distroless/nodejs:16
FROM node:16-alpine

COPY --from=BUILD_IMAGE /app/.gvars.json /app/.gvars.json
COPY --from=BUILD_IMAGE /app/build /app/build
COPY ./public /app/public
COPY --from=BUILD_IMAGE /app/public/bundles /app/public/bundles
COPY --from=BUILD_IMAGE /app/node_modules /app/node_modules

WORKDIR /app
COPY ./views ./views

USER 1000

ARG BUILDTIME
ARG COMMITHASH
ENV BUILDTIME ${BUILDTIME}
ENV COMMITHASH ${COMMITHASH}

CMD ["build/server/server.js"]
