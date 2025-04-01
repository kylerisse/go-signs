# go-signs

`go-signs` is a modern Go-based service designed to power the digital signage system for the Southern California Linux Expo (SCaLE). It's specifically built to run on Raspberry Pi devices distributed throughout the venue, with each Pi serving as a standalone digital sign displaying conference schedules, speaker information, and event logistics.

The system offers a clean separation between data sources and presentation, allowing for:
- Real-time schedule updates from the SCaLE Drupal CMS
- Responsive web-based displays with automatic refresh capability
- Dedicated endpoints for schedules and sponsorship content
- Simple deployment with a single binary that includes all static assets

This project builds on the concepts that have served us well from the previous [scale-signs](https://github.com/socallinuxexpo/scale-signs) PHP version while introducing a more modular architecture that decouples data acquisition from presentation logic, enabling faster iteration and more flexible display options.

## Requirements

- Go 1.21.6 or later

## Development Environment

### Using Nix Development Shell

This project includes a Nix flake for consistent development environments. If you have Nix with flakes enabled:

```sh
# Enter the development shell
direnv allow   # If you have direnv installed
# OR
nix develop    # To manually enter the shell
```

The Nix development shell provides:
- Go toolchain (correct version)
- Air (for hot reloading)
- GNU Make
- Go tools and linters

### Standard Go Development

If you're not using Nix:

```sh
# Install dependencies
go mod download

# Run the server
go run cmd/go-signs/main.go
```

### Using Air for Hot Reloads

For development with automatic rebuilds:

```sh
# If using Nix development shell, Air is already available

# If not using Nix, install Air first:
go install github.com/cosmtrek/air@latest

# Then run:
air
```

## Building and Running

```sh
# Build the binary
make build

# Run the server
./out/go-signs

# Command-line options
./out/go-signs -port 8080 -xml https://example.com/schedule.xml -refresh 10
```

### Available Endpoints

- `/schedule/` - Returns complete schedule data as JSON
- `/sponsors/images/` - Serves sponsor image assets
- `/` - Serves the web-based display interface

### Development Tasks

- `make test` - Run all tests with race detection
- `make build` - Build the executable (runs tests first)
- `make deps` - Verify and tidy dependencies
- `make clean` - Clean build artifacts
- `make mrproper` - Deep clean (build artifacts and data)
