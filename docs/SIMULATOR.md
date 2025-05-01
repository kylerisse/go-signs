# SCaLE Simulator

The SCaLE Simulator is a development, demonstration, and testing tool for the `go-signs` project. It allows developers to test the frontend without relying on the real SCaLE website XML endpoint, providing a consistent development environment with mostly predictable data.

## Overview

The simulator creates a mock server that:

1. Loads historical schedule XML data from previous SCaLE conferences
2. Duplicates and transforms dates of a random previous expo to simulate an ongoing conference
3. Serves the entire schedule through a compatible API endpoint
4. Stores data in a local BoltDB database for persistence across restarts
5. Automatically starts a new date shifted conference when the existing one finishes

This approach enables developers to test the `go-signs` application's display and scheduling logic without needing to wait for specific times of day or manually adjusting their system clock. It also allows the viewing of any previous SCaLE when used in conjunction with `go-signs` time override feature.

## Getting Started

### Prerequisites

- Go 1.24
- BoltDB will be created automatically (no separate installation needed)

### Running the Simulator

```bash
# Run with default settings
./out/scale-simulator

# Specify custom database path and port
./out/scale-simulator -db ./data/my-custom-db.db -port 8080
```

## Command Line Arguments

| Argument | Default               | Description                             |
| -------- | --------------------- | --------------------------------------- |
| `-db`    | `./data/simulator.db` | Path to the BoltDB database file        |
| `-port`  | `2018`                | Port on which the simulator will listen |

## How It Works

### Simulation Process

1. **Historical Data Selection**: The simulator loads XML data from previous SCaLE conferences (13x through 22x).
2. **Date Transformation**: A random previous year is selected, duplicated, and all dates in the schedule are shifted to use the current date's tomorrow as the conference start day.
3. **Persistence**: The simulator stores the modified schedule in a BoltDB database.
4. **API Compatibility**: The simulator exposes a similar Drupal XML API endpoint as the actual `go-signs` application expects.

### Database Structure

The BoltDB database contains two main buckets:

- `xmlData`: Stores the original XML data from past conferences
- `simulation`: Stores the active simulation data, including the modified XML and processed JSON

### Automatic Initialization

When first run, the simulator will:

1. Download historical SCaLE conference data
2. Select one conference schedule at random
3. Transform dates to create a 4-day conference starting from the current date
4. Store the processed data combined with all previous conferences for serving

## API Endpoints

| Endpoint    | Method | Description                                                               |
| ----------- | ------ | ------------------------------------------------------------------------- |
| `/health`   | GET    | Health check endpoint returning status and current time                   |
| `/`         | GET    | Returns the schedule as JSON (main endpoint for the go-signs frontend)    |
| `/sign.xml` | GET    | Returns the raw XML schedule (compatible with the SCaLE website endpoint) |

## Use Cases

### Demo Site

The `go-signs` [DEMO](https://demo.go-signs.org) site leverages an always running instance of the Simulator's [XML endpoint](https://simulator.go-signs.org/sign.xml).

### Local Development

The simulator is ideal for local development when you want to:

- Test how the schedule display behaves at different times
- Work on frontend components without a live SCaLE conference
- Develop new features that depend on having an active schedule
