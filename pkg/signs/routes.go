package signs

import (
	"net/http"

	// TODO: switch to gin or something else
	"github.com/gorilla/mux"
)

func createRoutes(r *mux.Router, s *Schedule) {
	r.PathPrefix("/img/").Handler(http.StripPrefix("/img/", http.FileServer(http.Dir("./images"))))
	r.HandleFunc("/schedule/", s.handleScheduleAll)
}
