package schedule

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	bolt "go.etcd.io/bbolt"
)

// Persistence handles optional file system persistence for schedule data
type Persistence struct {
	db     *bolt.DB
	dbPath string
}

// NewPersistence creates a new persistence instance
// If dbPath is empty, returns nil (persistence disabled)
func NewPersistence(dbPath string) (*Persistence, error) {
	if dbPath == "" {
		return nil, nil
	}

	// Ensure directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create persistence directory: %w", err)
	}

	// Open database
	db, err := bolt.Open(dbPath, 0600, &bolt.Options{
		Timeout: 1 * time.Second,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Initialize buckets
	if err := db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("schedule"))
		return err
	}); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	log.Printf("Schedule persistence enabled: %s", dbPath)
	return &Persistence{
		db:     db,
		dbPath: dbPath,
	}, nil
}

// Load attempts to load schedule from persistence
func (p *Persistence) Load() (*Schedule, error) {
	if p == nil || p.db == nil {
		return nil, nil
	}

	var presentations []Presentation
	err := p.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte("schedule"))
		if bucket == nil {
			return fmt.Errorf("schedule bucket not found")
		}

		data := bucket.Get([]byte("presentations"))
		if data == nil {
			return fmt.Errorf("no persisted schedule found")
		}

		if err := json.Unmarshal(data, &presentations); err != nil {
			return fmt.Errorf("failed to unmarshal persisted schedule: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	log.Printf("Loaded %d presentations from persistence", len(presentations))
	return &Schedule{
		Presentations: presentations,
		SessionCount:  len(presentations),
	}, nil
}

// Save persists the current schedule to disk
func (p *Persistence) Save(s *Schedule) error {
	if p == nil || p.db == nil {
		return nil
	}

	s.mutex.RLock()
	presentations := s.Presentations
	contentHash := s.ContentHash
	s.mutex.RUnlock()

	data, err := json.Marshal(presentations)
	if err != nil {
		return fmt.Errorf("failed to marshal schedule: %w", err)
	}

	err = p.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte("schedule"))
		if bucket == nil {
			return fmt.Errorf("schedule bucket not found")
		}

		if err := bucket.Put([]byte("presentations"), data); err != nil {
			return fmt.Errorf("failed to save presentations: %w", err)
		}

		if err := bucket.Put([]byte("contentHash"), []byte(contentHash)); err != nil {
			return fmt.Errorf("failed to save content hash: %w", err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to persist schedule: %w", err)
	}

	log.Printf("Persisted %d presentations to %s", len(presentations), p.dbPath)
	return nil
}

// Close closes the database connection
func (p *Persistence) Close() error {
	if p == nil || p.db == nil {
		return nil
	}
	return p.db.Close()
}
