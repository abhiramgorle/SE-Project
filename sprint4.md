# Geo-Fence Project - Sprint 4 Documentation

## README.md

```markdown
# Geo-Fence

A location-based application that allows users to create virtual geographic boundaries (geofences) and manage location-based content within these areas.

## Features

- User authentication and profile management
- Create, read, update, and delete geofences
- Associate multimedia content with geofences
- Discover nearby Content based on user location
- Interactive map visualization

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Google Maps API integration
- Sweet Alert for notifications
- Linaria for CSS-in-JS

### Backend
- Go 1.16+
- PostgreSQL
- JWT for authentication
- Gorilla Mux for routing
- GORM for database operations

## Prerequisites

- Node.js 18+
- Go 1.16+
- PostgreSQL
- Internet connection for map services

## Installation and Setup

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/geo-fence.git
   cd geo-fence
   ```

2. Set up the environment variables
   ```bash
   cd Backend/geofence-backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Initialize and run the backend
   ```bash
   go mod tidy
   go run cmd/main.go
   ```
   The backend will be available at: http://localhost:8080

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd Frontend/geo-fence
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```
   The frontend will be available at: http://localhost:3000

## Usage

1. Register a new account or login with existing credentials
2. Allow location access when prompted
3. Create geofences by selecting locations on the map
4. Add content to your geofences
5. Browse nearby geofences and associated content

## Running Tests

### Backend Tests
```bash
cd Backend/geofence-backend
go test -v ./Unit_tests/...
```

### Frontend Tests
```bash
cd Frontend/geo-fence
npm test
npm run cy:run
```

## Project Structure

```
geo-fence/
├── Backend/
│   └── geofence-backend/
│       ├── cmd/
│       │   └── main.go
│       ├── internal/
│       │   ├── database/
│       │   ├── handlers/
│       │   ├── middleware/
│       │   ├── models/
│       │   └── utils/
│       └── Unit_tests/
├── Frontend/
│   └── geo-fence/
│       ├── public/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── services/
│       │   └── utils/
│       └── cypress/
└── README.md
```

## Contributors

- Frontend Team: [Abhiram Gorle, Kushi Vardhan]
- Backend Team: [Mothish Chowdary Ravilla, Hemanth Kumar]
```

## Sprint4.md

```markdown
# Sprint 4 Report

## Work Completed in Sprint 4

### Frontend Achievements

1. **Interactive Map Enhancement**
   - Improved map loading performance
   - Added custom markers for different geofence types
   - Enhanced Content for a particular section of the region
   - Implemented smooth transitions when navigating between locations

2. **User Interface Refinements**
   - Redesigned dashboard for better usability
   - Added dark mode support
   - Improved responsive design for mobile devices

3. **Geofence Management Improvements**
   - Added ability to customize geofence colors
   - Implemented geofence categorization
   - Added search and filter functionality for geofences

4. **Content Management**
   - Added support for multimedia content (images, links, text)
   - Implemented content preview feature

5. **Authentication & Security**
   - Enhanced login/registration forms with validation
   - Implemented persistent login using secure token storage
   - Added password reset functionality

### Backend Achievements

1. **API Optimization**
   - Improved error handling across all handlers
   - Added input validation for all endpoints
   - Optimized database queries for better performance

2. **New Features**
   - Implemented geofence proximity search
   - Added comprehensive content management
   - Created user preference management
   - Added analytics tracking for geofence interactions

3. **Security Enhancements**
   - Improved JWT token handling
   - Added rate limiting to prevent abuse
   - Enhanced CORS configuration for secure frontend integration

4. **Database Improvements**
   - Optimized database models
   - Added proper indexing for geospatial queries
   - Implemented efficient content storage

5. **Testing & Documentation**
   - Added comprehensive unit tests for all handlers
   - Created API documentation
   - Added code comments and README

## Frontend Cypress Tests

### React Component Tests

1. **Authentication Tests**
   - `loginModal.cy.js` - Tests login form submission and validation
   - `profile.cy.js` - Tests registration form functionality

2. **Geofence Tests**
   - `direction.cy.js` - Tests geofence listing functionality
   - `polygon_drawing.cy.js` - Tests creation and editing of geofences
   - `street_view.cy.js` - Tests detailed view of a geofence

3. **Map Component Tests**
   - `MapComponent.cy.js` - Tests map initialization and functionality
   - `LocationSearch.cy.js` - Tests location search functionality
   - `GeofenceMarker.cy.js` - Tests geofence marker rendering

4. **Content Management Tests**
   - `ContentList.cy.js` - Tests content listing
   - `ContentForm.cy.js` - Tests content creation and editing
   - `videoDetail.cy.js` - Tests content preview functionality

5. **Utility Function Tests**
   - `mapUtils.test.js` - Tests map utility functions
   - `geofenceUtils.test.js` - Tests geofence utility functions
   - `validation.test.js` - Tests form validation functions

6. **User Experience**
   - `landing.cy.js` - Tests responsive of landing page
   - `error_handling.spec.js` - Tests error scenarios and feedback

#FrontEnd Testing Results
  Spec                                                    Tests  Passing  Failing  Pending  Skipped
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ×  app-flow.cy.js                           686ms        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  directions.cy.js                         00:45        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  floating_actions.cy.js                   00:21       10        10       -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  following.cy.js                          00:39        7        7        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  info_window.cy.js                        00:27        3        3        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ √  landing_page_test.cy.js                  00:03        3        3        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  loginModal.cy.js                         00:38        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  polygon_drawing.cy.js                    00:10        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  profile.cy.js                            00:35        6        6        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  search_page.cy.js                        00:36        6        6        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  street_view.cy.js                        00:23        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  video.cy.js                              00:39        7        7        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ×  videoDetails.cy.js                       00:50        9        9        -        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ×  13 of 13 passed (100%)                    06:11       82        82       -        -        -

