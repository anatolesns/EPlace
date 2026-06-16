<div id="top">

<div align="center">

# EPLACE

<em>A real-time collaborative pixel canvas, inspired by r/Place — EPITA school project</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/license/anatolesns/EPlace?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
<img src="https://img.shields.io/github/last-commit/anatolesns/EPlace?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/anatolesns/EPlace?style=default&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/anatolesns/EPlace?style=default&color=0080ff" alt="repo-language-count">
<img src="https://img.shields.io/badge/status-school%20project-orange?style=default" alt="status">
<img src="https://img.shields.io/badge/finished-no-red?style=default" alt="finished">

</div>

> ⚠️ **School project** — This project was developed as part of the EPITA curriculum. It is **not finished** and **not production-ready**. Code quality, test coverage, and features may be incomplete.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
  - [Project Index](#project-index)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Environment Variables](#environment-variables)
  - [API](#api)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**EPlace** is a web client for a real-time collaborative pixel canvas, a clone of the famous **r/Place**. Multiple users can place pixels on a shared canvas, room by room, and watch the artwork evolve live.

This repository is primarily the **front-end client** (`eplace-client`), built with **Vite**, jQuery and Less. It talks to a back-end (PostgreSQL + Redis + a Node server distributed as a Docker image) and authenticates users through the **EPITA CRI** OIDC identity provider. Real-time updates are delivered over WebSockets using **socket.io**.

This was developed as a school project at EPITA and remains a work in progress.

---

## Features

- **Real-time collaborative canvas** — pixel placement is broadcast to every connected client over WebSocket
- **Rooms** — multiple independent canvases (`default`, `epi-place`, `test`), each with its own size, color palette and visibility
- **OIDC authentication** — login via the EPITA CRI identity provider (authorization code exchange, token and refresh token handling)
- **Per-room chat** — messaging tied to each room
- **Guild scoring** — track the proportion of pixels placed by each guild and compute a per-room score
- **Rate limiting** — configurable limits per action (place a pixel, create a room, send a message, etc.)
- **Administration** — create, update and delete rooms, ban users, reload configuration
- **OpenAPI spec** — full API contract defined in `server/openapi/openapi.json`

---

## Architecture

```
Browser (Vite client)
        |
        |  /api        -> proxy -> EPlace REST API       (port 3333)
        |  /socket.io  -> proxy -> WebSocket server       (port 3334)
        |  /auth-api   -> proxy -> OIDC provider (EPITA CRI)
        v
   EPlace server (Docker image)
        |
        +--> PostgreSQL   (rooms, pixels, users)
        +--> Redis        (real-time / cache)
```

The Vite dev server proxies the `/api`, `/socket.io` and `/auth-api` routes to the back-end, which avoids CORS issues during local development.

---

## Project Structure

```sh
|-- EPlace/
    |-- public/                 # Static assets (favicon, avatars, icons)
    |-- server/                 # Back-end runtime (image pulled via Docker)
    |   |-- config/             # Rooms config, rate limits, default canvases
    |   |-- openapi/            # OpenAPI specification of the API
    |   |-- docker-compose.yml  # Orchestrates Postgres / Redis / EPlace
    |   `-- .env                # Server environment variables
    |-- src/                    # Front-end (Vite)
    |   |-- components/         # HTML templates (rooms, notifications, students)
    |   |-- pages/              # Pages and application entry point
    |   |   |-- complete/epita/ # OIDC redirect callback
    |   |   `-- debug/          # Debug page
    |   |-- rooms/              # Room logic (canvas, chat)
    |   |-- students/           # User management
    |   `-- utils/              # Auth, websockets, notifications, rate limits
    |-- eslint.config.mjs       # ESLint configuration
    |-- vite.config.js          # Vite configuration (proxy, build)
    `-- package.json
```

### Project Index

<details open>
<summary><b>Source modules</b></summary>

| Module | Description |
|--------|-------------|
| `src/pages/` | Application entry point, layout and main page (`index.js`, `index.html`, `styles.less`) |
| `src/pages/complete/epita/` | OIDC callback: reads the `code` from the URL and exchanges it for a token |
| `src/pages/debug/` | Debug page and helpers |
| `src/rooms/` | Room joining logic and per-room features |
| `src/rooms/canvas/` | Canvas rendering and pixel placement logic (`utils.js`) |
| `src/rooms/chat/` | Per-room chat |
| `src/students/` | User management |
| `src/utils/auth.js` | Authentication: `getToken`, `refreshToken`, `authenticate`, authed requests |
| `src/utils/streams.js` | Socket initialization, subscriptions and messaging |
| `src/utils/notify.js` | In-app alerts / notifications |
| `src/utils/rateLimits.js` | Client-side rate limit helpers |
| `src/utils/redirect.js` | Login redirection helpers |
| `src/components/` | HTML templates for rooms, notifications and students |
| `server/config/` | `rooms.config.json`, `rate-limits.config.json`, default canvas files |
| `server/openapi/` | `openapi.json` — full REST API contract |

</details>

---

## Getting Started

### Prerequisites

- **Node.js** (recent version recommended)
- **Yarn**
- **Docker** and Docker Compose (for the back-end)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/anatolesns/EPlace
   cd EPlace
   ```

2. **Install the client dependencies:**
   ```sh
   yarn install
   ```

3. **Configure environment variables** (see [Environment Variables](#environment-variables)).

4. **Start the back-end with Docker:**
   ```sh
   cd server
   docker compose up -d
   ```

   This starts PostgreSQL, Redis and the EPlace server. The API is exposed on
   port `3333` by default.

### Usage

From the project root, run the Vite dev server:

```sh
yarn dev
```

Run in debug mode:

```sh
yarn debug
```

The client is then available at the address printed by Vite (by default
`http://localhost:5173`, depending on your configuration).

### Environment Variables

**Client** (`.env` at the project root, variables prefixed with `VITE_`):

```sh
VITE_HOST="localhost"
VITE_PORT=5173
VITE_URL="http://localhost:5173"
VITE_API_URL="http://localhost:3333"
VITE_AUTH_URL="https://cri.epita.fr"
VITE_CLIENT_ID="your-oidc-client-id"
```

**Server** (`server/.env`, mounted into the container):

```sh
NODE_ENV="production"
SERVER_PORT=3333
WSS_PORT=3334

POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_HOST="postgres"
POSTGRES_PORT=5432
POSTGRES_DB="eplace"
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/eplace?schema=public"

REDIS_HOST="redis"
REDIS_PORT=6379

JWKS_URI="https://cri.epita.fr/jwks"
ADMIN_UID_LIST="9361"

RATE_LIMITS_CONFIG_PATH="./config/rate-limits.config.json"
ROOMS_CONFIG_PATH="./config/rooms.config.json"
```

> Do not commit real secrets. The values above are development defaults.
> Rooms and rate limits are configured in `server/config/`.

### API

The REST API is documented via OpenAPI (`server/openapi/openapi.json`). A few key endpoints:

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/status` | API status |
| GET | `/rooms` | List rooms |
| POST | `/rooms` | Create a room |
| GET | `/rooms/{slug}/config` | Get room config |
| GET | `/rooms/{slug}/canvas` | Get the canvas |
| GET | `/rooms/{slug}/canvas/pixels` | Get the pixels |
| POST | `/rooms/{slug}/canvas/pixels` | Place a pixel |
| GET | `/rooms/{slug}/score` | Get guild scores for a room |
| GET | `/rooms/{slug}/getGuildProportion` | Pixel distribution per guild |
| GET | `/students` | List users |
| POST | `/students/{id}/ban` | Ban a user |

---

## Roadmap

- [x] OIDC authentication via the EPITA CRI
- [x] WebSocket connection and room subscription
- [x] Room joining and canvas rendering
- [x] Pixel placement in real time
- [x] Rooms configuration (size, palette, visibility)
- [x] Rate limiting configuration
- [ ] Complete chat implementation
- [ ] Guild scoring UI
- [ ] Full test suite
- [ ] Better error handling and input validation
- [ ] One-command startup (client + server)

---

## License

EPlace is provided as-is for educational purposes. See the repository for license details.

---

## Acknowledgments

- EPITA — for the project specification and the CRI identity provider
- Vite, socket.io and the open-source ecosystem
- Inspired by Reddit's r/Place (for educational purposes only)

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square

---
