# Sprint 2 Report - GeoFence Backend API

## What We Completed in Sprint 2

1. **Extended Core Functionality**
   - Added user statistics endpoints for dashboard functionality
   - Implemented proper error handling and standardized API responses
   - Added authentication middleware for secure API access
   - Enhanced CORS support for better frontend integration

2. **Testing**
   - Created unit tests for geofence management endpoints
   - Implemented user authentication testing
   - Added test cases for nearby location functionality

3. **Integration**
   - Added middleware to facilitate communication with the frontend
   - Standardized API response format for consistent frontend handling

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
The API uses bearer token authentication. Include the following header with your requests:
```
Authorization: Bearer <token>
```

### Response Format
All endpoints return responses in the following JSON format:
```json
{
  "status": "success|error",
  "message": "Error message (only for errors)",
  "data": { /* Response data (only for success) */ }
}
```

### Endpoints

#### User Management

##### Register User
- **URL**: `/register`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "ID": 1,
      "CreatedAt": "2025-02-11T14:30:22.123Z",
      "UpdatedAt": "2025-02-11T14:30:22.123Z",
      "DeletedAt": null,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
  ```
- **Status Codes**:
  - `201`: User created successfully
  - `400`: Invalid request (missing fields, invalid email format)
  - `409`: Email or username already exists
  - `500`: Server error

##### Login
- **URL**: `/login`
- **Method**: `POST`
- **Description**: Authenticate a user
- **Request Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "ID": 1,
      "CreatedAt": "2025-02-11T14:30:22.123Z",
      "UpdatedAt": "2025-02-11T14:30:22.123Z",
      "DeletedAt": null,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
  ```
- **Status Codes**:
  - `200`: Login successful
  - `400`: Invalid request format
  - `401`: Authentication failed (user not found or invalid password)
  - `500`: Server error
