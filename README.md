# Galoy Pay

## What is it for?

This repo is a web application that can be used to send tips or payments to users.

It's packaged as a docker image, and is automatically installed as part of the Galoy helm charts.

With a default installation, Galoy-Pay can be accessed under `pay.domain.com`.

Galoy-Pay uses query, mutation, and subscription operations from the Galoy's graphql API endpoints `api.domain.com` as defined in [schema.graphql](https://github.com/GaloyMoney/galoy/blob/main/src/graphql/main/schema.graphql)

## How to run this repo locally?

In the project directory, create a file name `.env.local` and fill it with

```
NEXT_PUBLIC_GRAPHQL_HOSTNAME='api.staging.galoy.io'
```

(or use your custom API URL), then run

```sh
yarn install
yarn dev
```

This will run the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload when you make edits.

You will also see any lint errors in the console.

## How to run this repo in docker?

In your terminal, run

```sh
yarn build:docker
```

then run

```sh
yarn dev:docker
```

This will spin up an instance of a galoy-pay docker container running on <http://localhost:3000>

This will also run the app in production mode.

## How to build for production?

In the project directory, you can run:

```sh
yarn install
yarn build
```

This will build the app for production under a `build` folder. It will bundle React in production mode and optimize the build for the best performance. The build will be minified, and the bundled files will include unique hashes in their names.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
