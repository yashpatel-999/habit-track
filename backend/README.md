# Habit Tracker Backend

A simple habit tracking backend built with Rust, Actix-web, SQLx, and PostgreSQL.

## Features

- User registration and authentication with JWT
- Create, read, update, and delete habits
- Log habit completion/status for specific dates
- Track habit completion progress

## Prerequisites

- Rust (latest stable version)
- PostgreSQL database
- Environment variables configured

## Setup

1. **Clone and navigate to the project:**
   ```bash
   cd habit-track
   ```

2. **Install PostgreSQL and create a database:**
   ```sql
   CREATE DATABASE habit_tracker_db;
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database connection details and JWT secret.

4. **Run the database schema:**
   ```bash
   psql -d habit_tracker_db -f schema.sql
   ```

5. **Build and run the application:**
   ```bash
   cargo run
   ```

The server will start on `http://127.0.0.1:8080`.

## API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - Authenticate and get JWT token

### Habits
- `GET /habits` - Get user's habits (requires auth)
- `POST /habits` - Create a new habit (requires auth)
- `PUT /habits/{id}` - Update a habit (requires auth)
- `DELETE /habits/{id}` - Delete a habit (requires auth)

### Habit Logging
- `POST /habits/{id}/log` - Log habit completion (requires auth)
- `GET /habits/{id}/progress` - Get habit completion statistics (requires auth)

## Request/Response Examples

### Sign Up
```bash
curl -X POST http://127.0.0.1:8080/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "email": "john@example.com", "password": "securepassword"}'
```

### Login
```bash
curl -X POST http://127.0.0.1:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "securepassword"}'
```

### Create Habit
```bash
curl -X POST http://127.0.0.1:8080/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Exercise", "description": "30 minutes of exercise", "frequency": "daily"}'
```

### Log Habit
```bash
curl -X POST http://127.0.0.1:8080/habits/1/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"date": "2025-09-08", "status": true}'
```

## Project Structure

```
src/
├── main.rs         # Server setup and routing
├── models.rs       # Data models and structs
├── auth.rs         # JWT and password handling
├── db.rs           # Database connection setup
└── handlers.rs     # HTTP request handlers with inline database queries
```

This simplified structure keeps database queries directly in the handlers for better code clarity and reduced abstraction.

## Dependencies

- **actix-web**: Web framework
- **sqlx**: Async SQL toolkit with PostgreSQL support
- **serde**: Serialization/deserialization
- **jsonwebtoken**: JWT implementation
- **bcrypt**: Password hashing
- **tokio**: Async runtime
- **dotenv**: Environment variable management
