# API & GraphQL Abuse

## 🎯 Goal
Understand the structured data mechanisms driving modern Single Page Applications (SPAs) and exploit their schemas, limits, and object-level permissions.

---

## 🗂️ 1. API Mapping & Discovery (Swagger / OpenAPI)

Before attacking an API, you must know what it expects.

- **Swagger Exposure:** Check for `/api-docs`, `/swagger-ui.html`, `/openapi.json`, `/v3/api-docs`. If found, import them into Postman or Burp to generate valid requests.
- **REST Introspection:** Sometimes appending `.json` instead of `.xml` reveals more endpoint information.
- **Hidden Versions:** If you are blocked on `/api/v2/users`, what happens if you try `/api/v1/users`? Older versions are frequently left online, untested, and lacking recent security patches.

## 🔓 2. BOLA (Broken Object Level Authorization) / IDOR in APIs

APIs are often built with the assumption the frontend will only request "valid" objects for that user.

- **Direct ID Referencing:** `GET /api/documents/120` works. What about `121`?
- **GUID/UUID Abuses:** If the user ID is a UUID (`f47ac10b-58cc-4372-a567-0e02b2c3d479`), you can't brute-force it easily. But you can often *leak* UUIDs through other endpoints (e.g. `GET /api/users` might leak the UUIDs of all users).
- **Secondary Parameters:** If the API prevents `user_id` tampering, can you tamper with `team_id`, `org_id`, or `project_id` to view their data?

## 🚦 3. Rate Limit Bypasses

When APIs enforce limits (e.g., 5 login attempts per minute), check *how* they track you.

- **IP-Based Tracking:** Bypass using HTTP headers: `X-Forwarded-For: 127.0.0.1`, `X-Originating-IP: 192.168.1.10`, `X-Remote-IP`, or even appending multiple IPs in a comma-separated list.
- **Null Byte Injection:** Append `%00` or `%0d%0a` to the end of your username or email during brute-force. E.g., `admin%00@target.com` might bypass the rate-limit string matching but still map to the `admin` account in the DB.
- **Endpoint Variations:** If `/api/login` is rate-limited, is `/api/v1/login` or `/api/login/` (with a trailing slash) also limited?

## 🕸️ 4. GraphQL Introspection & Exploitation

GraphQL is a query language for APIs. It is highly structured and often leaks its entire schema.

- **Introspection (`__schema`):** If enabled, you can ask the server to describe itself completely. Send a query for `__schema { types { name fields { name } } }`. Use tools like `InQL` (Burp Extension) or `GraphQL Voyager` to map it out visually.
- **GraphQL Aliases (Brute-Forcing):** GraphQL allows you to send multiple queries in a single HTTP request using aliases. If login is rate-limited per HTTP request, send 1 request containing 500 different login attempts as aliases.
- **Information Disclosure:** Examine the schema for deprecated fields (`@deprecated`) or administrative mutations (`deleteUser`, `updateRole`) that the frontend never calls but the backend still supports.
- **Query Depth & DoS:** Can you request massive nested objects (`user { posts { comments { author { posts... } } } }`) to exhaust server memory?

---

## 🔗 Pivot Opportunities

| Observation | Possible Pivot |
|-------------|----------------|
| BOLA on `/api/v1/backups` | Download an SQL dump or config file, pivot to Credential Hunting (Phase 4) |
| GraphQL Mutation `uploadAvatar` | Intended for images, but does it enforce it? Upload a web shell. |
| Rate Limit Bypass on Password Reset | Brute-force the 4-digit OTP code to achieve full ATO |

---

## 📚 References
- OWASP API Security Top 10
- HackTricks - GraphQL
