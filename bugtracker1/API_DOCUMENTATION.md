# Bugtracker1 Backend API Documentation

Purpose: concise reference for frontend engineers describing API contracts, DTOs, enums, auth, errors, and examples.

**Overview**
- **Base URL:** /api
- **Authentication:** JWT Bearer token returned from `/api/auth/login` and `/api/auth/register` in `AuthDto.AuthResponse`.
- **Error format:** JSON ErrorResponse { timestamp, status, message, path } (see GlobalExceptionHandler in [exception/GlobalExceptionHandler.java](src/main/java/com/company/bugtracker1/exception/GlobalExceptionHandler.java)).

**Authentication**
- **Register:** POST /api/auth/register
  - Request: `AuthDto.RegisterRequest` { name, email, password }
  - Response: `AuthDto.AuthResponse` { token, type: "Bearer", userId, name, email, role }
  - Status: 200 OK (successful register returns token)

- **Login:** POST /api/auth/login
  - Request: `AuthDto.LoginRequest` { email, password }
  - Response: `AuthDto.AuthResponse` (same as register)
  - Status: 200 OK

Notes: Include header `Authorization: Bearer <token>` on protected routes. See [auth/controller/AuthController.java](src/main/java/com/company/bugtracker1/auth/controller/AuthController.java).

**Roles & Authorization**
- Roles: `ADMIN`, `MANAGER`, `SUPPORT_ENGINEER` (see [user/entity/Role.java](src/main/java/com/company/bugtracker1/user/entity/Role.java)).
- Endpoints annotate role requirements with `@PreAuthorize`. The documentation below lists role requirements where present.

**Common Error Responses**
- Validation failure: 400 Bad Request -> ErrorResponse with validation message(s).
- Unauthorized: 401 Unauthorized for bad credentials.
- Forbidden: 403 Forbidden for insufficient roles.
- Not found: 404 Not Found.
- Conflict: 409 Conflict.

**Endpoints**

**Projects**
- **Get all projects**: GET /api/projects
  - Auth: optional for read; creation requires roles (see create).
  - Response: List<ProjectDto.ProjectResponse>

- **Get project by id**: GET /api/projects/{id}
  - Path: `id` (Long)
  - Response: `ProjectDto.ProjectResponse` { id, projectCode, projectName, description, createdAt }

- **Create project**: POST /api/projects
  - Auth: requires role ADMIN or MANAGER (`@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")`)
  - Request: `ProjectDto.CreateProjectRequest` { projectCode (max 20), projectName (max 150), description }
  - Response: 201 Created -> `ProjectDto.ProjectResponse`
  - See: [project/controller/ProjectController.java](src/main/java/com/company/bugtracker1/project/controller/ProjectController.java)

**Users**
- **Get all users**: GET /api/users
  - Auth: requires ADMIN
  - Response: List<UserDto.UserResponse>

- **Get user by id**: GET /api/users/{id}
  - Auth: ADMIN or MANAGER
  - Response: `UserDto.UserResponse` { id, name, email, role, createdAt }

- **Create user**: POST /api/users
  - Auth: ADMIN
  - Request: `UserDto.CreateUserRequest` { name, email, password, role }
  - Response: 201 Created -> `UserDto.UserResponse`
  - See: [user/controller/UserController.java](src/main/java/com/company/bugtracker1/user/controller/UserController.java)

**Tickets**
- **Create ticket**: POST /api/tickets
  - Auth: requires valid JWT (any authenticated user)
  - Request: `TicketDto.CreateTicketRequest` {
      projectId: Long,
      issueDescription: String,
      supportLevel: enum `SupportLevel` (L1|L2|L3),
      priority: enum `Priority` (LOW|MEDIUM|HIGH|CRITICAL),
      remarks: String (optional)
    }
  - Response: 201 Created -> `TicketDto.TicketResponse`

- **Update ticket**: PUT /api/tickets/{id}
  - Auth: authenticated
  - Request: `TicketDto.UpdateTicketRequest` { issueDescription, supportLevel, priority, remarks }
  - Response: 200 OK -> `TicketDto.TicketResponse`

- **Get ticket by id**: GET /api/tickets/{id}
  - Response: `TicketDto.TicketResponse`

- **List / filter tickets (paged)**: GET /api/tickets
  - Query params (all optional unless noted):
    - `status` (TicketStatus enum: OPEN, IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED)
    - `priority` (Priority)
    - `assignedTo` (Long userId)
    - `projectId` (Long)
    - `supportLevel` (SupportLevel)
    - `fromDate` / `toDate` (ISO date-time) — filters by created/generation date range
    - `page` (int, default 0)
    - `size` (int, default 20)
    - `sortBy` (String, default `createdAt`)
    - `sortDir` (`asc` | `desc`, default `desc`)
  - Response: `Page<TicketDto.TicketResponse>` (Spring Page with content, totalElements, totalPages, number, size)

