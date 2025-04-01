package sponsor

import (
	"encoding/json"
	"net/http"
)

func (m *Manager) HandlePlatinum(w http.ResponseWriter, r *http.Request) {
	goldSponsors := []string{
		"aws.png",
		"github.png",
		"openintel.png",
		"microsoft.png",
		"zabbix.png",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goldSponsors)
}
