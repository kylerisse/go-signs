package simulator

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	bolt "go.etcd.io/bbolt"
)

// Server is the main webserver process for the simulator
type Server struct {
	httpd           *http.Server
	db              *bolt.DB
	dbPath          string
	stopScheduler   chan struct{}
	schedulerDone   chan struct{}
	lastScheduleRun time.Time
}

// NewServer creates a new simulator server
func NewServer(dbPath, port string) (*Server, error) {
	// Open or create the database
	db, err := openDatabase(dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Initialize database structure
	if err := initializeDatabase(db); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	// Set up router
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Create HTTP server
	srv := &http.Server{
		Handler:      router,
		Addr:         fmt.Sprintf(":%s", port),
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	// Create the server
	server := &Server{
		httpd:           srv,
		db:              db,
		dbPath:          dbPath,
		stopScheduler:   make(chan struct{}),
		schedulerDone:   make(chan struct{}),
		lastScheduleRun: time.Time{},
	}

	// Add routes
	setupRoutes(router, db, server)

	// Start the scheduler
	go server.runScheduler(5 * time.Minute)

	return server, nil
}

// runScheduler runs a periodic check of the simulation
func (s *Server) runScheduler(interval time.Duration) {
	defer close(s.schedulerDone)

	// Run initial check
	s.runScheduledCheck()

	// Set up ticker for periodic checks
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	log.Printf("Scheduler started with interval of %v", interval)

	for {
		select {
		case <-ticker.C:
			s.runScheduledCheck()
		case <-s.stopScheduler:
			log.Println("Scheduler stopping...")
			return
		}
	}
}

// runScheduledCheck performs a single simulation check
func (s *Server) runScheduledCheck() {
	now := time.Now()
	log.Printf("Running scheduled simulation check at %s", now.Format("2006-01-02 15:04:05"))

	if err := checkOrCreateSimulationBucket(s.db); err != nil {
		log.Printf("Error in simulation check: %v", err)
	} else {
		log.Println("Simulation check completed successfully")
	}

	s.lastScheduleRun = now
}

// ListenAndServe starts the server and sets up graceful shutdown
func (s *Server) ListenAndServe() error {
	// Set up channel for shutdown signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start HTTP server in a goroutine
	serverErrors := make(chan error, 1)
	go func() {
		log.Printf("simulator listening on %s", s.httpd.Addr)
		if err := s.httpd.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serverErrors <- err
		}
	}()

	// Wait for termination signal or server error
	select {
	case <-quit:
		log.Println("Shutdown signal received...")
	case err := <-serverErrors:
		log.Printf("Server error: %v", err)
		return err
	}

	// Begin graceful shutdown
	log.Println("Shutting down server...")

	// Create a deadline for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Stop the scheduler
	close(s.stopScheduler)

	// Wait for scheduler to finish with timeout
	select {
	case <-s.schedulerDone:
		log.Println("Scheduler stopped successfully")
	case <-time.After(5 * time.Second):
		log.Println("Scheduler stop timed out")
	}

	// Close database connection
	if err := s.db.Close(); err != nil {
		log.Printf("Error closing database: %v", err)
	}

	// Shut down HTTP server with timeout
	if err := s.httpd.Shutdown(ctx); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
		return err
	}

	log.Println("Server shutdown complete")
	return nil
}

// Initialize database structure and buckets
func initializeDatabase(db *bolt.DB) error {
	// Initialize XML data bucket
	if err := checkOrCreateXMLBucket(db); err != nil {
		return fmt.Errorf("failed to initialize XML data: %w", err)
	}

	return nil
}

// openDatabase opens or creates the BoltDB database
func openDatabase(dbPath string) (*bolt.DB, error) {
	// Open the database
	db, err := bolt.Open(dbPath, 0600, &bolt.Options{
		Timeout: 1 * time.Second,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	log.Printf("Successfully opened database: %s", dbPath)
	return db, nil
}

// setupRoutes configures all routes for the application
func setupRoutes(r *gin.Engine, db *bolt.DB, server *Server) {
	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		schedulerStatus := "Never run"

		if !server.lastScheduleRun.IsZero() {
			schedulerStatus = fmt.Sprintf("Last check: %s",
				server.lastScheduleRun.Format("2006-01-02 15:04:05"))
		}

		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"time":      time.Now().Format(time.RFC3339),
			"scheduler": schedulerStatus,
		})
	})

	// Main endpoint to serve schedule JSON
	r.GET("/", func(c *gin.Context) {
		// Access the database to get presentations
		var presentations []byte
		err := db.View(func(tx *bolt.Tx) error {
			bucket := tx.Bucket([]byte("simulation"))
			if bucket == nil {
				return fmt.Errorf("simulation bucket not found")
			}
			presentations = bucket.Get([]byte("presentations"))
			if presentations == nil {
				return fmt.Errorf("presentations not found in simulation bucket")
			}
			return nil
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		// Set the content type to application/json
		c.Header("Content-Type", "application/json")
		// Write the presentations JSON directly
		c.Writer.Write(presentations)
	})

	// Endpoint to serve the XML data
	r.GET("/sign.xml", func(c *gin.Context) {
		// Access the database to get mockXML
		var xmlData []byte
		err := db.View(func(tx *bolt.Tx) error {
			bucket := tx.Bucket([]byte("simulation"))
			if bucket == nil {
				return fmt.Errorf("simulation bucket not found")
			}
			xmlData = bucket.Get([]byte("mockXML"))
			if xmlData == nil {
				return fmt.Errorf("mockXML not found in simulation bucket")
			}
			return nil
		})

		if err != nil {
			c.String(http.StatusInternalServerError, "Error: %v", err)
			return
		}

		// Set the content type to application/xml
		c.Header("Content-Type", "application/xml")
		// Write the XML data directly
		c.Writer.Write(xmlData)
	})

	// Serve static files for the frontend if needed
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Route not found",
		})
	})
}
