# go-signs

`go-signs` is a modern Go-based service designed to power the digital signage system for the Southern California Linux Expo (SCaLE). It's specifically built to run on Raspberry Pi devices distributed throughout the venue, with each Pi serving as a standalone digital sign displaying conference schedules, speaker information, and event logistics.

This project is the successor to [scale-signs](https://github.com/socallinuxexpo/scale-signs), a PHP 5.4 application that has served SCaLE well for many years.

## Features

- **Real-time Schedule Updates**: Pulls schedule data from the SCaLE Drupal CMS via XML endpoint
- **Responsive React Frontend**: Clean, auto-scrolling display of schedule information
- **Sponsor Showcase**: Dedicated endpoints for different sponsor tiers with automatic rotation
- **Embedded Assets**: Single binary includes all web assets and sponsor images
- **Clock Override**: Support for time simulation via URL parameters for testing
- **Automatic Refresh**: Self-updating schedule and continuous display rotation

## Architecture

The system offers a clean separation between data sources and presentation:

- **Schedule Package**: Handles XML parsing, data transformation, and schedule endpoint
- **Sponsor Package**: Manages sponsor images and tiered sponsor endpoints
- **Display Package**: Embeds and serves the compiled React frontend
- **Server Package**: Coordinates components and handles HTTP serving with graceful shutdown

## Requirements

- Nix

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

- Go toolchain
- Air (for hot reloading)
- Node.js and npm
- TypeScript
- ESLint
- GNU Make
- Go tools and linters
- Prettier

## Development

The recommended development workflow is:

```sh
# Start the Go server with hot reloading
air # before running for the first time, run a make test or make build

# In another terminal
make test  # or make build to bypass tests (not recommended)

# Air will detect the changes to the compiled frontend and reload everything automatically.
```

The React frontend sends API requests to the Go backend during development, making it easy to work on both parts of the system simultaneously.

## Building and Running

```sh
# Build the complete application (frontend + backend)
make build

# Run the server
./out/go-signs

# Command-line options
./out/go-signs -port 8080 -xml https://example.com/schedule.xml -refresh 10
```

### Available Endpoints

| Endpoint             | Description                                   |
| -------------------- | --------------------------------------------- |
| `/`                  | Main web interface showing the schedule       |
| `/schedule`          | JSON API endpoint for complete schedule data  |
| `/sponsors/platinum` | JSON list of platinum sponsor image filenames |
| `/sponsors/gold`     | JSON list of gold sponsor image filenames     |
| `/sponsors/all`      | JSON list of all sponsor image filenames      |
| `/sponsors/images/*` | Serves embedded sponsor image assets          |

### Time Override

The web interface supports time simulation via URL parameters:

```
/?year=2025&month=3&day=20&hour=14&minute=30
```

This is particularly useful for testing schedule displays for specific times or days.

## Development Tasks

- `make test` - Run all tests with race detection
- `make build` - Build the executable (runs frontend build first)
- `make build-react` - Build just the React frontend
- `make build-go` - Build just the Go backend
- `make deps` - Verify and tidy dependencies
- `make clean` - Clean build artifacts
- `make mrproper` - Deep clean (build artifacts and data)
- `make check-go-vulns` - Run go vulnerability checks using govulncheck
- `make bump-go-vulns` - Update go patch-level dependencies

## Project Structure

```
go-signs/
├─ cmd/go-signs/               # Main application entry point
├─ pkg/                        # Backend packages
│  ├─ display/                 # Handles embedding React frontend
│  ├─ schedule/                # Schedule data handling and XML parsing
│  ├─ server/                  # HTTP server and routes
│  └─ sponsor/                 # Sponsor management and image serving
├─ react-display/              # React frontend application
│  ├─ src/
│  │  ├─ components/           # React UI components
│  │  │  ├─ Clock/             # Time display component
│  │  │  ├─ Header/            # Header component with logo, clock and WiFi info
│  │  │  ├─ ScheduleCarousel/  # Schedule display component
│  │  │  └─ SponsorBanner/     # Sponsor image rotation display
│  │  ├─ contexts/             # React contexts for state management
│  │  │  ├─ TimeContext/       # Date/time management with URL override
│  │  │  ├─ ScheduleContext/   # Schedule data management
│  │  │  └─ SponsorContext/    # Sponsor image loading and rotation
│  │  └─ assets/               # Static assets (logo, images)
└─ .github/workflows/          # GitHub Actions CI configuration
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
