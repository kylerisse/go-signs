package simulator

import (
	"fmt"
	"io"
	"log"
	"net/http"

	bolt "go.etcd.io/bbolt"
)

// checkOrCreateXMLBucket creates the xmlData bucket and populates it with conference data if needed
func checkOrCreateXMLBucket(db *bolt.DB) error {
	return db.Update(func(tx *bolt.Tx) error {
		// Create xmlData bucket if it doesn't exist
		bucket, err := tx.CreateBucketIfNotExists([]byte("xmlData"))
		if err != nil {
			return fmt.Errorf("create xmlData bucket: %w", err)
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

// fetchXML retrieves XML data from a URL
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
