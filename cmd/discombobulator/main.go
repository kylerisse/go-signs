package main

import (
	"flag"
	"log"
	"os"
	"path/filepath"

	"github.com/kylerisse/go-signs/pkg/discombobulator"
)

func main() {
	// Parse command line arguments
	dbPath := flag.String("db", "./data/discombobulator.db", "Path to BoltDB database file")
	port := flag.String("port", "2018", "Port to listen on")
	flag.Parse()

	// Ensure data directory exists
	dataDir := filepath.Dir(*dbPath)
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		if err := os.MkdirAll(dataDir, 0755); err != nil {
			log.Fatalf("Failed to create data directory: %v", err)
		}
	}

	// Create and start the discombobulator server
	server, err := discombobulator.NewServer(*dbPath, *port)
	if err != nil {
		log.Fatalf("Failed to create server: %v", err)
	}

	log.Printf("Discombobulator started with database %s on port %s", *dbPath, *port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
