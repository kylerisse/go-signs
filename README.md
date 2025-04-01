# go-signs

`go-signs` is a modern Go-based service designed to power the digital signage system for the Southern California Linux Expo (SCaLE). It's specifically built to run on Raspberry Pi devices distributed throughout the venue, with each Pi serving as a standalone digital sign displaying conference schedules, speaker information, and event logistics.

## Features

- **Real-time Schedule Updates**: Pulls schedule data from the SCaLE Drupal CMS via XML endpoint
- **Responsive Web Interface**: Clean, auto-scrolling display of schedule information
- **Sponsor Showcase**: Dedicated endpoints for different sponsor tiers
- **Embedded Assets**: Single binary includes all web assets and sponsor images
- **Clock Override**: Support for time simulation via URL parameters
- **Automatic Refresh**: Self-updating schedule and continuous display rotation

## Architecture

The system offers a clean separation between data sources and presentation:

- **Schedule Package**: Handles XML parsing, data transformation, and schedule endpoint
- **Sponsor Package**: Manages sponsor images and tiered sponsor endpoints
- **Frontend Package**: Embeds and serves static HTML/CSS/JS assets
- **Server Package**: Coordinates components and handles HTTP serving

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

| Endpoint | Description |
|----------|-------------|
| `/` | Main web interface showing the schedule |
| `/schedule` | JSON API endpoint for complete schedule data |
| `/sponsors/platinum` | JSON list of platinum sponsor image filenames |
| `/sponsors/gold` | JSON list of gold sponsor image filenames |
| `/sponsors/images/` | Serves embedded sponsor image assets |

### Time Override

The web interface supports time simulation via URL parameters:

```
/?year=2025&month=3&day=20&hour=14&minute=30
```

This is particularly useful for testing schedule displays for specific times or days.

## Development Tasks

- `make test` - Run all tests with race detection
- `make build` - Build the executable (runs tests first)
- `make deps` - Verify and tidy dependencies
- `make clean` - Clean build artifacts
- `make mrproper` - Deep clean (build artifacts and data)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
