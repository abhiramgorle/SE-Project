
# Sprint 1 Report for Geo-Fence

## **Frontend User Stories**

### **1. Location Access**
- **As a user**, I want to grant location access to the application. So that I can see geofences near me
- Acceptance Criteria:
  * Location permission prompt
  * Clear explanation of why location is needed
  * Fallback option if location access is denied
  * Current location indicator on map

### **2. User Authentication & Onboarding**
- **As a user**, I want to create an account with my email and password. So that I can access the GeoFence platform
- Acceptance Criteria:
  * Registration form with email, password, and username fields
  * Password strength validation
  * Email verification
  * Success/error notifications

### **3. Map Interface**
- **As a user**, I want to see a map interface. So that I can visualize geofences in my area
- Acceptance Criteria:
  * Interactive map component
  * Basic zoom and pan controls
  * Current location marker
  * Responsive design for different screen sizes

### **4. Geofence Creation UI**
- **As a user**, I want to create a new geofence. So that I can define an area for location-specific content
- Acceptance Criteria:
  * Form to input geofence name and description
  * Ability to draw circle on map to set boundary
  * Radius adjustment control
  * Preview of geofence area

## **Backend User Stories**

### **1. User Management**
- **As a  system administrator**,I want to implement user authentication. So that users can securely access the platform
- Acceptance Criteria:
  * User registration endpoint
  * Login endpoint with JWT token generation
  * Password hashing
  * Input validation

### **2. Database Schema**
- **As a developer**, I want to set up the SQLite database schema. So that we can store user and geofence data
- Acceptance Criteria:
  * User table with required fields
  * Geofence table with spatial data
  * Content table for geofence-specific information
  * Proper relationships between tables

### **3. Map Interface**
- **As a backend developer**,I want to create CRUD endpoints for geofences. So that users can manage their geofences
- Acceptance Criteria:
  * Create geofence endpoint
  * Read geofence details endpoint
  * Update geofence endpoint
  * Delete geofence endpoint
  * Input validation and error handling

### **4.Location Services**
- **As a developer**, I want to implement location-based queries. So that users can find nearby geofences
- Acceptance Criteria:
  * Endpoint to fetch geofences near coordinates
  * Distance calculation implementation
  * Performance optimization for spatial queries
  * Pagination for large result sets


## **Issues Picked in Sprint 1**

| **S No.** | **Description**                                                         | **Completion Status**     |
|----------------|-------------------------------------------------------------------------|---------------------------|
| **1**          | **Create Initial User Stories for the project**                         | Completed                 |
| **2**          | **Create a folder structure for projects**                               | Completed                 |
| **3**          | **Set up React project with Vite**                                       | Completed                 |
| **4**         | **Design: Implement user authentication UI**                              | In Progress                |
| **5**          | **Create map component with location services**                          | Completed                 |
| **6**          | **Design and implement geofence creation form**                          | Completed                 |
| **7**          | **Set up Go project structure**                                          | Completed                 |
| **8**          | **Add basic styling and responsive design**                              | Closed (Duplicate)        |
| **9**         | **Initialize SQLite database with schemas**                               | Completed                 |
| **10**         | **Implement user authentication endpoints**                              | Completed                 |
| **11**         | **User verification (Backend)**                                         | Completed                 |
| **12**         | **Create basic CRUD operations for geofences**                          | Completed                 |
| **13**         | **Add location-based query endpoint**                                   | Completed                 |

---

## **Reasoning for Carrying Forward #4**

- we are carry forwarding the issue 4, since we wanted to focus on the main idea of the project and to work with mostly maps in this sprint.

---

This is the conclusion of **Sprint 1** for **Geo-Fence**. We've hit major milestones with our essential functionality, and the team is excited to build on this momentum in our upcoming sprint.
