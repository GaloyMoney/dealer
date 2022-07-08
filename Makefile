BIN_DIR=node_modules/.bin
clean-deps:
	docker compose down

start-deps:
	docker compose up -d
	direnv reload

reset-deps: clean-deps start-deps

dealer-integration-in-ci:
	. ./.envrc && yarn dealer migrate-ts up && yarn dealer ci:test:integration

dealer-check-code:
	yarn dealer tsc-check
	yarn dealer eslint-check
	yarn dealer build

dealer-watch-compile:
	$(BIN_DIR)/tsc -p ./dealer/tsconfig-build.json --watch  --noEmit --skipLibCheck

dealer-unit-in-ci:
	. ./.envrc && yarn dealer ci:test:unit