- **Assign ticket**: PATCH /api/tickets/{id}/assign
  - Request: `TicketDto.AssignTicketRequest` { assigneeId }
  - Response: 200 OK -> `TicketDto.TicketResponse`

- **Update status**: PATCH /api/tickets/{id}/status
  - Request: `TicketDto.UpdateStatusRequest` { status: TicketStatus }
  - Behavior: allowed transitions validated by `TicketStatus.canTransitionTo(...)` logic
  - Response: 200 OK -> `TicketDto.TicketResponse`

- **Add resolution**: PATCH /api/tickets/{id}/resolution
  - Request: `TicketDto.ResolutionRequest` { resolutionDetails }
  - Response: 200 OK -> `TicketDto.TicketResponse`
  - See: [ticket/controller/TicketController.java](src/main/java/com/company/bugtracker1/ticket/controller/TicketController.java)

**DTO / Enum Reference (summary)**
- `AuthDto.RegisterRequest` { name: string, email: string, password: string }
- `AuthDto.LoginRequest` { email: string, password: string }
- `AuthDto.AuthResponse` { token: string, type: "Bearer", userId: Long, name, email, role }

- `UserDto.CreateUserRequest` { name, email, password, role }
- `UserDto.UserResponse` { id, name, email, role, createdAt }
- `UserDto.UserSummary` { id, name, email, role }

- `ProjectDto.CreateProjectRequest` { projectCode, projectName, description }
- `ProjectDto.ProjectResponse` { id, projectCode, projectName, description, createdAt }
- `ProjectDto.ProjectSummary` { id, projectCode, projectName }

- `TicketDto.CreateTicketRequest` { projectId, issueDescription, supportLevel, priority, remarks }
- `TicketDto.TicketResponse` {
    id, ticketId, project: ProjectSummary, issueDescription, assignedTo: UserSummary,
    supportLevel, priority, generationDate, responseDateTime, resolutionTime,
    currentStatus, resolutionDetails, remarks, createdBy: UserSummary, createdAt, updatedAt
  }

- Enums:
  - `TicketStatus`: OPEN, IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED
  - `Priority`: LOW, MEDIUM, HIGH, CRITICAL
  - `SupportLevel`: L1, L2, L3

**Examples**
- Login request
```json
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

- Login response
```json
200 OK
{
  "token": "<jwt>",
  "type": "Bearer",
  "userId": 10,
  "name": "Alice",
  "email": "alice@example.com",
  "role": "MANAGER"
}
```

- Create ticket request
```json
POST /api/tickets
Authorization: Bearer <token>
{
  "projectId": 5,
  "issueDescription": "Cannot save record",
  "supportLevel": "L2",
  "priority": "HIGH",
  "remarks": "Happens intermittently"
}
```

**Frontend integration notes**
- Always parse error responses according to the ErrorResponse record: show `message` to users for validation or friendly errors and use `status` to branch UI behavior.
- Use `page`, `size`, `sortBy`, `sortDir` to implement list pagination and sorting for tickets. Map Spring Page fields to your frontend paginator.
- Respect role-based UI: hide admin-only actions from non-admin users; still guard client actions with server responses.
- For date-time fields use ISO-8601 (backend expects `DateTimeFormat.ISO.DATE_TIME` on filters).

**Files to reference in codebase**
- Auth controllers & DTOs: [auth/controller/AuthController.java](src/main/java/com/company/bugtracker1/auth/controller/AuthController.java), [auth/dto/AuthDto.java](src/main/java/com/company/bugtracker1/auth/dto/AuthDto.java)
- Ticket code: [ticket/controller/TicketController.java](src/main/java/com/company/bugtracker1/ticket/controller/TicketController.java), [ticket/dto/TicketDto.java](src/main/java/com/company/bugtracker1/ticket/dto/TicketDto.java), [ticket/entity](src/main/java/com/company/bugtracker1/ticket/entity)
- Project code: [project/controller/ProjectController.java](src/main/java/com/company/bugtracker1/project/controller/ProjectController.java), [project/dto/ProjectDto.java](src/main/java/com/company/bugtracker1/project/dto/ProjectDto.java)
- User code: [user/controller/UserController.java](src/main/java/com/company/bugtracker1/user/controller/UserController.java), [user/dto/UserDto.java](src/main/java/com/company/bugtracker1/user/dto/UserDto.java)
- Exception handling: [exception/GlobalExceptionHandler.java](src/main/java/com/company/bugtracker1/exception/GlobalExceptionHandler.java)

If you want, I can also generate a Postman collection or an OpenAPI (Swagger) spec JSON/YAML from these contracts — which would you prefer?
