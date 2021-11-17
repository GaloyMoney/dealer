FROM node:14-alpine AS BUILD_IMAGE

COPY package.json yarn.lock /

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=BUILD_IMAGE /build .

COPY nginx.conf /etc/nginx/conf.d/default.conf

ARG BUILDTIME
ARG COMMITHASH
ENV BUILDTIME ${BUILDTIME}
ENV COMMITHASH ${COMMITHASH}
