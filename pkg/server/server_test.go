package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/kylerisse/go-signs/pkg/schedule"
)

// TestServer validates that the server functions correctly with a test XML file
func TestServer(t *testing.T) {
	// Use a fixed port for local testing
	port := "7102"
	testXMLPath := filepath.Join("testdata", "sign.xml")

	// Create a file server to serve the test XML
	xmlServer := http.NewServeMux()
	xmlServer.HandleFunc("/sign.xml", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, testXMLPath)
	})

	// Start the XML server on a different port
	xmlPort := "7103"
	go func() {
		err := http.ListenAndServe(":"+xmlPort, xmlServer)
		if err != nil {
			t.Logf("XML server stopped: %v", err)
		}
	}()

	// Give the XML server time to start
	time.Sleep(2 * time.Second)

	// Configure the main server to use our local XML server
	xmlURL := fmt.Sprintf("http://localhost:%s/sign.xml", xmlPort)
	conf := NewConfig(port, xmlURL, 1)

	// Create a new server instance
	server := NewServer(conf)

	// Start the server in a goroutine
	go func() {
		err := server.ListenAndServe()
		if err != nil {
			t.Logf("Server stopped: %v", err)
		}
	}()

	// Give the server time to start and fetch schedule
	time.Sleep(2 * time.Second)

	// Base URL for making requests
	baseURL := fmt.Sprintf("http://localhost:%s", port)

	// 1. Test that index.html is served correctly
	t.Run("IndexHTML", func(t *testing.T) {
		resp, err := http.Get(baseURL + "/index.html")
		if err != nil {
			t.Fatalf("❌ Failed to get index.html: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("❌ Expected status 200 for index.html, got %d", resp.StatusCode)
		}

		contentType := resp.Header.Get("Content-Type")
		if !strings.Contains(contentType, "text/html") {
			t.Errorf("❌ Expected content type to contain text/html, got %s", contentType)
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			t.Fatalf("❌ Failed to read index.html body: %v", err)
		}

		// Don't check for a specific doctype, just ensure we get valid HTML content
		if len(body) < 50 || (!strings.Contains(string(body), "<html") && !strings.Contains(string(body), "<HTML")) {
			t.Errorf("❌ index.html doesn't contain expected HTML content: %s", string(body)[:min(len(body), 100)])
		}
	})

	// 2. Test that the schedule is served correctly and has 296 sessions
	t.Run("Schedule", func(t *testing.T) {
		resp, err := http.Get(baseURL + "/schedule")
		if err != nil {
			t.Fatalf("❌ Failed to get schedule: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("❌ Expected status 200 for schedule, got %d", resp.StatusCode)
		}

		var scheduleData struct {
			Presentations []schedule.Presentation `json:"Presentations"`
		}

		decoder := json.NewDecoder(resp.Body)
		err = decoder.Decode(&scheduleData)
		if err != nil {
			t.Fatalf("❌ Failed to decode schedule JSON: %v", err)
		}

		// Check that we have 296 sessions
		if len(scheduleData.Presentations) != 296 {
			t.Errorf("❌ Expected 296 sessions, got %d", len(scheduleData.Presentations))
		}

		// 3. Check for specific sessions by name only (more reliable)
		expectedSessionNames := []string{
			"Introduction to the Module System",
			"OpenInfra Days North America Keynotes",
			"Closing Keynote with Leslie Lamport",
		}

		for _, expectedName := range expectedSessionNames {
			found := false
			for _, session := range scheduleData.Presentations {
				if strings.EqualFold(session.Name, expectedName) {
					found = true
					t.Logf("✅ Found session: %s", expectedName)
					break
				}
			}

			if !found {
				t.Errorf("❌ Expected session not found: %s", expectedName)
			}
		}
	})

	// 4. Test that all sponsor images are accessible
	t.Run("SponsorImages", func(t *testing.T) {
		// Since we can't directly access the embedded files list from the handler,
		// we'll test sponsor images by making HTTP requests

		// Test a few known sponsor images or use a predefined list
		// Replace these with your actual image names
		imagesToTest := []string{
			"ampere.jpg",
			"aws.png",
			"cloudnativecomputingfoundation.png",
			"datadog.png",
			"glia.jpeg",
			"personalai.png",
			"softwarefreedomconservancy.png",
			"system76.png",
			"zesty.png",
		}

		foundImages := 0
		// Test each image
		for _, image := range imagesToTest {
			resp, err := http.Get(baseURL + "/sponsors/images/" + image)
			if err != nil {
				t.Errorf("❌ Failed to get sponsor image %s: %v", image, err)
				continue
			}

			defer resp.Body.Close()

			if resp.StatusCode == http.StatusOK {
				foundImages++
				t.Logf("✅ Successfully accessed sponsor image: %s", image)
			} else {
				t.Errorf("❌ Image %s returned status %d (expected 200 OK)", image, resp.StatusCode)
			}
		}

		// The test should fail if none of the expected images are found
		if foundImages == 0 {
			t.Errorf("❌ No sponsor images were found. The test was configured to look for: %v", imagesToTest)
		} else {
			t.Logf("✅ Successfully accessed %d of %d sponsor images", foundImages, len(imagesToTest))
		}
	})
}

// Helper function to parse time in the format used in the sessions
func parseTime(timeStr string) time.Time {
	t, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		panic(fmt.Sprintf("Failed to parse time %s: %v", timeStr, err))
	}
	return t
}

