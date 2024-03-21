package signs

// Config server configuration
type Config struct {
	Address            string
	ScheduleXMLurl     string
	ScheduleXMLupdate  string
	ScheduleJSONurl    string
	ScheduleJSONupdate string
}

// NewServerConfig for Sign Server at SCaLE
func NewServerConfig() Config {
	return Config{
		Address:           ":8080",
		ScheduleXMLurl:    "http://www.socallinuxexpo.org/scale/21x/sign.xml",
		ScheduleXMLupdate: "@every 5m",
	}
}
