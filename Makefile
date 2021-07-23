test: unit integration

unit:
	yarn test:unit

integration:
	yarn test:integration

test-in-ci:
	docker-compose up -d
	. ./.envrc && \
		LOGLEVEL=error node_modules/.bin/jest --bail --runInBand --ci --reporters=default --reporters=jest-junit

check-code:
	yarn tsc-check
	yarn eslint-check
	yarn prettier-check
	yarn build