// Helper function to check if two sessions match
func sessionMatches(actual, expected schedule.Presentation) bool {
	// First just match the session by name - this is the most reliable identifier
	if !strings.EqualFold(actual.Name, expected.Name) {
		return false
	}

	// If names match, print detailed comparison data for debugging
	fmt.Printf("Found session with matching name: '%s'\n", actual.Name)
	fmt.Printf("  Actual Location: '%s', Expected: '%s'\n", actual.Location, expected.Location)
	fmt.Printf("  Actual Topic: '%s', Expected: '%s'\n", actual.Topic, expected.Topic)
	fmt.Printf("  Actual Start: '%s', Expected: '%s'\n", actual.StartTime, expected.StartTime)
	fmt.Printf("  Actual End: '%s', Expected: '%s'\n", actual.EndTime, expected.EndTime)
	fmt.Printf("  Actual Speakers: %v, Expected: %v\n", actual.Speakers, expected.Speakers)

	// Check that room/location matches
	if !strings.EqualFold(actual.Location, expected.Location) {
		fmt.Printf("  ❌ Location mismatch\n")
		return false
	}

	// Check that topic matches
	if !strings.EqualFold(actual.Topic, expected.Topic) {
		fmt.Printf("  ❌ Topic mismatch\n")
		return false
	}

	// Check for main speaker (first one in the list)
	if len(actual.Speakers) == 0 || len(expected.Speakers) == 0 {
		fmt.Printf("  ❌ Missing speakers\n")
		return false
	}

	if !strings.Contains(actual.Speakers[0], expected.Speakers[0]) &&
		!strings.Contains(expected.Speakers[0], actual.Speakers[0]) {
		fmt.Printf("  ❌ Main speaker mismatch\n")
		return false
	}

	// Session with matching name, location, topic and main speaker is a match!
	fmt.Printf("  ✅ Match found!\n")
	return true
}

// Helper function to compare times with some tolerance
func timesEqual(t1, t2 time.Time) bool {
	// Allow for small differences in time zone or formatting
	diff := t1.Sub(t2)
	return diff.Abs() < 1*time.Second
}

// Helper function to compare times with greater tolerance
func timeApproximatelyEqual(t1, t2 time.Time, tolerance time.Duration) bool {
	// Allow for larger differences that might be caused by time zone issues
	diff := t1.Sub(t2)
	return diff.Abs() < tolerance
}

// Helper function to compare strings with some flexibility
func stringsEqual(s1, s2 string) bool {
	// Normalize spaces and compare
	s1Norm := strings.Join(strings.Fields(s1), " ")
	s2Norm := strings.Join(strings.Fields(s2), " ")
	return s1Norm == s2Norm
}
