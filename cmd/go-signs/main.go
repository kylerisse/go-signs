package main

import (
	"flag"
	"log"

	"github.com/kylerisse/go-signs/pkg/server"
)

func run(c server.Config) error {
	server := server.NewServer(c)
	err := server.ListenAndServe()
	if err != nil {
		return err
	}
	return nil
}

func main() {
	listenPort := flag.String("port", "2017", "Port to listen on (1-65535)")
	xmlEndpoint := flag.String("xml", "http://www.socallinuxexpo.org/scale/21x/sign.xml", "URL to Drupal XML endpoint (must be http or https)")
	refreshInterval := flag.Int("refresh", 5, "Schedule refresh interval in minutes (minimum 1)")
	flag.Parse()

	// Create config with validation
	conf, err := server.NewConfig(*listenPort, *xmlEndpoint, *refreshInterval)
	if err != nil {
		// Show usage on validation error
		flag.Usage()
		log.Fatal(err)
	}

	err = run(conf)
	if err != nil {
		log.Fatal(err)
	}
}
