# GRC Checklist API Documentation

## Architecture Overview

The backend follows a **layered architecture** pattern for clean separation of concerns:

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (views.py)           │
│         - Controllers/API Endpoints             │
│         - Request/Response handling             │
│         - Authentication/Permissions            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│          Business Layer (services.py)           │
│          - Business Logic                       │
│          - Data Validation                      │
│          - Transaction Management               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│       Data Access Layer (repositories.py)       │
│       - Database Queries                        │
│       - ORM Operations                          │
│       - Query Optimization                      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            Database Layer (models.py)           │
│            - Data Models                        │
│            - Schema Definitions                 │
│            - Relationships                      │
└─────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Controllers (views.py)
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Route handling
  - Authentication and permission checks
  - Input deserialization
  - Call service layer methods
  - Serialize response data
- **Does NOT**: Contain business logic or direct database access

### 2. Services (services.py)
- **Purpose**: Implement business logic and orchestrate operations
- **Responsibilities**:
  - Business rule validation
  - Complex operations across multiple entities
  - Transaction management
  - Coordinate between repositories
- **Does NOT**: Handle HTTP concerns or direct ORM queries

### 3. Repositories (repositories.py)
- **Purpose**: Abstract database access
- **Responsibilities**:
  - CRUD operations
  - Complex queries
  - Query optimization (select_related, prefetch_related)
  - Filter and search operations
- **Does NOT**: Contain business logic or validation

### 4. Models (models.py)
- **Purpose**: Define data structure
- **Responsibilities**:
  - Database schema
  - Field definitions
  - Model relationships
  - Simple helper methods
- **Does NOT**: Contain complex business logic

## API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Authentication
All endpoints require JWT authentication except login and registration.

**Headers Required:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register/`

Create a new user account.

**Request Body:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Validation Rules:**
- Username: Required, unique, 3-150 characters
- Email: Required, unique, valid email format
- Password: Required, minimum 8 characters
- First/Last name: Optional

---

### 2. Login
**POST** `/api/auth/login/`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "username": "john.doe",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 3. Refresh Token
**POST** `/api/auth/token/refresh/`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Checklist Endpoints

### 1. List All Checklists
**GET** `/api/checklists/`

Retrieve all checklists for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `active`, `completed`)
- `search` (optional): Search in name and description
- `ordering` (optional): Sort by field (`created_at`, `-created_at`, `due_date`, `-due_date`)

**Example Request:**
```
GET /api/checklists/?status=active&ordering=-created_at
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Q1 2026 Security Audit",
    "description": "Quarterly security compliance review",
    "status": "active",
    "due_date": "2026-03-31",
    "created_by": {
      "id": 1,
      "username": "john.doe",
      "email": "john@example.com"
    },
    "created_at": "2026-02-01T10:30:00Z",
    "updated_at": "2026-02-07T14:20:00Z",
    "items_count": 15,
    "completed_items_count": 8,
    "completion_percentage": 53.33
  }
]
```

---

### 2. Create Checklist
**POST** `/api/checklists/`

Create a new checklist.

**Request Body:**
```json
{
  "name": "Q1 2026 Security Audit",
  "description": "Quarterly security compliance review",
  "due_date": "2026-03-31",
  "status": "draft"
}
```

**Validation Rules:**
- `name`: Required, max 200 characters
- `description`: Optional, text field
- `due_date`: Required, cannot be in the past, format: YYYY-MM-DD
- `status`: Optional, default: 'draft', choices: 'draft', 'active', 'completed'

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Q1 2026 Security Audit",
  "description": "Quarterly security compliance review",
  "status": "draft",
  "due_date": "2026-03-31",
  "created_by": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com"
  },
  "items": [],
  "created_at": "2026-02-07T15:00:00Z",
  "updated_at": "2026-02-07T15:00:00Z",
  "items_count": 0,
  "completed_items_count": 0,
  "completion_percentage": 0.0
}
```

