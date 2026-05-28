# Digital Service for Dagmawi Menelik - Backend API

This document provides a comprehensive guide to the Backend API for the Digital Service for Dagmawi Menelik platform.

## Overview

The backend is built with Node.js, Express, and Prisma ORM. It provides services for authentication, service management, queuing, appointments, and administrative tasks.

- **Base URL**: `http://localhost:5000/api` (default)
- **Health Check**: `GET /health`

## Authentication

Authentication is handled via JSON Web Tokens (JWT). Most endpoints require a valid token to be sent in the `Authorization` header.

**Header Format**:
```http
Authorization: Bearer <your_jwt_token>
```

### Roles
The system supports the following roles:
- `CITIZEN`: Standard user (default).
- `OFFICER`: Service officer who manages queues and requests.
- `HELPDESK`: Helpdesk personnel who can register walk-in users.
- `ADMIN`: System administrator with full access to management and stats.

---

## API Endpoints

### 1. Authentication (`/auth`)

| Endpoint | Method | Description | Auth Required | Body Params |
| :--- | :--- | :--- | :---: | :--- |
| `/register` | `POST` | Register a new user | No | `name`, `phoneNumber`, `identificationNumber`, `password`, `role` (optional) |
| `/login` | `POST` | Login and receive JWT | No | `phoneNumber`, `password` |
| `/profile` | `PATCH` | Update user profile | Yes | `name`, `phoneNumber` |
| `/password` | `PATCH` | Change user password | Yes | `currentPassword`, `newPassword` |

### 2. Services & Sectors (`/services`)

| Endpoint | Method | Description | Auth Required | Role(s) |
| :--- | :--- | :--- | :---: | :--- |
| `/sectors` | `GET` | Get all sectors and their services | No | - |
| `/sectors` | `POST` | Create a new sector | Yes | ADMIN |
| `/sectors/:id` | `PATCH` | Update a sector | Yes | ADMIN |
| `/sectors/:id` | `DELETE` | Delete a sector | Yes | ADMIN |
| `/services` | `POST` | Create a new service | Yes | ADMIN |
| `/services/:id` | `PATCH` | Update a service | Yes | ADMIN |
| `/services/:id` | `DELETE` | Delete a service | Yes | ADMIN |

### 3. Queuing System (`/queues`)

| Endpoint | Method | Description | Auth Required | Role(s) |
| :--- | :--- | :--- | :---: | :--- |
| `/take` | `POST` | Take a new queue ticket | Yes | - |
| `/my-status` | `GET` | Get current active queue status | Yes | - |
| `/my-history` | `GET` | Get user's queue history | Yes | - |
| `/list/:sectorId` | `GET` | List active queues for a sector | Yes | OFFICER, HELPDESK, ADMIN |
| `/status/:queueId` | `PATCH` | Update queue status | Yes | OFFICER, HELPDESK |
| `/:queueId` | `DELETE` | Cancel a waiting ticket | Yes | - |
| `/register-walkin` | `POST` | Register a walk-in citizen | Yes | HELPDESK, ADMIN |

### 4. Appointments (`/appointments`)

| Endpoint | Method | Description | Auth Required | Body Params / Notes |
| :--- | :--- | :--- | :---: | :--- |
| `/book` | `POST` | Book a new appointment | Yes | `serviceId`, `date`, `timeSlot` |
| `/my-appointments` | `GET` | Get user's appointments | Yes | - |
| `/slots/:serviceId/:date` | `GET` | Get available slots for a date | Yes | Returns list of time slots |
| `/sector/:sectorId` | `GET` | Get appointments for a sector | Yes | For officers/admins |

### 5. Service Requests (`/requests`)

| Endpoint | Method | Description | Auth Required | Body Params / Notes |
| :--- | :--- | :--- | :---: | :--- |
| `/submit` | `POST` | Submit a service request | Yes | `serviceId`, `data`, `remarks` |
| `/my-requests` | `GET` | Get user's submitted requests | Yes | - |
| `/sector/:sectorId` | `GET` | Get pending requests for a sector | Yes | For officers/admins |
| `/status/:requestId` | `PATCH` | Update request status | Yes | `status`, `remarks` |

### 6. Notifications (`/notifications`)

| Endpoint | Method | Description | Auth Required | Body Params / Notes |
| :--- | :--- | :--- | :---: | :--- |
| `/` | `GET` | Get all notifications for the user | Yes | Returns list + unread count |
| `/:notificationId/read` | `PATCH` | Mark a notification as read | Yes | - |

### 7. Administration (`/admin`)

| Endpoint | Method | Description | Auth Required | Role(s) |
| :--- | :--- | :--- | :---: | :--- |
| `/stats` | `GET` | Get system statistics | Yes | ADMIN |
| `/users` | `GET` | List all registered users | Yes | ADMIN |
| `/logs` | `GET` | Get system activity logs | Yes | ADMIN |

---

## Error Handling

The API returns standard HTTP status codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation error or invalid input.
- `401 Unauthorized`: Authentication missing or failed.
- `403 Forbidden`: Insufficient permissions (role mismatch).
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: Unexpected server error.
