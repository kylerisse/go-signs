package discombobulator

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"log"
	"math/rand"
	"regexp"
	"strings"
	"time"

	"github.com/kylerisse/go-signs/pkg/schedule"
	bolt "go.etcd.io/bbolt"
)

// checkOrCreateSimulationBucket creates the simulation bucket and initializes it if needed
func checkOrCreateSimulationBucket(db *bolt.DB) error {
	return db.Update(func(tx *bolt.Tx) error {
		// Create simulation bucket if it doesn't exist
		bucket, err := tx.CreateBucketIfNotExists([]byte("simulation"))
		if err != nil {
			return fmt.Errorf("create simulation bucket: %w", err)
		}

		today := time.Now()
		resetNeeded := false

		// Check if endDate key exists
		endDateBytes := bucket.Get([]byte("endDate"))
		if endDateBytes == nil {
			// If endDate doesn't exist, we need to reset
			resetNeeded = true
			log.Println("No endDate found, will initialize simulation bucket")
		} else {
			// Check if today is past the endDate
			endDateStr := string(endDateBytes)
			endDate, err := time.Parse("2006-01-02", endDateStr)
			if err != nil {
				log.Printf("Invalid endDate format: %s, will reset", endDateStr)
				resetNeeded = true
			} else if today.After(endDate) {
				log.Printf("Current date %s is past endDate %s, will reset simulation",
					today.Format("2006-01-02"), endDateStr)
				resetNeeded = true
			} else {
				log.Printf("Simulation bucket has valid endDate: %s", endDateStr)
			}
		}

		// Reset the bucket if needed
		if resetNeeded {
			// First, delete all existing keys
			c := bucket.Cursor()
			for k, _ := c.First(); k != nil; k, _ = c.Next() {
				if err := bucket.Delete(k); err != nil {
					return fmt.Errorf("failed to delete key %s: %w", k, err)
				}
			}

			// Then create a new endDate key with date 3 days from now (4 days including today)
			endDateValue := today.AddDate(0, 0, 3).Format("2006-01-02")
			if err := bucket.Put([]byte("endDate"), []byte(endDateValue)); err != nil {
				return fmt.Errorf("failed to set endDate: %w", err)
			}

			log.Printf("Reset simulation bucket with new endDate: %s", endDateValue)

			// Create simulated conference data
			if err := createSimulatedConferenceData(tx, today); err != nil {
				return fmt.Errorf("failed to create simulated conference data: %w", err)
			}
		}

		return nil
	})
}

// createSimulatedConferenceData randomly selects and modifies a conference schedule
func createSimulatedConferenceData(tx *bolt.Tx, today time.Time) error {
	// Get the xmlData bucket
	xmlBucket := tx.Bucket([]byte("xmlData"))
	if xmlBucket == nil {
		return fmt.Errorf("xmlData bucket not found")
	}

	// Get the simulation bucket
	simBucket := tx.Bucket([]byte("simulation"))
	if simBucket == nil {
		return fmt.Errorf("simulation bucket not found")
	}

	// Get all XML keys
	var xmlKeys []string
	c := xmlBucket.Cursor()
	for k, _ := c.First(); k != nil; k, _ = c.Next() {
		xmlKeys = append(xmlKeys, string(k))
	}

	if len(xmlKeys) == 0 {
		return fmt.Errorf("no XML data found")
	}

	selectedKey := xmlKeys[rand.Intn(len(xmlKeys))]
	log.Printf("Selected %s for simulation", selectedKey)

	// Get the XML data
	xmlData := xmlBucket.Get([]byte(selectedKey))
	if xmlData == nil {
		return fmt.Errorf("no data found for key %s", selectedKey)
	}

	// Parse and modify the XML data
	modifiedXML, err := modifyXMLDates(xmlData, today)
	if err != nil {
		return fmt.Errorf("failed to modify XML dates: %w", err)
	}

	// Store the modified XML in the simulation bucket
	if err := simBucket.Put([]byte("mockXML"), modifiedXML); err != nil {
		return fmt.Errorf("failed to store mockXML: %w", err)
	}

	log.Printf("Created mockXML from %s with simulated dates starting from %s",
		selectedKey, today.Format("2006-01-02"))

	// Now use the schedule.BytesToPresentations function to parse the XML
	// and store the result in the presentations key
	presentations, err := schedule.BytesToPresentations(modifiedXML)
	if err != nil {
		return fmt.Errorf("failed to parse presentations from XML: %w", err)
	}

	// Serialize the presentations to JSON
	presentationsJSON, err := json.Marshal(presentations)
	if err != nil {
		return fmt.Errorf("failed to serialize presentations: %w", err)
	}

	// Store the presentations in the simulation bucket
	if err := simBucket.Put([]byte("presentations"), presentationsJSON); err != nil {
		return fmt.Errorf("failed to store presentations: %w", err)
	}

	log.Printf("Parsed and stored %d presentations in simulation bucket", len(presentations))

	return nil
}

