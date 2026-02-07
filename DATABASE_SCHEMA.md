# Database Schema Documentation

## Overview

The Compliance Checklist application uses three main database tables with clear relationships. This document provides the complete database schema with explanations.

---

## Entity Relationship Diagram

```
┌─────────────────────────┐
│         User            │
│  (Django Built-in)      │
├─────────────────────────┤
│ PK  id                  │
│     username            │
│     email               │
│     password (hashed)   │
│     first_name          │
│     last_name           │
│     is_active           │
│     date_joined         │
│     last_login          │
└──────────┬──────────────┘
           │
           │ 1:N (creates)
           │
           ▼
┌─────────────────────────┐
│      Checklist          │
├─────────────────────────┤
│ PK  id                  │
│     name                │
│     description         │
│     due_date            │
│     status              │
│ FK  created_by_id       │────┐ References User(id)
│     created_at          │    │ ON DELETE CASCADE
│     updated_at          │◄───┘
└──────────┬──────────────┘
           │
           │ 1:N (contains)
           │
           ▼
┌─────────────────────────┐
│    ChecklistItem        │
├─────────────────────────┤
│ PK  id                  │
│ FK  checklist_id        │────┐ References Checklist(id)
│     title               │    │ ON DELETE CASCADE
│     description         │◄───┘
│     status              │
│     assigned_owner      │
│     evidence_notes      │
│     completed_at        │
│     created_at          │
│     updated_at          │
└─────────────────────────┘
```

---

## Table Definitions

### 1. User Table

**Table Name:** `auth_user` (Django built-in)

**Purpose:** Stores user account information for authentication and authorization.

**Fields:**

| Field Name   | Type         | Constraints      | Description                          |
|-------------|--------------|------------------|--------------------------------------|
| id          | INTEGER      | PRIMARY KEY      | Unique identifier                    |
| username    | VARCHAR(150) | UNIQUE, NOT NULL | Username for login                   |
| email       | VARCHAR(254) | UNIQUE           | Email address                        |
| password    | VARCHAR(128) | NOT NULL         | Hashed password                      |
| first_name  | VARCHAR(150) |                  | User's first name                    |
| last_name   | VARCHAR(150) |                  | User's last name                     |
| is_active   | BOOLEAN      | DEFAULT TRUE     | Whether account is active            |
| is_staff    | BOOLEAN      | DEFAULT FALSE    | Can access admin panel               |
| is_superuser| BOOLEAN      | DEFAULT FALSE    | Has all permissions                  |
| date_joined | DATETIME     | AUTO             | When account was created             |
| last_login  | DATETIME     | NULL             | Last login timestamp                 |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `username`
- UNIQUE INDEX on `email`

**Notes:**
- Passwords are automatically hashed using Django's PBKDF2 algorithm
- Built-in Django model, fully managed by Django

---

### 2. Checklist Table

**Table Name:** `checklists_checklist`

**Purpose:** Stores compliance checklists with metadata and tracking information.

**Fields:**

| Field Name    | Type         | Constraints           | Description                              |
|--------------|--------------|----------------------|------------------------------------------|
| id           | INTEGER      | PRIMARY KEY          | Unique identifier                        |
| name         | VARCHAR(200) | NOT NULL             | Checklist name                           |
| description  | TEXT         |                      | Detailed description                     |
| due_date     | DATE         | NULL                 | When checklist should be completed       |
| status       | VARCHAR(20)  | NOT NULL, INDEXED    | Current status (draft/active/completed)  |
| created_by_id| INTEGER      | NOT NULL, FK         | User who created this checklist          |
| created_at   | DATETIME     | AUTO                 | When checklist was created               |
| updated_at   | DATETIME     | AUTO                 | Last modification time                   |

