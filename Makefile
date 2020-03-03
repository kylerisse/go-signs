BINARY := go-signs
VERSION := 0.1
BUILDOS := "darwin" # builder OS [darwin or linux]
BIN_DIR := $(GOPATH)/bin
GOMETALINTER := $(BIN_DIR)/gometalinter
ESLINT := /usr/local/bin/eslint

.PHONY: info
info:
	# please use make lint, make test, make clean, or make build

# TODO eval broken in linux, build uses os specific parameter for tar [-s darwin / --transform linux]
.PHONY: build
build: test clean releases resources
	# make: build
	@if [[ $(BUILDOS) =~ .*darwin.* ]]; then\
		tar -cvzf $(BINARY)-v$(VERSION).tar.gz -s /^out/$(BINARY)/ out/;\
	fi
	@if [[ $(BUILDOS) =~ .*linux.* ]]; then\
		tar -cvzf $(BINARY)-v$(VERSION).tar.gz --transform s/^out/$(BINARY)/ out/;\
	fi

.PHONY: test
test: lint
	# make: test
	go test --race -v ./server/...

.PHONY: lint
lint: lint-js lint-go

.PHONY: lint-js
lint-js: $(ESLINT)
	#eslint client/*.js

$(ESLINT):
	npm install -g eslint prettier eslint-plugin-prettier eslint-config-prettier

PHONY: lint-go
lint-go: $(GOMETALINTER)
	gometalinter ./...

$(GOMETALINTER):
	go get -v -u github.com/alecthomas/gometalinter
	gometalinter --install

.PHONY: releases
releases: test
	# make: releases
	mkdir -p out
	GOOS=linux GOARCH=amd64 go build -o out/$(BINARY)-v$(VERSION)-linux-amd64
	GOOS=linux GOARCH=arm GOARM=5 go build -o out/$(BINARY)-v$(VERSION)-linux-arm
	GOOS=darwin GOARCH=amd64 go build -o out/$(BINARY)-v$(VERSION)-darwin-amd64
	GOOS=freebsd GOARCH=amd64 go build -o out/$(BINARY)-v$(VERSION)-freebsd-amd64

.PHONY: resources
resources:
	# make: resources
	mkdir -p out
	cp -rv client out/client
	cp -rv images out/images
	cp -v LICENSE.md out/
	cp -v config.json out/

.PHONY: clean
clean:
	# make: clean
	find ./ -name .DS_Store -delete
	rm -rf out

.PHONY: mrproper
mrproper: clean
	# make: mrproper
	rm -f $(BINARY)-v*.tar.gz
