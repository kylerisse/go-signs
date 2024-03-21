# go-signs

`go-signs` is a service that provides an API layer for the Southern California Linux Expo signage. The long term intention is to provide all schedule, twitter, sponsors, and images for consumption by a dedicated front end. (and hopefully new features down the road!) This will allow for quicker iteration than the current solution in [scale-signs](https://github.com/socallinuxexpo/scale-signs) since data and formatting will be located at separate tiers.

## requirements

- golang 1.21.6

## local dev

- `go run .` - starts the web server locally
- http://localhost:8080/schedule/ - the schedule endpoint
- http://localhost:8080/img/ - the images
