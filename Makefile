OS := $(shell uname -s | tr '[:upper:]' '[:lower:]')
ARCH := $(shell uname -m)

ifeq ($(OS),linux)
  ifeq ($(ARCH),aarch64)
    BIN_SUFFIX := -linux-arm64
  else
    BIN_SUFFIX := -linux-x64
  endif
else ifeq ($(OS),darwin)
  ifeq ($(ARCH),arm64)
    BIN_SUFFIX := -macos-arm64
  else
    BIN_SUFFIX := -macos-x64
  endif
else
  BIN_SUFFIX := -windows-x64.exe
endif

.PHONY: build-bin build-bin-api build-bin-master run-api run-master

## Build binaries for all apps and all platforms
build-bin:
	bash scripts/build-binaries.sh

## Build binaries for api only (all platforms)
build-bin-api:
	bash scripts/build-binaries.sh api

## Build binaries for master only (all platforms)
build-bin-master:
	bash scripts/build-binaries.sh master

## Build binary for a specific app and platform: make build-bin-for APP=api PLATFORM=linux
build-bin-for:
	bash scripts/build-binaries.sh $(APP) $(PLATFORM)

## Run api binary for current platform
run-api:
	apps/api/dist/bin/api$(BIN_SUFFIX)

## Run master binary for current platform
run-master:
	apps/master/dist/bin/master$(BIN_SUFFIX)