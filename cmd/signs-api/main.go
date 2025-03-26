package main

import (
	"log"

	"github.com/kylerisse/go-signs/pkg/signs"
)

func run(c signs.Config) error {
	server := signs.NewServer(c)
	err := server.ListenAndServe()
	if err != nil {
		return err
	}
	return nil
}

func main() {

	conf := signs.NewServerConfig()
	err := run(conf)
	if err != nil {
		log.Fatal(err)
	}
}
