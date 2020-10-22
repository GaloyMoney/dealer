FROM mhart/alpine-node:12.18 as app-build

WORKDIR /usr/src/app

COPY ./app/package.json ./app/yarn.lock ./

RUN yarn install --prod --frozen-lockfile

RUN yarn add bolt11

RUN yarn global add browserify uglify-es

COPY ./app ./

RUN browserify -r bolt11 --standalone lightningPayReq | uglifyjs -c -m -o ./app/public/bolt11.min.js

RUN yarn build

FROM nginx:alpine

COPY --from=app-build /usr/src/app/build /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY ./custom.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