// modifyXMLDates updates the Day and Time elements with simulated dates
func modifyXMLDates(xmlData []byte, today time.Time) ([]byte, error) {
	// Use the existing types from the schedule package
	var nodes schedule.Nodes
	if err := xml.Unmarshal(xmlData, &nodes); err != nil {
		return nil, fmt.Errorf("error parsing XML: %w", err)
	}

	// Map days to new dates
	// Today = Thursday, Tomorrow = Friday, etc.
	dates := make(map[string]time.Time)
	dates["Thursday"] = today
	dates["Friday"] = today.AddDate(0, 0, 1)
	dates["Saturday"] = today.AddDate(0, 0, 2)
	dates["Sunday"] = today.AddDate(0, 0, 3)

	// Regular expression to find content attributes with dates/times
	dateRegex := regexp.MustCompile(`content="([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}:[0-9]{2}:[0-9]{2})([-+][0-9]{2}:[0-9]{2})?"`)
	dayRegex := regexp.MustCompile(`<span class="date-display-single" property="dc:date" datatype="xsd:dateTime" content="[^>]+>([^<]+)</span>`)

	// For each node, update Day and Time elements
	for i := range nodes.Nodes {
		// Extract day name from Day element
		dayMatches := dayRegex.FindStringSubmatch(nodes.Nodes[i].Day)
		if len(dayMatches) > 1 {
			dayName := strings.TrimSpace(dayMatches[1])

			// Modify Day content attribute
			nodes.Nodes[i].Day = updateDateInContent(nodes.Nodes[i].Day, dates, dayName, dateRegex)
		}

		// Modify Time content attributes
		nodes.Nodes[i].Time = updateDateInContent(nodes.Nodes[i].Time, dates, "", dateRegex)
	}

	// Marshal back to XML
	modifiedXML, err := xml.MarshalIndent(nodes, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("error generating modified XML: %w", err)
	}

	// Add XML declaration
	xmlHeader := []byte(xml.Header)
	finalXML := append(xmlHeader, modifiedXML...)

	return finalXML, nil
}

// updateDateInContent updates the date portion of content attributes while preserving time
func updateDateInContent(text string, dates map[string]time.Time, dayName string, dateRegex *regexp.Regexp) string {
	return dateRegex.ReplaceAllStringFunc(text, func(match string) string {
		// Extract the date, time and timezone from the content attribute
		parts := dateRegex.FindStringSubmatch(match)
		if len(parts) < 3 {
			return match // No change if we can't parse
		}

		// Extract the original date and time
		originalDate := parts[1]
		originalTime := parts[2]

		// Parse the original date to extract day of week (for mapping)
		parsedDate, err := time.Parse("2006-01-02", originalDate)
		if err != nil {
			return match // No change if we can't parse
		}

		var newDate time.Time
		// If dayName is provided, use that for mapping
		if dayName != "" {
			if mappedDate, ok := dates[dayName]; ok {
				newDate = mappedDate
			} else {
				// If the day name isn't one we recognize, use the parsed date's day of week
				weekday := parsedDate.Weekday().String()
				if mappedDate, ok := dates[weekday]; ok {
					newDate = mappedDate
				} else {
					return match // No change if we can't map
				}
			}
		} else {
			// No day name, try to infer from the original date
			weekday := parsedDate.Weekday().String()
			if mappedDate, ok := dates[weekday]; ok {
				newDate = mappedDate
			} else {
				return match // No change if we can't map
			}
		}

		// Keep original time, change date
		// Determine if timezone part exists
		timezonePart := ""
		if len(parts) > 3 && parts[3] != "" {
			timezonePart = parts[3]
		}

		// Create new content attribute
		newContent := fmt.Sprintf(`content="%sT%s%s"`,
			newDate.Format("2006-01-02"), originalTime, timezonePart)

		// Replace the content attribute in the match
		return strings.Replace(match, parts[0], newContent, 1)
	})
}
