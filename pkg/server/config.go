package server

import (
	"fmt"
	"time"
)

// Config server configuration
type Config struct {
	Address         string
	ScheduleXMLurl  string
	RefreshInterval time.Duration
}

// NewServerConfig for Sign Server at SCaLE
func NewConfig(listenPort string, xmlEndpoint string, refreshInterval int) Config {
	return Config{
		Address:         fmt.Sprintf(":%v", listenPort),
		ScheduleXMLurl:  xmlEndpoint,
		RefreshInterval: time.Duration(refreshInterval) * time.Minute,
	}
}
