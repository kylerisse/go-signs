package server

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kylerisse/go-signs/pkg/schedule"
)

// Server is the main webserver process
type Server struct {
	httpd *http.Server
}

// NewServer sets up the cron runs for schedule and sponsors returns the *Server
func NewServer(c Config) *Server {
	sch := schedule.NewSchedule(c.ScheduleXMLurl)

	go func() {
		sch.UpdateFromXML()
		ticker := time.NewTicker(c.RefreshInterval)
		defer ticker.Stop()
		for range ticker.C {
			sch.UpdateFromXML()
		}
	}()

	router := gin.Default()
	setupRoutes(router, sch)

	srv := &http.Server{
		Handler:      router,
		Addr:         c.Address,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	return &Server{
		httpd: srv,
	}
}

// ListenAndServe the Server
func (s *Server) ListenAndServe() error {
	log.Printf("Listening on %s", s.httpd.Addr)
	return s.httpd.ListenAndServe()
}
