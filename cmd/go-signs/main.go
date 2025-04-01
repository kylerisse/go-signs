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
	listenPort := flag.String("port", "2017", "Port to listen on")
	xmlEndpoint := flag.String("xml", "http://www.socallinuxexpo.org/scale/21x/sign.xml", "URL to Drupal XML endpoint")
	refreshInterval := flag.Int("refresh", 5, "Schedule refresh interval in minutes")
	flag.Parse()

	conf := server.NewConfig(*listenPort, *xmlEndpoint, *refreshInterval)
	err := run(conf)
	if err != nil {
		log.Fatal(err)
	}
}
