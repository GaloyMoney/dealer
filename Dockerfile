FROM node:16-alpine AS BUILD_IMAGE

WORKDIR /app

RUN apk update && apk add git

COPY  ./*.json ./yarn.lock ./

RUN yarn install --frozen-lockfile

COPY ./src ./src
COPY ./*.js ./

RUN yarn build:node && yarn build:files && yarn build:webpack

RUN yarn install --frozen-lockfile --production

# FROM gcr.io/distroless/nodejs:16
FROM node:16-alpine

COPY --from=BUILD_IMAGE /app/build /app/build
COPY --from=BUILD_IMAGE /app/node_modules /app/node_modules

WORKDIR /app
COPY ./*.js ./package.json ./tsconfig.json ./yarn.lock ./

USER 1000

ARG BUILDTIME
ARG COMMITHASH
ENV BUILDTIME ${BUILDTIME}
ENV COMMITHASH ${COMMITHASH}

CMD ["build/server/server.js"]
