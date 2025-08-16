# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
- `npm run dev` - Runs the development server with HTTP
- `npm run dev:https` - Runs with HTTPS using locally created SSL certificates (requires admin rights on first launch)

### Build and Deployment
- `npm run build` - TypeScript compilation check followed by Vite production build
- `npm run preview` - Preview the production build locally
- `npm run deploy` - Deploys to GitHub Pages (runs predeploy automatically)
- `npm run predeploy` - Pre-deployment script that runs build

### Code Quality
- `npm run lint` - Run ESLint on TypeScript/TSX files with zero warnings policy
- `npm run lint:fix` - Run ESLint with automatic fixing

### Package Management
- Must use `npm` (not yarn or pnpm) - project specifically requires npm

## Architecture Overview

### Telegram Mini App Structure
This is a **Telegram Mini App** built with React that integrates with the Telegram platform using the `@telegram-apps/sdk-react` package. The app is designed to run within Telegram clients and includes specific initialization and mocking for development outside Telegram.

### Key Architectural Components

#### App Initialization (`src/init.ts`, `src/index.tsx`)
- Platform-specific initialization with debug modes and Eruda console for mobile debugging
- Telegram SDK mounting: BackButton, MiniApp, Viewport with CSS variable bindings
- macOS-specific bug workarounds with custom event mocking
- Environment mocking for development outside Telegram (`src/mockEnv.ts`)

#### Event System (`src/types/event.ts`)
- Comprehensive event data model with `BackendEvent` interface
- Pre-defined category system: MUSIC, SPORTS, ARTS, FAMILY, OTHER with specific color schemes
- Event filtering system with date, price, location, and status filters
- Two view models: `EventListItem` for lists, `EventDetail` for detailed views

#### Backend Integration (`src/backend_api/backend_api.ts`)
- API service connecting to Railway-hosted backend: `https://eventsminiappbackend-production.up.railway.app`
- Endpoints: health check (`/`), message (`/api/message`), events (`/api/events`)
- Centralized error handling and logging

#### UI Components Structure
- Component organization by feature in `src/components/`
- Map integration with MapLibre GL (`MapComponent`)
- Bottom sheet UI pattern (`BottomSheetContainer`)
- Location services (`LocateButton`, `UserLocationMarker`)
- Event filtering UI (`FilterChip`, `FilterHeader`, `FilterSection`)
- Search functionality (`SearchBar`, `SearchOverlay`)

#### Routing (`src/navigation/routes.tsx`)
- HashRouter implementation for GitHub Pages compatibility
- Routes: Index (`/`), Init Data, Theme Params, Launch Params, TON Connect integration

#### TON Connect Integration
- Cryptocurrency wallet connection via TON Connect
- Manifest configuration in `public/tonconnect-manifest.json`
- Dedicated TON Connect page component

### Development Environment Setup

#### Path Aliases
- `@/*` maps to `src/*` (configured in tsconfig.json and vite-tsconfig-paths)

#### Build Configuration
- Vite with React SWC plugin for fast builds
- HTTPS development server support with mkcert plugin
- Base path configured for GitHub Pages: `/events_mini_app/`
- Target: ESNext with modern browser support

#### CSS Architecture
- Telegram UI package styles imported first to allow overrides
- CSS modules for component-specific styling (`.module.css`)
- Global styles in `src/index.css`

### Platform Considerations

#### Telegram Platform Detection
- Platform-specific UI adaptations for iOS vs base appearance
- Theme synchronization with Telegram (dark/light mode)
- Platform-specific debugging (Eruda for iOS/Android)

#### GitHub Pages Deployment
- Configured for deployment to GitHub Pages
- Base path and homepage settings must match repository structure
- GitHub Actions workflow available for automatic deployment

### External Dependencies

#### Telegram-Specific
- `@telegram-apps/sdk-react` - Core Telegram Mini Apps SDK
- `@telegram-apps/telegram-ui` - Telegram-styled UI components

#### Map and Location
- `maplibre-gl` - Map rendering and interaction
- Location-based event filtering and display

#### UI Libraries
- `react-spring-bottom-sheet` - Bottom sheet component
- `lucide-react` - Icon library
- `clsx` - Conditional className utility

#### Development Tools
- TypeScript with strict configuration
- ESLint with React and TypeScript plugins
- Cross-platform environment variables with `cross-env`