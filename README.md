# go-signs

`go-signs` is a modern Go-based service designed to power the digital signage system for the Southern California Linux Expo (SCaLE). It is specifically built to run as a single binary on Raspberry Pi devices distributed throughout the venue. Each Pi serves as a standalone digital sign displaying conference schedules, speaker information, and event logistics.

This project is the successor to [scale-signs](https://github.com/socallinuxexpo/scale-signs), which has served SCaLE well for many years.

## Demo

A [DEMO](https://demo.go-signs.org) of this application is available online. It leverages the [SCaLE Simulator](./docs/SIMULATOR.md).

> Please note that `go-signs` is currently meant to be displayed at 1080p only. Responsive design to support 720p -> 4k is planned for a later release.

## Features

- **Real-time Schedule Updates**: Pulls schedule data from the SCaLE Drupal CMS via XML endpoint
- **Responsive React Frontend**: Clean, auto-scrolling display of schedule information
- **Sponsor Showcase**: Sponsors are prominently displayed at all time near the conference schedule
- **Embedded Assets**: Single binary includes all web assets and sponsor images
- **Clock Override**: Support for time simulation via URL parameters for testing
- **Automatic Refresh**: Self-updating schedule and continuous display rotation
- **Modern Technology Stack**: Go 1.24, React 19, Typescript 5.7, TailwindCSS 4.1, and Nix Unstable

### Using Time Override

During development, you will often need to test how the schedule display behaves at different times. Instead of waiting for specific times or changing your system clock, use the time override feature:

1. Open your development instance in a browser
2. Add URL parameters to simulate a specific time:
   ```
   https://demo.go-signs.org/?year=2025&month=3&day=6&hour=13&minute=53
   ```
3. The application will use this simulated time instead of the actual system time

This feature is extremely useful for testing various schedule states like "in progress," "starting soon," and day transitions. Also be sure to take time zone differences into account. SCaLE talks tend to take place at GMT-8 or GMT-7 depending on the date.

- `year`
- `month`
- `day`
- `hour`
- `minute`

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

## Project Structure

```
go-signs/
├─ cmd/go-signs/               # Main application entry point
├─ nix/                        # Nix devShells and Packages
├─ pkg/                        # Backend packages
│  ├─ display/                 # Handles embedding React frontend
│  ├─ schedule/                # Schedule data handling and XML parsing
|  ├─ simulator/               # scale-simulator specific server
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
