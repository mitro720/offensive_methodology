# 02 - Deep Web Application Layer (Expanded)

You have mapped the attack surface, and you are staring at a Web Application. You don't just click around—you map it methodically, testing each feature for deep flaws.

---

## 🧭 The Tactical Decision Tree

Real offensive testing is not linear ("I will test XSS, then SQLi"). It is **behavior-driven**. When you identify a feature, follow its designated branch.

- **If the application has Authentication / Registration:**
  - Focus on **[Auth & Sessions](02_Auth_and_Sessions.md)**: Password reset poisoning, token predictability, JWT forging, OAuth state bypasses.
- **If the application has a lot of User Input / Search / Filters:**
  - Focus on **[Injection Attacks](02_Injection_Attacks.md)**: SQLi, SSTI, Command Injection, Stored/Reflected XSS.
- **If the application processes Financials, Carts, or complex logic:**
  - Focus on **[Business Logic & IDOR](02_Business_Logic_Abuse.md)**: Race conditions (Time-of-Check to Time-of-Use), Price manipulation, coupon abuse.
- **If the application relies heavily on APIs (React, Vue, SPA):**
  - Focus on **[API & GraphQL](02_API_and_GraphQL.md)**: BOLA (Broken Object Level Authorization), Mass Assignment, Rate Limit bypasses, Schema Introspection.
- **If the application accepts URLs (webhooks, avatar via URL, integrations):**
  - Focus on **[SSRF & LFI](02_SSRF_and_LFI.md)**: Internal port scanning, Cloud Metadata querying, Path traversal to read `/etc/passwd`.

---

## 🚫 The "Failure Branch": What to do when nothing works

You ran your automated scanners. You pushed some basic payloads. Nothing popped. It's time to dig into the **nuance** where most people quit.

**If no obvious Injection (SQLi / XSS):**
1. **Review JS Deeply:** Open DevTools > Sources. Deobfuscate the JS. Look for hardcoded keys (AWS, Stripe). Look for hidden routes the UI doesn't show you (e.g., `/api/v2/beta/admin`).
2. **Examine Error Messages:** Trigger intentional 500 server errors (send an array `{"id": [1,2]}` where it expects an integer `1`). Does the stack trace leak the framework version or database schema?

**If no obvious Upload/File Execution:**
1. **Fuzz for Hidden Parameters:** Use an tool like `Arjun` to find undocumented parameters like `?debug=true`, `?test=1`, `?admin_override=`.
2. **Inspect Business Logic:** Does updating your email address immediately update it, or send a confirmation link? What if you use a second account to claim that same email before the first account confirms?

**If the API seems locked down:**
1. **Check Content-Type Bypasses:** If `application/json` is blocked or filtered by a WAF, what happens if you send valid XML, or change the Content-Type to `application/x-www-form-urlencoded`?
2. **Test HTTP Verb Tampering:** If a `POST` request to `/api/users/1/delete` is forbidden (403), what happens if you send it as a `GET`, `PUT`, `OPTIONS`, or `DELETE`? Often the auth middleware only checks `POST`.

---

## 🛠️ General Web Recon Checklist (Before you run the decision tree)
Before diving into the nodes above, ensure you have completed the following:
1. **Spidering/Crawling:** Use `katana` or Burp Suite to find *all* endpoints.
2. **JavaScript File Analysis:** Deobfuscate `.js` files or map them with `Gaping`.
3. **Parameter Discovery:** Find hidden parameters (e.g., `?admin=`, `?debug=`) using `ffuf`.
4. **VHost / Content Fuzzing:** Ensure you aren't missing a hidden `/admin/` portal on the same server.

---

## 🧠 Phase 2 Checkpoint

- [ ] Did I verify if an IDOR works by checking with *two completely separate user accounts* (not just the admin and the victim)?
- [ ] If I found an injection, did I immediately try to escalate it to RCE? (SQLi to `xp_cmdshell` / XSS to hijacking an Admin session).
- [ ] Did I check the HTTP response headers for missing security flags that could indicate a larger architectural flaw?
