package simulator

import (
	"fmt"
	"io/fs"
	"log"

	bolt "go.etcd.io/bbolt"
)

// checkOrCreateJSONBucket creates the jsonData bucket and populates it with conference data if needed
// SCaLE 13x - 22x data is loaded from the archive
// SCALE 23x+ fetches from Drupal
func checkOrCreateJSONBucket(db *bolt.DB, archiveDir fs.FS) error {
	return db.Update(func(tx *bolt.Tx) error {
		//Create jsonData bucket if it doesn't exist
		bucket, err := tx.CreateBucketIfNotExists([]byte("jsonData"))
		if err != nil {
			return fmt.Errorf("create jsonData bucket: %w", err)
		}

		// Check each key and populate if needed
		//
		// archive first
		for x := 13; x <= 22; x++ {
			key := fmt.Sprintf("%dx", x)

			// Check if the key already exists
			if bucket.Get([]byte(key)) != nil {
				log.Printf("JSON data for %s already exists, skipping", key)
				continue
			}

			data, err := fs.ReadFile(archiveDir, (fmt.Sprintf("%dx.json", x)))
			if err != nil {
				return fmt.Errorf("cannot read archive file: %w", err)
			}

			err = bucket.Put([]byte(key), data)
			if err != nil {
				return fmt.Errorf("store archived JSON data for %s: %w", key, err)
			}
			log.Printf("Stored JSON data for %s (%d bytes)", key, len(data))
		}
		return nil
	})
}
