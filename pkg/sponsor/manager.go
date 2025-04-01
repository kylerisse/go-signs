package sponsor

import (
	"embed"
	"io/fs"
	"net/http"
)

// Embed all sponsor images
//
//go:embed images/*
var imagesFS embed.FS

type Manager struct {
	images fs.FS
}

func NewManager() (*Manager, error) {
	imagesDir, err := fs.Sub(imagesFS, "images")
	if err != nil {
		return nil, err
	}
	return &Manager{
		images: imagesDir,
	}, nil
}

func (m *Manager) ImageHandler() http.Handler {
	return http.FileServer(http.FS(m.images))
}
