# Galay Web-Wallet

## What is it for?

This repository is the generic Galoy Web Wallet application that uses the Galoy backend API. It can be customized and used by any community or organization. It is built with Nodejs, TypeScript, GraphQL, and React. It runs on any modern web browser and uses a responsive layout that's friendly on small screens.

Web Wallet is packaged as a docker image, and is automatically installed as part of Galoy helm charts.

With a default installation, this web application can be accessed with `wallet.domain.com`. It fetches data from a graphql API endpoint `graphql.domain.com` defined in [graphql-main-server](https://github.com/GaloyMoney/galoy/blob/main/src/servers/graphql-main-server.ts)

## How to run this repo locally?

In the project directory, you can run:

```sh
yarn install

export GRAPHQL_URI=`https://graphql.domain.com`
export GRAPHQL_SUBSCRIPTION_URI=`wss://graphql.domain.com`

# In a terminal
yarn dev:bundler

# In another terminal
yarn dev:server
```

Open [http://localhost:1234](http://localhost:1234) to view it in the browser.

## How to run this repo for production?

In the project directory, you can run:

```sh
yarn install

# To build the app under the `build` folder
yarn build:all

# To start the app
yarn prod:start

# To stop the app
yarn prod:stop

# To see production logs
yarn prod:logs
```