---

### 3. Get Checklist Details
**GET** `/api/checklists/{id}/`

Retrieve a specific checklist with all its items.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Q1 2026 Security Audit",
  "description": "Quarterly security compliance review",
  "status": "active",
  "due_date": "2026-03-31",
  "created_by": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com"
  },
  "items": [
    {
      "id": 1,
      "title": "Review firewall rules",
      "description": "Audit all firewall configurations",
      "status": "completed",
      "assigned_owner": "Security Team",
      "evidence_notes": "Reviewed and documented all rules",
      "completed_at": "2026-02-05T10:00:00Z",
      "created_at": "2026-02-01T11:00:00Z",
      "updated_at": "2026-02-05T10:00:00Z"
    }
  ],
  "created_at": "2026-02-01T10:30:00Z",
  "updated_at": "2026-02-07T14:20:00Z",
  "items_count": 15,
  "completed_items_count": 8,
  "completion_percentage": 53.33
}
```

---

### 4. Update Checklist
**PUT/PATCH** `/api/checklists/{id}/`

Update an existing checklist.

**Request Body (PUT - all fields):**
```json
{
  "name": "Q1 2026 Security Audit - Updated",
  "description": "Updated description",
  "due_date": "2026-04-15",
  "status": "active"
}
```

**Request Body (PATCH - partial update):**
```json
{
  "status": "completed"
}
```

**Business Rules:**
- Cannot mark checklist as 'completed' if it has incomplete items
- Due date cannot be in the past

**Response (200 OK):** Same as Get Checklist Details

---

### 5. Delete Checklist
**DELETE** `/api/checklists/{id}/`

Delete a checklist and all its items.

**Response (204 No Content):** Empty response

---

## Checklist Item Endpoints

### 1. List Items for Checklist
**GET** `/api/checklists/{checklist_id}/items/`

Get all items for a specific checklist.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "checklist": 1,
    "title": "Review firewall rules",
    "description": "Audit all firewall configurations",
    "status": "completed",
    "assigned_owner": "Security Team",
    "evidence_notes": "Reviewed and documented all rules",
    "completed_at": "2026-02-05T10:00:00Z",
    "created_at": "2026-02-01T11:00:00Z",
    "updated_at": "2026-02-05T10:00:00Z",
    "is_completed": true
  }
]
```

---

### 2. Create Item
**POST** `/api/items/`

Create a new checklist item.

**Request Body:**
```json
{
  "checklist": 1,
  "title": "Review access controls",
  "description": "Verify user access permissions",
  "status": "pending",
  "assigned_owner": "IT Security",
  "evidence_notes": ""
}
```

**Validation Rules:**
- `checklist`: Required, must exist
- `title`: Required, max 200 characters
- `description`: Optional
- `status`: Optional, default: 'pending', choices: 'pending', 'in-progress', 'completed', 'not-applicable'
- `assigned_owner`: Optional, max 100 characters
- `evidence_notes`: Optional, text field

**Business Rules:**
- Cannot add items to completed checklists
- When status changes to 'completed', `completed_at` is auto-set

**Response (201 Created):**
```json
{
  "id": 2,
  "checklist": 1,
  "title": "Review access controls",
  "description": "Verify user access permissions",
  "status": "pending",
  "assigned_owner": "IT Security",
  "evidence_notes": "",
  "completed_at": null,
  "created_at": "2026-02-07T15:30:00Z",
  "updated_at": "2026-02-07T15:30:00Z",
  "is_completed": false
}
```

---

### 3. Update Item
**PUT/PATCH** `/api/items/{id}/`

Update an existing item.

**Request Body:**
```json
{
  "status": "completed",
  "evidence_notes": "Verified all access controls are properly configured"
}
```

**Response (200 OK):** Same as item detail

---

### 4. Update Item Status
**PATCH** `/api/items/{id}/update_status/`

Quick endpoint to update only the status of an item.

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Response (200 OK):** Updated item details

