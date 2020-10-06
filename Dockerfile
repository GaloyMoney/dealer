FROM mhart/alpine-node:12.18 as app-build

WORKDIR /usr/src/app

COPY ./app/package.json ./app/yarn.lock ./

RUN yarn install --prod --frozen-lockfile

COPY ./app ./

#lnd node params
ARG ADDR=35.188.203.196:9735
ARG PUBKEY=0325bb9bda523a85dc834b190289b7e25e8d92615ab2f2abffbe97983f0bb12ffb

RUN REACT_APP_PUB_KEY=$PUBKEY REACT_APP_ADDR=$ADDR yarn build

FROM nginx:alpine

COPY --from=app-build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
