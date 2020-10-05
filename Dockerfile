FROM mhart/alpine-node:12.18 as app-build

WORKDIR /usr/src/app

COPY package.json ./

RUN yarn install

COPY . ./

RUN yarn build

FROM nginx:alpine

COPY --from=app-build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD [“nginx”, “-g”,”daemon off;”]