**Foreign Keys:**
- `created_by_id` REFERENCES `auth_user(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `status`
- INDEX on `(status, due_date)`
- INDEX on `(created_by_id, status)`

**Status Choices:**
- `draft` - Checklist is being prepared
- `active` - Checklist is in use
- `completed` - All items are done

**Computed Properties (not in database):**
- `is_overdue` - Calculated: due_date < today AND status != 'completed'
- `completion_percentage` - Calculated: (completed_items / total_items) * 100

**Notes:**
- `created_at` automatically set on creation
- `updated_at` automatically updated on every save
- `due_date` is optional, validated to not be in the past for new checklists
- When a User is deleted, their checklists are also deleted (CASCADE)

---

### 3. ChecklistItem Table

**Table Name:** `checklists_checklistitem`

**Purpose:** Stores individual items within a checklist that need to be completed.

**Fields:**

| Field Name     | Type         | Constraints           | Description                              |
|---------------|--------------|----------------------|------------------------------------------|
| id            | INTEGER      | PRIMARY KEY          | Unique identifier                        |
| checklist_id  | INTEGER      | NOT NULL, FK         | Parent checklist                         |
| title         | VARCHAR(200) | NOT NULL             | Item title                               |
| description   | TEXT         |                      | Detailed description                     |
| status        | VARCHAR(20)  | NOT NULL, INDEXED    | Current status                           |
| assigned_owner| VARCHAR(100) |                      | Person responsible                       |
| evidence_notes| TEXT         |                      | Evidence of completion                   |
| completed_at  | DATETIME     | NULL                 | When item was completed                  |
| created_at    | DATETIME     | AUTO                 | When item was created                    |
| updated_at    | DATETIME     | AUTO                 | Last modification time                   |

**Foreign Keys:**
- `checklist_id` REFERENCES `checklists_checklist(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `status`
- INDEX on `(checklist_id, status)`

**Status Choices:**
- `pending` - Not started
- `in-progress` - Currently being worked on
- `completed` - Finished
- `not-applicable` - Doesn't apply to this checklist

**Computed Properties:**
- `is_completed` - Calculated: status in ['completed', 'not-applicable']

**Notes:**
- `assigned_owner` is a text field, not a foreign key (flexibility)
- `completed_at` is automatically set when status changes to 'completed'
- When a Checklist is deleted, all its items are also deleted (CASCADE)
- Items are ordered by `created_at` (oldest first) by default

---

## Relationships

### User → Checklist (One-to-Many)

- **Type:** One-to-Many
- **Foreign Key:** `Checklist.created_by_id` → `User.id`
- **Delete Behavior:** CASCADE
- **Description:** A user can create many checklists, but each checklist has one creator
- **Reverse Access:** `user.checklists.all()` returns all checklists created by user

### Checklist → ChecklistItem (One-to-Many)

- **Type:** One-to-Many
- **Foreign Key:** `ChecklistItem.checklist_id` → `Checklist.id`
- **Delete Behavior:** CASCADE
- **Description:** A checklist can have many items, but each item belongs to one checklist
- **Reverse Access:** `checklist.items.all()` returns all items in checklist

---

## Database Constraints

### Primary Keys
- All tables use auto-incrementing integer primary keys
- Automatically indexed for fast lookups

### Foreign Keys
- Enforce referential integrity
- CASCADE delete ensures orphaned records are cleaned up
- Indexed automatically for join performance

### NOT NULL Constraints
- Required fields cannot be null
- Enforced at database level
- Also validated in serializers

### Unique Constraints
- Username must be unique across all users
- Email must be unique across all users

### Check Constraints
- Status fields limited to predefined choices
- Enforced in Django models (not at database level for SQLite)

---

## Indexes for Performance

### Indexed Fields

1. **Primary Keys** (automatic)
   - `User.id`
   - `Checklist.id`
   - `ChecklistItem.id`

2. **Foreign Keys** (automatic)
   - `Checklist.created_by_id`
   - `ChecklistItem.checklist_id`

3. **Frequently Queried Fields**
   - `Checklist.status`
   - `ChecklistItem.status`

4. **Composite Indexes**
   - `(Checklist.status, Checklist.due_date)` - For filtering active/overdue
   - `(Checklist.created_by_id, Checklist.status)` - For user's checklists by status
   - `(ChecklistItem.checklist_id, ChecklistItem.status)` - For item status in checklist

**Purpose:** These indexes significantly speed up common queries like:
- Finding active checklists
- Finding overdue checklists
- Counting items by status
- Filtering checklists by creator

---

## Sample Data

### User
```sql
INSERT INTO auth_user (id, username, email, password, first_name, last_name, is_active, date_joined)
VALUES (1, 'john_doe', 'john@example.com', 'pbkdf2_sha256$...', 'John', 'Doe', 1, '2026-02-07 10:00:00');
```

### Checklist
```sql
INSERT INTO checklists_checklist (id, name, description, due_date, status, created_by_id, created_at, updated_at)
VALUES (1, 'Q1 2026 Security Audit', 'Quarterly security compliance review', '2026-03-31', 'active', 1, '2026-02-07 10:30:00', '2026-02-07 10:30:00');
```

### ChecklistItem
```sql
INSERT INTO checklists_checklistitem (id, checklist_id, title, description, status, assigned_owner, evidence_notes, completed_at, created_at, updated_at)
VALUES (1, 1, 'Review firewall rules', 'Audit all firewall configurations', 'completed', 'Jane Smith', 'Reviewed and updated', '2026-02-07 15:00:00', '2026-02-07 10:35:00', '2026-02-07 15:00:00');
```

---

## Query Examples

### Get all active checklists with their items
```sql
SELECT c.*, u.username as created_by_username
FROM checklists_checklist c
JOIN auth_user u ON c.created_by_id = u.id
WHERE c.status = 'active'
ORDER BY c.due_date ASC;
```

### Get completion statistics for a checklist
```sql
SELECT 
    c.id,
    c.name,
    COUNT(i.id) as total_items,
    SUM(CASE WHEN i.status IN ('completed', 'not-applicable') THEN 1 ELSE 0 END) as completed_items,
    ROUND(
        100.0 * SUM(CASE WHEN i.status IN ('completed', 'not-applicable') THEN 1 ELSE 0 END) / COUNT(i.id),
        2
    ) as completion_percentage
FROM checklists_checklist c
LEFT JOIN checklists_checklistitem i ON c.id = i.checklist_id
WHERE c.id = 1
GROUP BY c.id, c.name;
```

### Find overdue checklists
```sql
SELECT c.*, u.username
FROM checklists_checklist c
JOIN auth_user u ON c.created_by_id = u.id
WHERE c.due_date < DATE('now')
  AND c.status IN ('draft', 'active')
ORDER BY c.due_date ASC;
```

---

## Migration History

### Initial Migration (0001_initial.py)
- Creates User table (Django built-in)
- Creates Checklist table
- Creates ChecklistItem table
- Sets up foreign key relationships
- Creates indexes

### Future Migrations
If models change, Django will generate migration files:
```powershell
python manage.py makemigrations
python manage.py migrate
```

---

## Database File Location

**Development:**
- File: `backend/db.sqlite3`
- Format: SQLite 3
- Size: Grows with data (starts ~100KB)

**Production Recommendation:**
- Use PostgreSQL or MySQL
- Same schema structure
- Better performance and features
- Just change `DATABASES` setting in `settings.py`

---

## Backup and Recovery

### Backup SQLite Database
```powershell
# Create backup
copy backend\db.sqlite3 backend\db_backup_2026-02-07.sqlite3

# Restore backup
copy backend\db_backup_2026-02-07.sqlite3 backend\db.sqlite3
```

### Export Data
```powershell
# Export to JSON
python manage.py dumpdata > backup.json

# Import from JSON
python manage.py loaddata backup.json
```

---

## Schema Evolution Considerations

### Adding New Fields
1. Add field to model
2. Run `makemigrations`
3. Run `migrate`
4. Update serializers and views

### Changing Relationships
1. Create new field
2. Migrate data
3. Remove old field
4. Test thoroughly

### Adding Indexes
1. Add to `Meta.indexes` in model
2. Run `makemigrations`
3. Run `migrate`
4. Monitor query performance

---

## Performance Considerations

### Optimizations Implemented
1. ✅ Indexes on frequently queried fields
2. ✅ Composite indexes for common filter combinations
3. ✅ `select_related()` for foreign key queries
4. ✅ `prefetch_related()` for reverse foreign key queries
5. ✅ Pagination to limit result sets

### Future Optimizations
- Database query caching
- Redis for frequently accessed data
- Read replicas for scaling
- Partitioning for large tables

---

## Security Considerations

### Implemented
1. ✅ Foreign key constraints prevent invalid references
2. ✅ CASCADE delete prevents orphaned records
3. ✅ Password hashing (PBKDF2)
4. ✅ Django's SQL injection protection (parameterized queries)
5. ✅ No raw SQL queries (using ORM)

### Recommended for Production
- Regular database backups
- Encrypted connections (TLS)
- Limited database user permissions
- Audit logging
- Database access monitoring

---

This completes the database schema documentation. The schema is normalized, efficient, and designed for scalability.
