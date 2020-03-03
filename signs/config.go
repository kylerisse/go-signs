package signs

import (
	"bufio"
	"encoding/csv"
	"errors"
	"io"
	"os"
)

// Config server configuration
type Config struct {
	Address            string
	ScheduleXMLurl     string
	ScheduleXMLupdate  string
	ScheduleJSONurl    string
	ScheduleJSONupdate string
	TwitterJSONurl     string
	TwitterJSONupdate  string
	TwitterPubUpdate   string
	twitterSecrets
}

type twitterSecrets struct {
	accessToken       string
	accessTokenSecret string
	consumerKey       string
	consumerSecret    string
}

// AddTwitterSecrets populates the config with contents of a file
func (c *Config) AddTwitterSecrets(file string) error {
	twitsecrets := twitterSecrets{}
	f, err := os.Open(file)
	if err != nil {
		return err
	}
	r := csv.NewReader(bufio.NewReader(f))
	r.Comma = '='
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if len(record) != 2 {
			continue
		}
		switch record[0] {
		case "twitter_oauth_access_token":
			twitsecrets.accessToken = record[1]
		case "twitter_oauth_access_token_secret":
			twitsecrets.accessTokenSecret = record[1]
		case "twitter_oauth_consumer_key":
			twitsecrets.consumerKey = record[1]
		case "twitter_oauth_consumer_secret":
			twitsecrets.consumerSecret = record[1]
		default:
			continue
		}
	}
	if twitsecrets.accessToken == "" ||
		twitsecrets.accessTokenSecret == "" ||
		twitsecrets.consumerKey == "" ||
		twitsecrets.consumerSecret == "" {
		return errors.New(file + " is missing a twitter secret")
	}
	c.twitterSecrets = twitsecrets
	return nil
}

// NewClientConfig for Pi at SCaLE
func NewClientConfig() Config {
	return Config{
		Address:            "127.0.0.1:80",
		ScheduleJSONurl:    "http://signs.scale.lan/schedule/",
		ScheduleJSONupdate: "@every 5m",
		TwitterJSONurl:     "http://signs.scale.lan/twitter/",
		TwitterJSONupdate:  "@every 5m",
	}
}

// NewServerConfig for Sign Server at SCaLE
func NewServerConfig() Config {
	return Config{
		Address:           ":80",
		ScheduleXMLurl:    "http://www.socallinuxexpo.org/scale/17x/sign.xml",
		ScheduleXMLupdate: "@every 5m",
		TwitterPubUpdate:  "@every 5m",
	}
}

// NewTestClientConfig for locally testing client
func NewTestClientConfig() Config {
	return Config{
		Address:            "127.0.0.1:8080",
		ScheduleJSONurl:    "http://127.0.0.1:8081/schedule/",
		ScheduleJSONupdate: "@every 20s",
		TwitterJSONurl:     "http://127.0.0l1:8081/twitter/",
		TwitterJSONupdate:  "@every 20s",
	}
}

// NewTestServerConfig for locally testing server
func NewTestServerConfig() Config {
	return Config{
		Address:           "127.0.0.1:8081",
		ScheduleXMLurl:    "http://www.socallinuxexpo.org/scale/17x/sign.xml",
		ScheduleXMLupdate: "@every 20s",
		TwitterPubUpdate:  "@every 20s",
	}
}
