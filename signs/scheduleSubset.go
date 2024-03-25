package signs

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"unicode/utf8"
)

type ScheduleSubsetParams struct {
	year   int
	month  int
	day    int
	hour   int
	minute int
	room   string
}

func newScheduleSubsetParams(formValues url.Values) (ScheduleSubsetParams, error) {
	err := errors.Join(nil)
	year := formValues["year"][0]
	if _, err := strconv.Atoi(year); err != nil {
		err = errors.Join(err, errors.New("year is not integer"))
	}
	if utf8.RuneCountInString(year) != 4 {
		err = errors.Join(err, errors.New("year is not 4 characters long"))
	}
}

func (s *Schedule) subset()

// handleScheduleSubset takes the following parameters:
// ?year (required) - 4 digit (ex: 2024)
// ?month (required) - between 1 and 12
// ?day (required) - between 1 and 31
// ?hour (required) - between 0 and 23
// ?minutes (optional) - between 0 and 59
// ?room (optional) - string value
func (s *Schedule) handleScheduleSubset(w http.ResponseWriter, req *http.Request) {
	req.ParseForm()
	params, err := newScheduleSubsetParams(req.Form)

	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	s.mutex.Lock()
	err := enc.Encode(subset)
	if err != nil {
		log.Println("handleScheduleAll cannot encode schedule")
	}
	s.mutex.Unlock()
}
