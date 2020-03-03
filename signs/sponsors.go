package signs

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

// Sponsors list of sponsor
type Sponsors map[string][]string

func newSponsors(imagePath string) Sponsors {
	var s Sponsors
	sp := imagePath + "/sponsors"
	files, err := ioutil.ReadDir(sp)
	if err != nil {
		log.Printf("cannot read %s", sp)
	}
	for _, file := range files {
		sn := strings.Split(file.Name(), ".")[0]
		s[sn] = []string{}
		log.Printf("add sponsor %s", sn)
	}
	return s
}

func (s *Sponsors) handleSponsorImageList(w http.ResponseWriter, req *http.Request) {
	log.Println("handleSponsorImageList", req.RemoteAddr, req.Header)
	err := json.NewEncoder(w).Encode(s)
	if err != nil {
		log.Println("handleSponsorImageList unable to encode sponsors")
	}
}
