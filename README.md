# Galoy Tips

## What is it for?

This repo is a web application that can be used to send tips to users.

It's packaged as a docker image, and is automatically installed as part of the Galoy helm charts.

With a default installation, Galoy-Tips can be access under `tips.domain.com`.

Galoy-Tips usese query, mutation, and subscription operations from the Galoy's graphql API endpoints `api.domain.com` as defined in [schema.graphql](https://github.com/GaloyMoney/galoy/blob/main/src/graphql/main/schema.graphql)

## How to run this repo locally?

In the project directory, you can run:

```sh
yarn install
export GRAPHQL_URI="https://api.domain.com/graphql"
export GRAPHQL_SUBSCRIPTION_URI="wss://api.domain.com/graphql"
yarn start
```

This will run the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload when you make edits.

You will also see any lint errors in the console.

### How to build for production?

In the project directory, you can run:

```sh
yarn install
export GRAPHQL_URI="https://api.domain.com/graphql"
export GRAPHQL_SUBSCRIPTION_URI="wss://api.domain.com/graphql"
yarn build
```

This will build the app for production under a `build` folder. It will bundle React in production mode and optimize the build for the best performance. The build will be minified, and the bundled files will include unique hashes in their names.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
