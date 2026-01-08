package schedule

import (
	"encoding/xml"
	"log"
	"regexp"
	"strings"
	"time"
)

// Nodes <nodes> top level document
type Nodes struct {
	Nodes []Node `xml:"node"`
}

// Node <node> from the upstream XML, pre cleanup
type Node struct {
	Title         string `xml:"Title"`
	Room          string `xml:"Room"`
	Day           string `xml:"Day"`
	Time          string `xml:"Time"`
	Speakers      string `xml:"Speakers"`
	SpeakerIDs    string `xml:"Speaker-IDs"`
	Topic         string `xml:"Topic"`
	ShortAbstract string `xml:"Short-abstract"`
	Photo         string `xml:"Photo"`
	Path          string `xml:"Path"`
}

func BytesToPresentations(b []byte) ([]Presentation, error) {
	var xmlnodes Nodes
	err := xml.Unmarshal(b, &xmlnodes)
	if err != nil {
		return nil, err
	}
	var ps []Presentation
	for _, n := range xmlnodes.Nodes {
		ps = append(ps, n.toPresentation())
	}
	return ps, nil
}

func (n *Node) toPresentation() Presentation {
	var p Presentation
	p.Name = cleanupNewlinesAndSpaces(n.Title)
	p.Description = extractDescription(n.ShortAbstract)
	p.Location = cleanupNewlinesAndSpaces(n.Room)
	p.StartTime = extractStartTime(n.Time)
	p.EndTime = extractEndTime(n.Time)
	p.Speakers = extractSpeakers(n.Speakers)
	p.Topic = n.Topic
	return p
}

func removeHTMLTags(s string) string {
	re := regexp.MustCompile(`<[^>]*>`)
	return re.ReplaceAllString(s, "")
}

func extractDescription(s string) string {
	return cleanupNewlinesAndSpaces(removeHTMLTags(s))
}

func extractTimeByIndex(s string, i int) time.Time {
	rs := strings.Split(s, " ")
	rt := strings.Split(rs[i], "\"")[1]
	t, err := time.Parse(time.RFC3339, rt)
	if err != nil {
		log.Printf("error parsing timestring %s", rt)
	}
	return t
}

func extractStartTime(s string) time.Time {
	return extractTimeByIndex(s, 6)
}

func extractEndTime(s string) time.Time {
	return extractTimeByIndex(s, 12)
}
