package server

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kylerisse/go-signs/pkg/frontend"
	"github.com/kylerisse/go-signs/pkg/schedule"
	"github.com/kylerisse/go-signs/pkg/sponsor"
)

// setupRoutes configures all routes for the application
func setupRoutes(r *mux.Router, s *schedule.Schedule) {
	// Set up sponsor handling
	sponsorManager, err := sponsor.NewManager()
	if err != nil {
		log.Fatal(err)
	}

	// Configure all routes
	r.HandleFunc("/sponsors/platinum", sponsorManager.HandlePlatinum)
	r.HandleFunc("/sponsors/gold", sponsorManager.HandleGold)
	r.PathPrefix("/sponsors/images/").Handler(http.StripPrefix("/sponsors/images/", sponsorManager.ImageHandler()))
	r.HandleFunc("/schedule/", s.HandleScheduleAll)
	r.PathPrefix("/").Handler(http.StripPrefix("/", frontend.Handler()))
}