---

### 5. Delete Item
**DELETE** `/api/items/{id}/`

Delete a checklist item.

**Response (204 No Content):** Empty response

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics
**GET** `/api/dashboard/stats/`

Get aggregate statistics for the dashboard.

**Response (200 OK):**
```json
{
  "total_checklists": 10,
  "active_checklists": 5,
  "completed_checklists": 3,
  "draft_checklists": 2,
  "total_items": 150,
  "completed_items": 95,
  "pending_items": 40,
  "in_progress_items": 15,
  "average_completion": 63.33
}
```

---

## Input Validation

### Validation Layers

1. **Field-Level Validation (Serializers)**
   - Data type validation
   - Required fields
   - Max length constraints
   - Format validation (email, date, etc.)

2. **Object-Level Validation (Serializers)**
   - Cross-field validation
   - Custom validation methods
   - Unique constraints

3. **Business Logic Validation (Services)**
   - Business rules enforcement
   - State transitions
   - Complex validation logic

### Example Validation Flow

```python
# 1. Field validation (serializers.py)
class ChecklistSerializer(serializers.ModelSerializer):
    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters")
        return value

# 2. Object validation (serializers.py)
    def validate(self, data):
        if data['status'] == 'completed' and not data.get('completion_date'):
            raise serializers.ValidationError("Completion date required")
        return data

# 3. Business validation (services.py)
    def update_checklist(self, checklist_id, data, user):
        if data.get('status') == 'completed':
            incomplete_items = self.item_repo.get_incomplete_items(checklist_id)
            if incomplete_items.exists():
                raise ValidationError("Cannot complete checklist with incomplete items")
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {
    "field_name": ["Specific field error"]
  }
}
```

### HTTP Status Codes

- `200 OK`: Successful GET/PUT/PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Example Error Responses

**Validation Error (400):**
```json
{
  "error": "Validation Error",
  "message": "The provided data is invalid",
  "details": {
    "name": ["This field is required"],
    "due_date": ["Due date cannot be in the past"]
  }
}
```

**Authentication Error (401):**
```json
{
  "error": "Authentication Failed",
  "message": "Invalid credentials"
}
```

**Not Found (404):**
```json
{
  "error": "Not Found",
  "message": "Checklist with id 999 not found"
}
```

---

## Database Operations

### Query Optimization

The repository layer implements several optimization techniques:

1. **Select Related**: Reduces database queries for foreign keys
```python
Checklist.objects.select_related('created_by').all()
```

2. **Prefetch Related**: Optimizes reverse foreign key lookups
```python
Checklist.objects.prefetch_related('items').all()
```

3. **Aggregation**: Calculates statistics at database level
```python
Checklist.objects.annotate(item_count=Count('items'))
```

### Transaction Management

Critical operations use database transactions:

```python
from django.db import transaction

@transaction.atomic
def create_checklist_with_items(data):
    checklist = checklist_repo.create(**data)
    for item_data in data['items']:
        item_repo.create(checklist=checklist, **item_data)
    return checklist
```

---

## API Documentation (Swagger)

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/swagger/`
- **ReDoc**: `http://localhost:8000/redoc/`
- **Schema JSON**: `http://localhost:8000/swagger.json`

The Swagger UI provides:
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication configuration

---

## Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "john.doe", "password": "securePassword123"}'
```

**Create Checklist:**
```bash
curl -X POST http://localhost:8000/api/checklists/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Security Audit",
    "description": "Q1 2026 audit",
    "due_date": "2026-03-31",
    "status": "active"
  }'
```

### Using Postman

1. Import the Swagger schema: `http://localhost:8000/swagger.json`
2. Set up environment variable for token
3. Use collection runner for automated testing

---

## Architecture Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to unit test each layer independently
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Can optimize each layer separately
5. **Reusability**: Services can be called from multiple controllers
6. **Clean Code**: Business logic is centralized and readable

