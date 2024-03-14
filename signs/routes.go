package signs

import (
	"net/http"

	"github.com/gorilla/mux"
)

func createRoutes(r *mux.Router, s *Schedule, t *Twitter) {
	r.PathPrefix("/img/").Handler(http.StripPrefix("/img/", http.FileServer(http.Dir("./images"))))
	r.HandleFunc("/schedule/", s.handleScheduleAll)
	r.HandleFunc("/twitter/", t.handleTwitter)
}
