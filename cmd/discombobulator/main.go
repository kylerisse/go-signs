package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	bolt "go.etcd.io/bbolt"
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

	// Open or create the database
	db, err := bolt.Open(*dbPath, 0600, nil)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Check or create xmlData bucket and populate with scale XML data if needed
	err = checkOrCreateXMLBucket(db)
	if err != nil {
		log.Fatalf("Failed to initialize XML data: %v", err)
	}

	log.Printf("Discombobulator started with database %s on port %s", *dbPath, *port)
	// Your code would continue here
}

func checkOrCreateXMLBucket(db *bolt.DB) error {
	return db.Update(func(tx *bolt.Tx) error {
		// Create xmlData bucket if it doesn't exist
		bucket, err := tx.CreateBucketIfNotExists([]byte("xmlData"))
		if err != nil {
			return fmt.Errorf("create bucket: %w", err)
		}

		// Check each key and populate if needed
		for x := 13; x <= 22; x++ {
			key := fmt.Sprintf("%dx", x)

			// Check if this key already exists
			if bucket.Get([]byte(key)) != nil {
				log.Printf("XML data for %s already exists, skipping", key)
				continue
			}

			// Key doesn't exist, fetch the data
			url := fmt.Sprintf("https://www.socallinuxexpo.org/scale/%s/sign.xml", key)
			log.Printf("Fetching XML data from %s", url)

			xmlData, err := fetchXML(url)
			if err != nil {
				log.Printf("Warning: Failed to fetch XML for %s: %v", key, err)
				continue
			}

			err = bucket.Put([]byte(key), xmlData)
			if err != nil {
				return fmt.Errorf("store XML data for %s: %w", key, err)
			}
			log.Printf("Stored XML data for %s (%d bytes)", key, len(xmlData))
		}

		return nil
	})
}

func fetchXML(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP request failed with status: %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}
