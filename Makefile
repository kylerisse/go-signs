# go-signs

test:
	go test --race -v ./...

build: test
	go build -o out/go-signs cmd/go-signs/main.go

deps:
	go mod verify
	go mod tidy

clean:
	rm -rfi out/* || exit 0

mrproper: clean
	rm -rfi data/* || exit 0
