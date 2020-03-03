package signs

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"
)

// Schedule contains all presentations and events
type Schedule struct {
	Presentations []Presentation
	mutex         *sync.Mutex
	xmlURL        string
	xmlRaw        string
	jsonURL       string
	jsonRaw       string
}

// Event is basic scheduling primitive
type Event struct {
	Name        string
	Description string
	Location    string
	StartTime   time.Time
	EndTime     time.Time
	//Sponsors    []sponsors
}

// Presentation is an extension of event with speakers and a topic
type Presentation struct {
	Event
	Speakers []string
	Topic    string
}

// NewSchedule produces a new Schedule
func newSchedule() *Schedule {
	var sch Schedule
	sch.mutex = &sync.Mutex{}
	return &sch
}

func (s *Schedule) updateSchedule(ps []Presentation) {
	s.mutex.Lock()
	s.Presentations = ps
	s.mutex.Unlock()
	log.Printf("Schedule updated")
}

func (s *Schedule) updateFromXML() {
	log.Printf("Update Schedule from %v", s.xmlURL)
	body, err := fetch(s.xmlURL)
	if err != nil {
		log.Printf("error %v", err)
		return
	}
	if string(body) == s.xmlRaw {
		log.Printf("no change to XML schedule")
		return
	}
	ps, err := bytesToPresentations(body)
	if err != nil {
		log.Printf("Unmarshal error %v", err)
		return
	}
	s.xmlRaw = string(body)
	s.updateSchedule(ps)
}

func (s *Schedule) updateFromJSON() {
	log.Printf("Update Schedule from %v", s.jsonURL)
	body, err := fetch(s.jsonURL)
	if err != nil {
		log.Printf("error %v", err)
		return
	}
	if string(body) == s.jsonRaw {
		log.Printf("no change to JSON schedule")
		return
	}
	var tmp Schedule
	err = json.Unmarshal(body, &tmp)
	if err != nil {
		log.Printf("Unmarshal error %v", err)
		return
	}
	s.jsonRaw = string(body)
	s.updateSchedule([]Presentation(tmp.Presentations))
}

func (s *Schedule) handleScheduleAll(w http.ResponseWriter, req *http.Request) {
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	s.mutex.Lock()
	err := enc.Encode(s)
	if err != nil {
		log.Println("handleScheduleAll cannot encode schedule")
	}
	s.mutex.Unlock()
}
