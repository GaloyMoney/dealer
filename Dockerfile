FROM mhart/alpine-node:12.18 as app-build

WORKDIR /usr/src/app

COPY ./app/package.json ./app/yarn.lock ./

RUN yarn install --prod --frozen-lockfile

COPY ./app ./

RUN yarn build

FROM nginx:alpine

COPY --from=app-build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
