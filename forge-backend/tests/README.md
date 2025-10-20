# Forge Backend – Testing Report

## Overview
This report summarizes the automated tests for the Forge Backend API (Node.js, Express, Drizzle ORM, Supabase, Upstash Redis). Tests exercise real integrations where stable and focus on correctness, business logic, and error handling.

## Scope & Strategy
- Real DB and storage: PostgreSQL and Supabase storage
- Real queue (robustness only): Upstash Redis
- Happy and sad paths across API and services

## Test Implementation Status

## Test Suites

#### 1. API Integration Tests (`tests/api/`)
- **User API Tests** (`users.test.js`) - **16 tests, ALL PASSING** 
  - User creation and existence checking
  - Image history retrieval with proper access control
  - Input validation and error handling
  - URL encoding and special character support

- **Image API Tests** (`images.test.js`) - **16 tests, ALL PASSING** 
  - AI capabilities endpoint
  - Image upload with multipart/form-data
  - Image analysis result retrieval
  - Image deletion with authorization
  - Comprehensive error handling for malformed UUIDs

#### 2. Service Layer Unit Tests (`tests/unit/services/`)
- **UserService Tests** (`userService.test.js`)
- **ImageService Tests** (`imageService.test.js`)
- **AIAnalysisService Tests** (`aiAnalysisService.test.js`)

#### 3. Worker Process Tests (`tests/unit/`)
- **Worker Tests** (`worker.test.js`)

#### 4. Test Infrastructure
- **Test Data Helpers** (`tests/helpers/testData.js`) 
  - Automated test user creation/cleanup
  - Dynamic test image generation
  - Database state management
- **Test Configuration** (`jest.config.js`, `tests/setup.js`) 
  - 30-second timeout for AI processing
  - Coverage reporting configuration
  - Environment setup

## Current Status
- Suites: 6/6 passing
- Tests: 82/82 passing
- Command: `npm test` (configured as `jest --forceExit` to avoid open‑handle hangs from real connections)

## Coverage (latest)
From `npm run test:coverage`:
- Statements: 57.36%
- Branches: 34.93%
- Functions: 46.29%
- Lines: 57.55%

## Test Categories & Coverage

### Happy paths
- User creation and retrieval
- Image upload and persistence
- Authorized deletion

### Sad paths
- Missing fields, malformed IDs (UUID/userId)
- Non‑existent resources
- Unauthorized deletion
- File upload errors and size limits

### Business logic
- History limit policy (keep last 10)
- User isolation per owner
- Image status lifecycle (pending/completed/failed)

### Data Validation
- Required field validation on all endpoints
- UUID format validation with graceful error handling
- File upload validation (size, type)
- User input sanitization and security checks

### Error handling
- HTTP 400/403/404
- DB constraint/UUID handling
- Redis connection/empty queue handling

## Testing Infrastructure

### Database Integration
- **Real PostgreSQL connection** via Drizzle ORM
- **Automatic test data cleanup** after each test
- **Transaction support** for data isolation
- **UUID handling** with proper error management

### Redis Integration
- **Upstash Redis REST API** connection via `@upstash/redis`
- **Environment variables**: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- **Real queue operations** for task management testing
- **FIFO order verification** for background job processing

### File Upload Testing
- Real test image at `tests/fixtures/test.png`
- Multipart form data via supertest
- Supabase storage integration + cleanup

### Queue Testing
- **Real Redis integration** for task queue management
- **FIFO order verification** for task processing
- **Queue state management** between tests
- **Background worker simulation**

## How to run
```bash
npm test
```
Jest runs with `--forceExit` for reliability with real connections.