package frontend

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

// Embed all files in the frontend folder
//
//go:embed files/*
var frontendFS embed.FS

// Handler returns an HTTP handler for serving frontend assets
func Handler() http.Handler {
	// Create a sub filesystem rooted at "frontend"
	frontendDir, err := fs.Sub(frontendFS, "files")
	if err != nil {
		log.Fatal(err)
	}

	return http.FileServer(http.FS(frontendDir))
}
