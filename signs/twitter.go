package signs

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
)

const twitterAPI = "https://api.twitter.com/1.1/"

// Twitter struct
type Twitter struct {
	Tweets []twitter.Tweet
	config oauth1.Config
	token  oauth1.Token
}

func newTwitter(c Config) *Twitter {
	return &Twitter{
		config: *oauth1.NewConfig(c.twitterSecrets.consumerKey, c.twitterSecrets.consumerSecret),
		token:  *oauth1.NewToken(c.twitterSecrets.accessToken, c.twitterSecrets.accessTokenSecret),
	}
}

func (t *Twitter) getTweets() {
	log.Printf("Checking for new tweets")
	httpClient := newHTTPclient()
	httpClient = t.config.Client(oauth1.NoContext, &t.token)
	twitterClient := twitter.NewClient(httpClient)
	search, _, _ := twitterClient.Search.Tweets(&twitter.SearchTweetParams{
		Query: "SCaLE 18x",
		Count: 400,
	})
	for _, s := range search.Statuses {
		if strings.Contains(s.Text, "RT") {
			continue
		}
		t.Tweets = append(t.Tweets, s)
	}
}

func (t *Twitter) handleTwitter(w http.ResponseWriter, req *http.Request) {
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	err := enc.Encode(t.Tweets)
	if err != nil {
		log.Println("handleTwitter cannot encode tweets")
	}
}
