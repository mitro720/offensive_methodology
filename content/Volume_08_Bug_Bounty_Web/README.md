# VOLUME VIII — Bug Bounty & Web App Exploitation

> *"The best bug bounty hunters don't find the most bugs. They find the most impactful ones."*

---

## 🧭 The Tactical Decision Tree

Your testing path is **determined by the feature in front of you**, not by the vulnerability classes you know. Follow this tree when you land on any new feature.

```
New Feature Discovered
│
├── It accepts user-controlled INPUT?
│   ├── Single string field → Test for Injection (SQL, SSTI, XSS — see below)
│   ├── JSON Object field → Test for Mass Assignment, NoSQL injection, type confusion
│   ├── File Upload → Test for content-type bypass, polyglot files, zip-slip attacks
│   └── URL Parameter → Test for SSRF (internal, cloud metadata, Out-of-Band DNS ping)
│
├── It returns USER DATA?
│   ├── Based on ID → Test for IDOR (change ID to another user's, try GUIDs from other API endpoints)
│   ├── Based on role → Test for Vertical Privilege Escalation (remove/downgrade role token)
│   └── Based on session → Test for session fixation and cookie tampering
│
├── It initiates an ACTION (payment, invite, delete)?
│   ├── Can it be triggered twice simultaneously? → Race Condition (Turbo Intruder)
│   ├── Can a lower-permission user trigger it? → Authorization Logic Flaw
│   └── Does it modify state that another feature trusts? → Workflow Bypass chain
│
└── It interacts with a third-party service (OAuth, SSO, Payment provider)?
    ├── OAuth → Test for redirect_uri bypass, state token CSRF, token leakage
    ├── SSO (SAML) → Test for XML signature wrapping, signature stripping
    └── Payment Gateway → Test for currency manipulation, negative values, rounding errors
```

---

## Chapter 1: Authentication & Account Takeover (ATO)

### 1.1 — Password Reset Poisoning
**Why it works:** The application uses the `Host:` header from the HTTP request to construct the password reset URL. If the backend trusts this header blindly, you can inject your own domain.

**How to test:**
1. Request a password reset for the victim's email.
2. In the HTTP request, change `Host: target.com` to `Host: evil.com`.
3. Also try `X-Forwarded-Host: evil.com`.
4. If the victim receives an email with a link to `evil.com/reset?token=...`, the token is yours.

**Impact:** Full Account Takeover of any user including admins.

### 1.2 — JWT Flaws
**Algorithm Confusion (RS256 → HS256):**
The app uses RSA to sign JWTs (asymmetric). If you trick the server into using HS256 (symmetric), it verifies the JWT signature against the *public key* — which you already have.
```
1. Fetch the public key: /.well-known/jwks.json
2. Create a new JWT, change alg from RS256 to HS256
3. Sign it using the server's PUBLIC KEY as the HMAC secret
4. Submit your crafted JWT
```

**`alg:none` bypass:** Change the `alg` header to `none`, delete the signature (but keep the trailing `.`). Submit `header.payload.`

### 1.3 — OAuth Redirect URI Bypass
**Why it works:** Apps register specific redirect URIs, but often match them too loosely.

**Bypass techniques:**
- `redirect_uri=https://legit.com@evil.com` (authority confusion)
- `redirect_uri=https://legit.com/callback?next=https://evil.com` (open redirect chain)
- `redirect_uri=https://evil.legit.com` (subdomain confusion if wildcard is set)

---

## Chapter 2: IDOR Chains & Multi-Step ATOs

### 2.1 — IDOR Escalation Chains

A single IDOR is a P3. A chain of IDORs leading to ATO is a P1. Think relational:
1. `GET /api/users/1234` → Leaks `email`, `phone`, and `account_type`.
2. `POST /api/users/1234/email_update` → IDOR allows changing the victim's email.
3. `POST /api/password_reset` with the new email you just set → You own the account.

**Each step alone is a finding. Together, they are a critical.**

### 2.2 — Multi-Step Account Takeover Patterns

```
ATO via Business Logic
│
├── Password Reset → Change email via IDOR → Trigger reset → Takeover
├── Stored XSS (in admin panel) → Exfiltrate admin CSRF token → Submit malicious request as admin → ATO
├── OAuth Misconfiguration → Force victim to link their account to your OAuth identity
└── 2FA bypass → Skip the OTP step via forced browsing OR brute-force 4-digit OTP with no rate limit
```

---

## Chapter 3: Race Conditions (The Time-of-Check Bug)

These are found in any feature where a server checks a condition (e.g., "Is this coupon valid?") and then acts on it. The attack fires the action faster than the server can update the state.

**The Single-Packet Attack (Turbo Intruder):**
```python
# Turbo Intruder script for single-packet attack
# In Burp → Extensions → Turbo Intruder → select request → Paste this:
def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint,
                           concurrentConnections=1,
                           pipeline=False,
                           engine=Engine.BURP2)
    for i in range(50):  # 50 requests, all at once
        engine.queue(target.req, gate='1')  # All queued behind gate '1'
    engine.openGate('1')  # Fire all simultaneously
```

**Where to look:**
- Gift card / coupon redemption
- Account balance transfer (banking, credits)
- Signup bonus claiming
- Limited-inventory purchasing
- API rate limits that rely on server-side state

**Impact Amplification:** A $5 coupon abused 100 times is a $500 business impact. Measure impact by the *maximum theoretical abuse*, not just the single instance.

---

## Chapter 4: Business Logic Flaws

These require **reading the documentation and thinking like the developer who wrote it** — and then thinking like someone who wants to break every assumption.

### Key Assumptions to Challenge:
- "A user can only have one account" → Can you create multiple accounts with plus-addressing? (`user+1@gmail.com`, `user+2@gmail.com`)
- "The shopping cart total is calculated server-side" → What if you add an item, then delete it but keep the discount?
- "You must complete step 1 before step 2" → Can you skip step 1 and call the step 2 API directly?
- "Prices are fixed" → What if you update a cart item's price via a hidden parameter?

---

## 🚫 Bug Bounty Operational Failures

These are the patterns that kill your programs and reports:
1. **Reporting Duplicate Findings:** Always check the program's duplicate disclosure page and known-issues tracker before reporting.
2. **Not Calculating Business Impact:** A P3 with a clear path to P1 (via chain) should be reported as the chain, not the individual step.
3. **Missing the Forest for the Trees:** Finding reflected XSS in a sandbox iframe while completely missing an IDOR in the core API because you were too focused on one vector.
4. **No PoC / Reproduction Steps:** Triagers cannot approve a report they cannot reproduce. Script your PoCs or provide clear curl commands.

---

## 🧠 Volume VIII Checkpoint

- [ ] Did I test the target with **two completely separate accounts** to verify every authorization check?
- [ ] Did I look at every feature from the perspective of **"what does this assume about me?"** and then violate that assumption?
- [ ] Did I evaluate every single-finding into a **potential chain** before writing the report?
