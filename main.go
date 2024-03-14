package main

import (
	"flag"
	"log"
	"os"
	"time"

	"github.com/kylerisse/go-signs/signs"
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
	var serverMode, devMode bool
	flag.BoolVar(&serverMode, "s", false, "Server Mode")
	flag.BoolVar(&devMode, "d", false, "Development Mode")
	flag.Parse()

	if serverMode == true && devMode == true {
		log.Fatal("-d and -s are mutually exclusive")
	}

	if devMode {
		runDevMode()
	}

	conf := signs.NewClientConfig()
	if serverMode {
		conf = signs.NewServerConfig()
		err := conf.AddTwitterSecrets("secrets.env")
		if err != nil {
			log.Fatal(err)
		}
	}

	err := run(conf)
	if err != nil {
		log.Fatal(err)
	}
}

func runDevMode() {
	log.Println("Running in Development Mode")
	clconf := signs.NewTestClientConfig()
	go func() {
		time.Sleep(time.Duration(time.Second * 5))
		err := run(clconf)
		if err != nil {
			log.Fatal(err)
		}
	}()
	srvconf := signs.NewTestServerConfig()
	srvconf.AddTwitterSecrets("secrets.env")
	err := run(srvconf)
	if err != nil {
		log.Fatal(err)
	}
	os.Exit(0)
}
