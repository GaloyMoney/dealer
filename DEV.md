# Dev environment

## Setup

This setup was last tested with the following tools:
```
$ node --version
v14.17.5
$ yarn --version
1.22.5
$ direnv --version
2.21.2
$ docker --version
Docker version 20.10.8, build 3967b7d
$ docker-compose --version
docker-compose version 1.25.0, build unknown
```

We use [direnv](https://direnv.net) to load environment variables needed for running the integration tests.
Don't forget to add the [direnv hook](https://direnv.net/docs/hook.html) to your `shell.rc` file.

The host of these two environment variables depends on where the resource is running (docker host, local host, etc.)
- GRAPHQL_URI="http://<host>:4000/graphql"
- DATABASE_URL="postgres://postgres:postgres@<host>:5432/galoy"


Clone the repo and install dependencies:
```
$ git clone git@github.com:GaloyMoney/dealer.git
$ cd dealer
$ direnv allow
direnv reload
direnv: direnv: loading ~/projects/GaloyMoney/dealer/.envrc
(...)
$ yarn install
```

## Development

To start all in docker:
```
$ make start
```

Migrate the database the first time around:
```
$ make migrate-db
```


## Testing

To run the test suite you can run:

```bash
$ make test
```
To execute the test suite.

### Run unit tests

```bash
$ yarn test:unit
# or
$ make unit
```

### Run integration tests

To execute the integration tests.

```bash
$ yarn test:integration
# or
$ make integration
```

### Run specific test file

To execute a specific test file:

#### Unit

Example to run `test/unit/OkexExchangeConfiguration.spec.ts`

```bash
$ TEST=utils yarn test:unit
# or
$ TEST=utils make unit
```
where `utils` is the name of the file `utils.spec.ts`

#### Integration

Example to run `test/integration/Dealer.spec.ts`

```bash
$ TEST=Dealer yarn test:integration
# or
$ TEST=Dealer make integration
```

if within a specific test suite you want to run/debug only a describe or it(test) block please use:
* [describe.only](https://jestjs.io/docs/api#describeonlyname-fn): just for debug purposes
* [it.only](https://jestjs.io/docs/api#testonlyname-fn-timeout): just for debug purposes
* [it.skip](https://jestjs.io/docs/api#testskipname-fn): use it when a test is temporarily broken. Please don't commit commented test cases

## Running checks

It's recommended that you use plugins in your editor to run ESLint checks and perform Prettier formatting on-save.

To run all the checks required for the code to pass GitHub actions check:

```
$ make check-code
(...)
$ echo $?
0
```

If you need to run Prettier through the command line, you can use:

```
$ yarn prettier -w .
```

## Contributing

When opening a PR please pay attention to having a [clean git history](https://medium.com/@catalinaturlea/clean-git-history-a-step-by-step-guide-eefc0ad8696d) with good [commit messages](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
It is the responsibility of the PR author to resolve merge conflicts before a merge can happen. If the PR is open for a long time a rebase may be requested.
