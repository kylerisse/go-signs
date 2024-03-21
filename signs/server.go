package signs

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	cron "gopkg.in/robfig/cron.v2"
)

// Server is the main webserver process
type Server struct {
	cron  *cron.Cron
	httpd *http.Server
}

// NewServer sets up the cron runs for schedule and sponsors returns the *Server
func NewServer(c Config) *Server {
	cron := cron.New()

	sch := newSchedule()
	if c.ScheduleXMLurl != "" && c.ScheduleXMLupdate != "" {
		sch.xmlURL = c.ScheduleXMLurl
		cron.AddFunc(c.ScheduleXMLupdate, sch.updateFromXML)
		sch.updateFromXML()
	}
	if c.ScheduleJSONurl != "" && c.ScheduleJSONupdate != "" {
		sch.jsonURL = c.ScheduleJSONurl
		cron.AddFunc(c.ScheduleJSONupdate, sch.updateFromJSON)
		sch.updateFromJSON()
	}

	r := mux.NewRouter()
	r.Use(middlewareLogging)
	createRoutes(r, sch)

	srv := &http.Server{
		Handler:      r,
		Addr:         c.Address,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	return &Server{
		cron:  cron,
		httpd: srv,
	}
}

// ListenAndServe the Server
func (s *Server) ListenAndServe() error {
	s.cron.Start()
	log.Printf("Listening on %s", s.httpd.Addr)
	return s.httpd.ListenAndServe()
}

func middlewareLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s %s", r.RemoteAddr, r.Header["User-Agent"], r.Method, r.RequestURI)
		next.ServeHTTP(w, r)
	})
}
