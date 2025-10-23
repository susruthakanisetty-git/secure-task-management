# 🛡️ Secure Task Management System

A full-stack **NX monorepo** project implementing a **secure, role-based task management system**.  
The system enables authenticated users to create, update, and manage tasks within their organization hierarchy using **JWT-based authentication** and **fine-grained Role-Based Access Control (RBAC)**.

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo_url>
cd turbovets-tasks
```

### 2. Environment Setup (.env)
Create a .env file in the project root with the following values:

env
Copy code
DATABASE_URL="postgresql://turbovets:turbovets@localhost:5432/turbovets?schema=public"
JWT_SECRET="dev-secret-change-me"
JWT_EXPIRES="1h"
3. Start Database (PostgreSQL)
If using Docker:

bash
Copy code
docker compose up -d
4. Apply Migrations & Seed Data
Run the following commands to initialize the database and populate seed data:

bash
Copy code
pnpm exec prisma migrate reset --force
pnpm exec prisma generate
pnpm exec tsx prisma/seed.ts
This seeds:

admin@local / admin123 → OWNER of parent organization

viewer@local / viewer123 → VIEWER of child organization

5. Run Applications
Run backend and frontend simultaneously:

bash
Copy code
pnpm nx serve api   # Backend → http://localhost:3000/api
pnpm nx serve web   # Frontend → http://localhost:4200
Login using admin@local / admin123 to begin.

🧱 Architecture Overview
This project uses an NX monorepo for modularity and shared logic reuse between backend and frontend.

🗂 NX Monorepo Layout
bash
Copy code
turbovets-tasks/
│
├── api/               # NestJS backend (Auth, RBAC, Prisma)
│   ├── src/app/       # Controllers, modules, services
│   ├── prisma/        # Schema & migrations
│   └── ...
│
├── web/               # Angular + Tailwind frontend
│   ├── src/app/       # Components, routes, services
│   └── ...
│
├── auth/              # Shared authentication logic
├── rbac/              # Shared RBAC (roles, guards, decorators)
├── prisma/            # Common Prisma schema and seed scripts
└── nx.json, docker-compose.yml, package.json, .env
🔄 Shared Libraries/Modules
Library	Description
auth	Handles JWT verification, guards, and user context decorators
rbac	Role-based permissions, hierarchical access logic, and guards
prisma	Prisma ORM schema, DB service, and seeding utilities
shared-models	(Optional) Shared interfaces between backend and frontend

🧩 Data Model Explanation
🧾 Entities
Entity	Description	Relationships
User	Application users	↔ Memberships
Organization	Represents hierarchy (parent/child)	↔ Tasks, Members
Membership	Links user to org with a role	role ∈ {OWNER, ADMIN, VIEWER}
Task	Task item under an organization	↔ Organization, User
AuditLog	Tracks user actions	↔ User, Task

🧮 ERD Diagram
arduino
Copy code
User ───< Membership >─── Organization ───< Task
                          |
                          └── child_organization
User belongs to multiple organizations through Memberships.

Organizations form a parent-child hierarchy.

Tasks are owned by organizations.

AuditLog records CRUD actions for traceability.

🔐 Access Control Implementation
🧱 Role Hierarchy
Role	Description	Permissions
OWNER	Full access including children orgs	Create, Read, Update, Delete
ADMIN	Manage tasks within same org	Create, Read, Update, Delete
VIEWER	Read-only access	Read

🧩 How Roles, Permissions, and Hierarchy Work
Each user belongs to one or more organizations via Membership.

The user’s role determines CRUD permissions.

Hierarchical access allows parent org owners to act on child orgs.

Guards like RolesGuard verify roles before executing controller logic.

🔑 JWT Integration with Access Control
/api/auth/login issues JWTs upon valid credentials.

JWT payload includes user ID, org ID, and role.

Guards extract this info to enforce org-level permissions dynamically.

Auth Flow:

pgsql
Copy code
Login → JWT Token → Angular stores token → Requests attach Bearer token → Nest guards validate & authorize
📡 API Documentation
Method	Endpoint	Description	Auth	Role
POST	/api/auth/login	Authenticate user & issue JWT	❌	Public
GET	/api/tasks	Get tasks visible to user	✅	Viewer+
POST	/api/tasks	Create a new task	✅	Admin+
PUT	/api/tasks/:id	Update existing task	✅	Admin+
DELETE	/api/tasks/:id	Delete a task	✅	Admin+
GET	/api/audit-log	View audit history	✅	Owner/Admin

Example Request — Login
bash
Copy code
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local","password":"admin123"}'
Example Request — Create Task
bash
Copy code
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Prepare Q4 Report","orgId":"<org-id>"}'
Example Response — Create Task
json
Copy code
{
  "id": "tsk1234",
  "title": "Prepare Q4 Report",
  "orgId": "org5678",
  "status": "TODO",
  "createdBy": "usr9999"
}
🔬 Testing
Layer	Tool	Coverage
Backend	Jest + Supertest	Auth, RBAC, Task CRUD
Frontend	Jest	Components, services, HTTP interceptor

Run tests:

bash
Copy code
pnpm nx test api
pnpm nx test web
You can also validate endpoints using Postman or curl.

🚀 Future Considerations
Advanced Role Delegation

Allow dynamic creation of sub-roles (e.g., project-level permissions).

Production-Ready Security

Implement JWT refresh tokens, CSRF protection, and rate limiting.

Integrate secure cookie-based authentication for browser clients.

Performance & Scalability

Implement RBAC caching for frequent permission lookups.

Add metrics for request latency and DB performance.

Audit Enhancements

Centralized dashboard for viewing all user and task audit events.

👨‍💻 Author
Susrutha Kanisetty
Master’s in Computer Science — Stony Brook University
📧 susrutha.kanisetty@example.com
🔗 github.com/susrutha-kanisetty

