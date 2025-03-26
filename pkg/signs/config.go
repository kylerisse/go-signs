package signs

import "fmt"

// Config server configuration
type Config struct {
	Address            string
	ScheduleXMLurl     string
	ScheduleXMLupdate  string
	ScheduleJSONurl    string
	ScheduleJSONupdate string
}

// NewServerConfig for Sign Server at SCaLE
func NewServerConfig(listenPort string, xmlEndpoint string) Config {
	return Config{
		Address:           fmt.Sprintf(":%v", listenPort),
		ScheduleXMLurl:    xmlEndpoint,
		ScheduleXMLupdate: "@every 5m",
	}
}
