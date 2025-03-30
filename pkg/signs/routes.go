package signs

import (
	"embed"
	"io/fs"
	"log"
	"net/http"

	// TODO: switch to gin or something else
	"github.com/gorilla/mux"
	"github.com/kylerisse/go-signs/pkg/schedule"
)

// Embed all files in the images folder
//
//go:embed images/*
var imagesFS embed.FS

// Embed all files in the frontend folder
//
//go:embed frontend/*
var frontendFS embed.FS

func CreateRoutes(r *mux.Router, s *schedule.Schedule) {
	// Create a sub filesystem rooted at "frontend"
	frontendDir, err := fs.Sub(frontendFS, "frontend")
	if err != nil {
		log.Fatal(err)
	}

	// Create a sub filesystem rooted at "images"
	imagesDir, err := fs.Sub(imagesFS, "images")
	if err != nil {
		log.Fatal(err)
	}

	r.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.FS(imagesDir))))
	r.HandleFunc("/schedule/", s.HandleScheduleAll)
	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.FS(frontendDir))))
}