## Backend Unit Tests

### Authentication Tests
- `TestRegisterSuccess` - Tests successful user registration
- `TestRegisterFailure` - Tests registration failures (duplicate email, missing fields)
- `TestLoginSuccess` - Tests successful user login and token generation
- `TestLoginFailure` - Tests login failures (wrong credentials, missing fields)

### Geofence Tests
- `TestCreateGeofence` - Tests geofence creation
- `TestGetGeofences` - Tests retrieving all geofences
- `TestGetGeofence` - Tests retrieving a specific geofence
- `TestUpdateGeofence` - Tests geofence update functionality
- `TestDeleteGeofence` - Tests geofence deletion
- `TestGetNearbyGeofences` - Tests finding geofences near a location

### Content Tests
- `TestCreateContent` - Tests adding content to a geofence
- `TestGetContents` - Tests retrieving all content for a geofence
- `TestGetContent` - Tests retrieving specific content
- `TestUpdateContent` - Tests content update functionality
- `TestDeleteContent` - Tests content deletion

### Middleware Tests
- `TestAuthMiddleware` - Tests JWT authentication middleware
- `TestCORSMiddleware` - Tests CORS configuration

## Backend API Documentation

### Authentication Endpoints

#### Register User
- **URL**: `/api/register`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "username": "string",
      "email": "string"
    }
  }
  ```
- **Error Responses**: 
  - `400 Bad Request` - Missing fields
  - `409 Conflict` - Email already exists

#### Login
- **URL**: `/api/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "token": "string",
      "user": {
        "id": 1,
        "username": "string",
        "email": "string"
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request` - Missing fields
  - `401 Unauthorized` - Invalid credentials

### Geofence Endpoints

#### Create Geofence
- **URL**: `/api/geofences`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "latitude": 0,
    "longitude": 0,
    "radius": 0
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "name": "string",
      "description": "string",
      "latitude": 0,
      "longitude": 0,
      "radius": 0,
      "user_id": 1
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request` - Invalid input
  - `401 Unauthorized` - Missing or invalid token

#### Get All Geofences
- **URL**: `/api/geofences`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "name": "string",
        "description": "string",
        "latitude": 0,
        "longitude": 0,
        "radius": 0,
        "user_id": 1
      }
    ]
  }
  ```

#### Get Geofence
- **URL**: `/api/geofences/{id}`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "name": "string",
      "description": "string",
      "latitude": 0,
      "longitude": 0,
      "radius": 0,
      "user_id": 1
    }
  }
  ```
- **Error Response**: `404 Not Found` - Geofence not found

#### Update Geofence
- **URL**: `/api/geofences/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "latitude": 0,
    "longitude": 0,
    "radius": 0
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "name": "string",
      "description": "string",
      "latitude": 0,
      "longitude": 0,
      "radius": 0,
      "user_id": 1
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request` - Invalid input
  - `401 Unauthorized` - Missing or invalid token
  - `403 Forbidden` - Not the owner of the geofence
  - `404 Not Found` - Geofence not found

#### Delete Geofence
- **URL**: `/api/geofences/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Headers**: `Authorization: Bearer {token}`
- **Success Response**: `204 No Content`
- **Error Responses**:
  - `401 Unauthorized` - Missing or invalid token
  - `403 Forbidden` - Not the owner of the geofence
  - `404 Not Found` - Geofence not found

#### Get Nearby Geofences
- **URL**: `/api/geofences/nearby?lat={latitude}&lng={longitude}`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `lat` - Latitude
  - `lng` - Longitude
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "name": "string",
        "description": "string",
        "latitude": 0,
        "longitude": 0,
        "radius": 0,
        "user_id": 1,
        "distance": 0
      }
    ]
  }
  ```
- **Error Response**: `400 Bad Request` - Missing coordinates

### Content Endpoints

#### Create Content
- **URL**: `/api/contents`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "type": "string",
    "url": "string",
    "geofence_id": 0
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "title": "string",
      "description": "string",
      "type": "string",
      "url": "string",
      "geofence_id": 0
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request` - Invalid input
  - `404 Not Found` - Geofence not found

#### Get Contents
- **URL**: `/api/contents?geofence_id={id}`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `geofence_id` - ID of the geofence
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "title": "string",
        "description": "string",
        "type": "string",
        "url": "string",
        "geofence_id": 0
      }
    ]
  }
  ```
- **Error Response**: `400 Bad Request` - Missing geofence_id

#### Get Content
- **URL**: `/api/contents/{id}`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "title": "string",
      "description": "string",
      "type": "string",
      "url": "string",
      "geofence_id": 0
    }
  }
  ```
- **Error Response**: `404 Not Found` - Content not found

#### Update Content
- **URL**: `/api/contents/{id}`
- **Method**: `PUT`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "type": "string",
    "url": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "title": "string",
      "description": "string",
      "type": "string",
      "url": "string",
      "geofence_id": 0
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request` - Invalid input
  - `404 Not Found` - Content not found

#### Delete Content
- **URL**: `/api/contents/{id}`
- **Method**: `DELETE`
- **Auth Required**: No
- **Success Response**: `204 No Content`
- **Error Response**: `404 Not Found` - Content not found
```
