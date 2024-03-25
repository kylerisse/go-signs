package signs

import (
	"net/http"

	"github.com/gorilla/mux"
)

func createRoutes(r *mux.Router, s *Schedule) {

	r.PathPrefix("/img").Handler(http.StripPrefix("/img/", http.FileServer(http.Dir("./images"))))
	r.PathPrefix("/img/").Handler(http.StripPrefix("/img/", http.FileServer(http.Dir("./images"))))

	r.HandleFunc("/schedule", s.handleScheduleSubset)
	r.HandleFunc("/schedule/", s.handleScheduleSubset)

	r.HandleFunc("/schedule/now", s.handleScheduleNow)
	r.HandleFunc("/schedule/now/", s.handleScheduleNow)

	r.HandleFunc("/schedule/all", s.handleScheduleAll)
	r.HandleFunc("/schedule/all/", s.handleScheduleAll)
}
