---
name: nodejs-saas-patterns
description: Expert knowledge of Node.js SaaS application patterns including authentication, API design, database access, error handling, and production-ready code standards. Use when writing or reviewing Node.js backend code, Express routes, middleware, database queries, or API endpoints.
allowed-tools: Read, Grep, Glob, Write, Edit
---

# Node.js SaaS Patterns

## Authentication Patterns

### JWT Middleware (Standard Pattern)
```javascript
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

### Session-Based Auth Check
```javascript
export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
```

## API Route Patterns

### Standard CRUD Route Structure
```javascript
// GET /api/resources — list with pagination
router.get("/", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const items = await db.findMany({ userId: req.user.id, skip: (page-1)*limit, take: +limit });
    res.json({ items, page: +page, total: await db.count({ userId: req.user.id }) });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST /api/resources — create
router.post("/", requireAuth, validateBody(CreateSchema), async (req, res) => {
  try {
    const item = await db.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
});
```

## Error Handling

### Global Error Handler (add to Express app)
```javascript
app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ error: error.message });
  if (error.name === "UnauthorizedError") return res.status(401).json({ error: "Unauthorized" });
  res.status(500).json({ error: "Internal server error" });
});
```

## Database Patterns

### Always use transactions for multi-step operations
```javascript
await db.transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.subscription.create({ data: { userId: user.id, plan: "free" } });
  return user;
});
```

### Never expose raw database errors to clients
```javascript
try {
  await db.user.create({ data });
} catch (error) {
  if (error.code === "P2002") { // Prisma unique constraint
    throw new Error("Email already in use");
  }
  throw new Error("Failed to create account");
}
```

## Environment Variables

Always validate required env vars at startup:
```javascript
const required = ["DATABASE_URL", "JWT_SECRET", "STRIPE_SECRET_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}
```

## Security Checklist
- [ ] All user inputs validated before use
- [ ] SQL queries use parameterized inputs (never string concatenation)
- [ ] Passwords hashed with bcrypt (never stored plain)
- [ ] Sensitive routes protected with requireAuth middleware
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured for production domains only
- [ ] Helmet.js installed for security headers
