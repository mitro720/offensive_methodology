# FTP Enumeration

## 🎯 Goal
Identify whether the FTP service allows **anonymous** or **authenticated** access, discover **writable directories**, and locate **sensitive files** (backups, configuration, credentials) that can be leveraged for further compromise.

---

## 🔧 Quick‑Commands (PowerShell)
```powershell
# 1. Test anonymous login
ftp -n TARGET <<EOF
user anonymous
binary
ls
quit
EOF

# 2. Brute‑force credentials (hydra)
hydra -L users.txt -P pass.txt ftp://TARGET

# 3. List hidden files after login (if you have credentials)
ftp -n TARGET <<EOF
user USER PASS
binary
ls -a
quit
EOF
```
*Linux equivalents are the same `ftp` client or `lftp`.*

---

## ✅ What to Look For
- **Anonymous login enabled?** If yes, you can download any publicly exposed files.
- **Writable directories:** Successful `STOR` of a test file indicates write permission.
- **Backup archives:** Look for `*.zip`, `*.tar.gz`, `*.bak` – often contain source code or config files.
- **Credential files:** `.htpasswd`, `passwd`, `shadow`, `config.inc.php`.
- **Web root mapping:** Identify which directory maps to the web server (e.g., `/var/www/html`). This is crucial for **file‑upload pivot**.

---

## 🔗 Pivot Opportunities
| Observation | Possible Pivot |
|-------------|----------------|
| Anonymous read access to backup files | Extract DB credentials → login to DB → dump data or write web shell via `SELECT INTO OUTFILE` |
| Writable directory that is served by the web server | Upload a malicious script (PHP/ASP) → execute via HTTP → gain remote code execution |
| Credentials found in config files | Reuse on SSH, MySQL, or other services |

---

## 📚 References
- `ftp-anon` and `ftp-syst` Nmap scripts
- OWASP FTP Security Cheat‑Sheet
