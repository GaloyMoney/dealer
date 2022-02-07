# Galoy Web-Wallet

## What is it for?

This repository is the generic Galoy Web Wallet application that uses the Galoy backend API. It can be customized and used by any community or organization. It is built with Nodejs, TypeScript, GraphQL, and React. It runs on any modern web browser and uses a responsive layout that's friendly on small screens.

Web Wallet is packaged as a docker image, and is automatically installed as part of Galoy helm charts.

With a default installation, this web application can be accessed with `wallet.domain.com`. It fetches data from a graphql API endpoint `graphql.domain.com` defined in [graphql-main-server](https://github.com/GaloyMoney/galoy/blob/main/src/servers/graphql-main-server.ts)

## Config

The project depends on a few environment variables to be set. The `.env.local` root file has a list of them. Copy that file to a `.env` root file and modify that copy as needed.

## How to run this repo locally?

In the project directory, modify the `.env` file as needed, then you can run:

```sh
yarn install

# In a terminal
yarn dev:bundler

# In another terminal
yarn dev:server
```

Open [http://localhost:1234](http://localhost:1234) to view it in the browser.

## How to run this repo for production?

In the project directory, export the env vars, then you can run:

```sh
yarn install

# To build the app under the `build` folder
yarn build:all

# To start the app
yarn prod:start
```
