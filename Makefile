.PHONY: run-api run-master

## Run api (built JS)
run-api:
	cd apps/api && bun dist/index.js

## Run master (built JS)
run-master:
	cd apps/master && bun dist/index.js