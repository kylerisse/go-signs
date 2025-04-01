package sponsor

import (
	"encoding/json"
	"net/http"
)

func (m *Manager) HandleGold(w http.ResponseWriter, r *http.Request) {
	goldSponsors := []string{
		"canonical.png",
		"flox.png",
		"google.png",
		"meta.png",
		"netknights.png",
		"redhat.png",
		"system76.png",
		"victoriametrics.png",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goldSponsors)
}
