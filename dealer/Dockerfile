FROM node:16-alpine AS BUILD_IMAGE

WORKDIR /app

RUN apk update && apk add git

COPY ./*.json ./yarn.lock ./
COPY ./dealer ./dealer/

RUN yarn install --frozen-lockfile
RUN yarn workspace dealer build

RUN rm -rf /app/node_modules
RUN rm -rf /app/dealer/node_modules
RUN yarn install --frozen-lockfile --production



RUN yarn workspace dealer build


FROM gcr.io/distroless/nodejs:16-debug
COPY --from=BUILD_IMAGE /app/dealer/lib /app/dealer/lib
COPY --from=BUILD_IMAGE /app/node_modules /app/node_modules
COPY --from=BUILD_IMAGE /app/dealer/node_modules /app/dealer/node_modules

WORKDIR /app
COPY ./.env ./dealer/package.json ./dealer/*.yaml ./dealer/*.js ./dealer/tsconfig.json ./
COPY ./dealer/migrations ./dealer/migrations

### debug only
COPY --from=BUILD_IMAGE /app/dealer/src /app/dealer/src
###

USER 1000

ARG BUILDTIME
ARG COMMITHASH
ENV BUILDTIME ${BUILDTIME}
ENV COMMITHASH ${COMMITHASH}

CMD ["dealer/lib/app/start.js"]
