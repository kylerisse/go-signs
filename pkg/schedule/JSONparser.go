package schedule

import (
	"encoding/json"
	"errors"
	"html"
	"log"
	"strings"
	"time"
)

// DrupalJSON
type DrupalNode struct {
	Name        string
	Location    string
	StartTime   string
	EndTime     string
	Speakers    interface{} // Can be string (Drupal) or []string (simulator)
	Topic       string
	Description string
}

func DrupalToPresentations(b []byte) ([]Presentation, error) {
	var drupalNodes []DrupalNode
	err := json.Unmarshal(b, &drupalNodes)
	if err != nil {
		return nil, err
	}
	var ps []Presentation
	for _, dn := range drupalNodes {
		p, err := toPresentation(dn)
		if err != nil {
			log.Printf("Invalid DrupalNode %v (error: %v)", dn, err)
			continue
		}
		ps = append(ps, p)
	}
	if len(ps) < 1 {
		return nil, errors.New("no valid DrupalNodes")
	}
	return ps, nil
}

func toPresentation(dn DrupalNode) (Presentation, error) {
	var p Presentation

	if dn.Name == "" {
		return Presentation{}, errors.New("empty Name")
	}
	p.Name = html.UnescapeString(dn.Name)

	if dn.Description == "" {
		return Presentation{}, errors.New("empty Description")
	}
	p.Description = html.UnescapeString(
		cleanupNewlinesAndSpaces(dn.Description))

	st, err := time.Parse(time.RFC3339, dn.StartTime)
	if err != nil {
		return Presentation{}, errors.New("invalid StartTime")
	}
	p.StartTime = st

	et, err := time.Parse(time.RFC3339, dn.EndTime)
	if err != nil {
		return Presentation{}, errors.New("empty EndTime")
	}
	p.EndTime = et

	p.Speakers = extractSpeakersFromInterface(dn.Speakers)

	p.Topic = html.UnescapeString(dn.Topic)

	if dn.Location == "" {
		return Presentation{}, errors.New("empty Location")
	}
	p.Location = html.UnescapeString(dn.Location)

	return p, nil
}

// extractSpeakersFromInterface handles both string (Drupal) and []string (simulator) formats
func extractSpeakersFromInterface(speakers interface{}) []string {
	switch v := speakers.(type) {
	case string:
		// Drupal format: comma-separated string
		return extractSpeakers(html.UnescapeString(v))
	case []interface{}:
		// Simulator format: array of strings
		var rs []string
		for _, s := range v {
			if str, ok := s.(string); ok {
				cleaned := cleanupNewlinesAndSpaces(html.UnescapeString(str))
				if cleaned != "" {
					rs = append(rs, cleaned)
				}
			}
		}
		return rs
	default:
		return []string{}
	}
}

func extractSpeakers(speakers string) []string {
	var rs []string
	for _, s := range strings.Split(speakers, ",") {
		cleaned := cleanupNewlinesAndSpaces(s)
		if cleaned != "" {
			rs = append(rs, cleaned)
		}
	}
	return rs
}

func cleanupNewlinesAndSpaces(s string) string {
	rs := strings.TrimPrefix(s, "\n")
	rs = strings.TrimSuffix(rs, "\n")
	rs = strings.Replace(rs, "\n", " ", -1)
	rs = strings.Join(strings.Fields(rs), " ")
	rs = strings.TrimPrefix(rs, " ")
	rs = strings.TrimSuffix(rs, " ")
	return rs
}
