BIN_DIR=node_modules/.bin

test: unit integration

unit:
	yarn test:unit

integration:
	yarn test:integration

test-in-ci:
	docker-compose up -d
	. ./.envrc && \
		LOGLEVEL=error node_modules/.bin/jest --bail --runInBand --ci --reporters=default --reporters=jest-junit

integration-in-ci:
	. ./.envrc && \
		LOGLEVEL=error $(BIN_DIR)/jest --config ./test/jest-integration.config.js --bail --runInBand --ci --reporters=default --reporters=jest-junit

unit-in-ci:
	. ./.envrc && \
		LOGLEVEL=warn $(BIN_DIR)/jest --config ./test/jest-unit.config.js --ci --bail

check-code:
	yarn tsc-check
	yarn eslint-check
	yarn prettier-check
	yarn build
