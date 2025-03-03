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

#### Geofence Management

##### Create Geofence
- **URL**: `/geofences`
- **Method**: `POST`
- **Description**: Create a new geofence
- **Request Body**:
  ```json
  {
    "name": "University Library",
    "description": "Study area geofence",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 100,
    "user_id": 1
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "ID": 1,
      "CreatedAt": "2025-02-11T14:35:42.123Z",
      "UpdatedAt": "2025-02-11T14:35:42.123Z",
      "DeletedAt": null,
      "name": "University Library",
      "description": "Study area geofence",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "radius": 100,
      "user_id": 1
    }
  }
  ```
- **Status Codes**:
  - `201`: Geofence created successfully
  - `400`: Invalid request (missing required fields, invalid coordinates)
  - `500`: Server error

##### Get All Geofences
- **URL**: `/geofences`
- **Method**: `GET`
- **Description**: Retrieve all geofences or filter by user_id
- **Query Parameters**:
  - `user_id` (optional): Filter geofences by user ID
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "ID": 1,
        "CreatedAt": "2025-02-11T14:35:42.123Z",
        "UpdatedAt": "2025-02-11T14:35:42.123Z",
        "DeletedAt": null,
        "name": "University Library",
        "description": "Study area geofence",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "radius": 100,
        "user_id": 1
      },
      {
        "ID": 2,
        "CreatedAt": "2025-02-11T14:40:12.456Z",
        "UpdatedAt": "2025-02-11T14:40:12.456Z",
        "DeletedAt": null,
        "name": "Student Center",
        "description": "Student activities zone",
        "latitude": 37.7750,
        "longitude": -122.4195,
        "radius": 150,
        "user_id": 1
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `500`: Server error

##### Get Specific Geofence
- **URL**: `/geofences/{id}`
- **Method**: `GET`
- **Description**: Retrieve a specific geofence by ID
- **URL Parameters**:
  - `id`: Geofence ID
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "ID": 1,
      "CreatedAt": "2025-02-11T14:35:42.123Z",
      "UpdatedAt": "2025-02-11T14:35:42.123Z",
      "DeletedAt": null,
      "name": "University Library",
      "description": "Study area geofence",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "radius": 100,
      "user_id": 1
    }
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `404`: Geofence not found
  - `500`: Server error

##### Update Geofence
- **URL**: `/geofences/{id}`
- **Method**: `PUT`
- **Description**: Update an existing geofence
- **URL Parameters**:
  - `id`: Geofence ID
- **Request Body**:
  ```json
  {
    "name": "Updated Library Zone",
    "description": "Extended study area",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 200,
    "user_id": 1
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "ID": 1,
      "CreatedAt": "2025-02-11T14:35:42.123Z",
      "UpdatedAt": "2025-02-11T15:10:33.789Z",
      "DeletedAt": null,
      "name": "Updated Library Zone",
      "description": "Extended study area",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "radius": 200,
      "user_id": 1
    }
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `400`: Invalid request
  - `404`: Geofence not found
  - `500`: Server error

##### Delete Geofence
- **URL**: `/geofences/{id}`
- **Method**: `DELETE`
- **Description**: Delete a geofence by ID
- **URL Parameters**:
  - `id`: Geofence ID
- **Response**:
  ```json
  {
    "status": "success",
    "data": null
  }
  ```
- **Status Codes**:
  - `204`: No content (success)
  - `404`: Geofence not found
  - `500`: Server error

##### Get Nearby Geofences
- **URL**: `/geofences/nearby`
- **Method**: `GET`
- **Description**: Retrieve geofences near the specified coordinates
- **Query Parameters**:
  - `lat`: Latitude
  - `lng`: Longitude
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "ID": 1,
        "CreatedAt": "2025-02-11T14:35:42.123Z",
        "UpdatedAt": "2025-02-11T15:10:33.789Z",
        "DeletedAt": null,
        "name": "Updated Library Zone",
        "description": "Extended study area",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "radius": 200,
        "user_id": 1
      }
    ]
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `400`: Invalid coordinates
  - `500`: Server error

#### User Statistics

##### Get User Stats
- **URL**: `/user/stats`
- **Method**: `GET`
- **Description**: Get statistics for a specific user
- **Query Parameters**:
  - `user_id`: User ID
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "geofence_count": 2,
      "content_count": 5,
      "latest_geofence": {
        "ID": 2,
        "CreatedAt": "2025-02-11T14:40:12.456Z",
        "UpdatedAt": "2025-02-11T14:40:12.456Z",
        "DeletedAt": null,
        "name": "Student Center",
        "description": "Student activities zone",
        "latitude": 37.7750,
        "longitude": -122.4195,
        "radius": 150,
        "user_id": 1
      },
      "most_active_locations": [
        {
          "id": 1,
          "name": "Updated Library Zone",
          "content_count": 3
        },
        {
          "id": 2,
          "name": "Student Center",
          "content_count": 2
        }
      ]
    }
  }
  ```
- **Status Codes**:
  - `200`: Success
  - `400`: Missing or invalid user ID
  - `500`: Server error

## Unit Tests

We have implemented the following unit tests:

### Geofence Tests
- TestCreateGeofence - Tests the creation of a new geofence
- TestGetGeofences - Tests retrieving all geofences
- TestGetGeofence - Tests retrieving a specific geofence
- TestGetNearbyGeofences - Tests the nearby geofences functionality

### User Authentication Tests
- TestRegister - Tests user registration
- TestLogin - Tests user login with valid credentials
- TestLoginWithInvalidCredentials - Tests login with incorrect credentials
- TestMalformedLoginRequest - Tests handling of malformed requests

## Future Enhancements (For Sprint 3)

1. **Authentication**
   - Implement JWT token-based authentication
   - Add token refresh mechanism
   - Add role-based access control

2. **Geofence Management**
   - Implement more sophisticated spatial queries
   - Add geofence entry/exit events
   - Support for polygon shapes (not just circles)

3. **Content Management**
   - Add endpoints for content CRUD within geofences
   - Support for different content types (text, image, video)
   - Content moderation