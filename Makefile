# go-signs

test:
	go test --race -v ./...

build: test
	go build -o out/signs-api main.go

deps:
	go mod verify
	go mod tidy

clean:
	rm -rfi out/*

mrproper: clean
	rm -rfi data/*
