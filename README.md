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

## Contributing

Contributions to go-signs are welcome! If you're interested in helping improve this project, please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests and linting pass (`make test`)
5. Submit a pull request

### Development Environment

This project includes a Nix flake for consistent development environments. If you have Nix with flakes enabled:

```sh
# First make sure you have Nix with flakes enabled
# Add "experimental-features = nix-command flakes" to your Nix configuration

# Enter the development shell
direnv allow   # If you have direnv installed
# OR
nix develop    # To manually enter the shell
```

The Nix development shell provides all necessary tools:

- Go toolchain
- Air (for hot reloading)
- Node.js and npm
- TypeScript
- ESLint
- GNU Make
- Go tools and linters
- Prettier

### Development Workflow

The recommended development workflow is:

```sh
# Start the Go server with hot reloading
air # before running for the first time, run a make test or make build

# In another terminal
make test  # or make build to bypass tests (not recommended)
```

Air will detect the changes to the compiled frontend and reload everything automatically. The React frontend sends API requests to the Go backend during development, making it easy to work on both parts of the system simultaneously.

### Using Time Override for Development

During development, you'll often need to test how the schedule display behaves at different times. Instead of waiting for specific times or changing your system clock, use the time override feature:

1. Open your development instance in a browser
2. Add URL parameters to simulate a specific time:
   ```
   http://localhost:2017/?year=2025&month=3&day=20&hour=14&minute=30
   ```
3. The application will use this simulated time instead of the actual system time

This feature is extremely useful for testing various schedule states like "in progress," "starting soon," and day transitions.

### Code Style Guidelines

#### Go Code

- Follow the [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- Run `staticcheck` on your code
- Ensure `go fmt` and `go vet` pass

#### React Code

- Follow ESLint rules configured in the project
- Format code with Prettier using these settings:
  ```json
  {
  	"experimentalTernaries": true,
  	"htmlWhitespaceSensitivity": "strict",
  	"jsxSingleQuote": true,
  	"singleAttributePerLine": true,
  	"singleQuote": true,
  	"useTabs": true
  }
  ```
- Use functional components with hooks
- Follow the established component structure

### Development Tasks

- `make test` - Run all tests with race detection
- `make build` - Build the executable (runs frontend build first)
- `make build-react` - Build just the React frontend
- `make build-go` - Build just the Go backend
- `make deps` - Verify and tidy dependencies
- `make clean` - Clean build artifacts
- `make mrproper` - Deep clean (build artifacts and data)
- `make check-go-vulns` - Run go vulnerability checks using govulncheck
- `make bump-go-vulns` - Update go patch-level dependencies

## Requirements

- Nix with flakes enabled (for development)
- For running the compiled binary without Nix, any system that can run a Go binary

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

## Time Override for Development and Testing

The web interface includes a powerful time simulation feature that's especially useful during development and testing. This allows you to preview how the schedule display would appear at any specific date and time without changing your system clock.

Simply add the following URL parameters:

```
/?year=2025&month=3&day=20&hour=14&minute=30
```

This feature enables:

- Testing schedule displays for future conference dates
- Verifying session transition animations and status indicators
- Confirming correct handling of "starting soon" and "in progress" states
- Checking day transition logic and multi-day event displays

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
│  │  │  ├─ Spinner/           # Loading indicator component
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
