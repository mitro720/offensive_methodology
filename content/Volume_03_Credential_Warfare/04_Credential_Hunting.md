# Credential Hunting & Accumulation (The Core Pivot)

## 🎯 Goal
If you have a toehold (LFI, Read-Only FTP, Low-Priv Shell, SQL Injection), your primary operation must shift to gathering credentials. Passwords, hashes, and tokens are the fuel that powers lateral movement. You are no longer looking for "vulnerabilities" - you are looking for **keys to the kingdom**.

---

## 🗄️ 1. On-Disk Credentials (The Configuration Leak)

The first place to look when you achieve arbitrary file read (LFI / Web Shell).

- **Web Server Configuration Files:**
  - `.env`, `wp-config.php`, `database.yml`, `web.config`, `global.asa`.
  - Framework-specific secrets: Django `settings.py` (Secret Key), Laravel `config/database.php`.
- **System Configuration & Logs:**
  - `~/.bash_history`, `~/.zsh_history`, `~/.mysql_history`, `~/.psql_history`.
  - Windows PowerShell History: `C:\Users\<User>\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`.
  - `/var/log/auth.log` (Sometimes users type their password into the username prompt).
- **Source Code & Git:**
  - Check for exposed `.git` directories and dump them using `git-dumper`. Look into `git log -p` for hardcoded secrets that were "removed".
  - Use `trufflehog` or `gitleaks` over massive codebases.
- **Unattended Windows Installations:**
  - `C:\Windows\Panther\Unattend.xml` or `sysprep.inf` (often contain base64 string for Administrator passwords).

## 🧠 2. In-Memory Credentials (Post-Exploitation)

You have an interactive shell (often requires higher privileges). Stop reading files, start inspecting memory.

- **Windows LSASS Dump (Mimikatz / Procdump / Rubeus):**
  - Extract clear-text passwords (WDigest if enabled) and NTLM hashes.
  - Command: `sekurlsa::logonpasswords` via Mimikatz, or dump the `lsass.exe` process manually using `procdump -ma lsass.exe lsass.dmp` and analyze offline.
- **Linux Core Dumps & SSH Agents:**
  - Identify running `ssh-agent` processes. If you can hijack the socket in `/tmp/ssh-*`, you can forward your connection instantly without the password.
  - Dump memory for processes handling plaintext (e.g., `strings /proc/<pid>/mem | grep -i password`).

## 🌐 3. Network & Transport Layer Extractions

If you control a system, you control its networking.

- **PCAP / Wireshark Captures:** Look for cleartext HTTP basic auth, FTP logins, Telnet sessions, or LDAP simple binds traversing the compromised host.
- **Responder / Inveigh / Mitm6 (Active Directory Pivot):**
  - Start poisoning LLMNR/NBT-NS/mDNS broadcasts. Catch incoming NTLMv2 hashes from other machines attempting to authenticate to yours.
  - *Must crack offline or relay.*

## 💻 4. Browser & Client-Side Extractions

A compromised user's workstation contains the keys they use for management portals.

- **Browser Storage:**
  - Chrome, Firefox, and Edge store saved passwords. Use tools like `LaZagne`, `Seatbelt`, or custom scripts to extract the SQLite databases containing `logins.json` and decrypt them (requires the user's master key in Windows DPAPI).
  - Extract Session Cookies (`Cookie-Editor` / SQLite DBs) to impersonate the user in AWS Consoles, vCenter, or Web Admin panels without needing credentials at all!
- **Password Managers:**
  - Look for `KeePass.kdbx` databases. If you find one, memory-dump the `KeePass.exe` process to pull the master password string directly from RAM.

## 🔑 5. Tokens, Hashes, and Service Accounts

- **Pass-the-Hash (PtH):**
  - If you only have the NTLM Hash (e.g., `Administrator:500:AAD3B...:31D6C...:::`) and cannot crack it, you don't need to. Use `evil-winrm`, `crackmapexec`, or `psexec.py` to authenticate exactly as if it were the plaintext password.
- **Service Account Abuse (Kerberoasting):**
  - Accounts running MSSQL, Exchange, or IIS often have a Service Principal Name (SPN). You can request their Kerberos TGS tickets as any domain user and attempt to crack them offline.
- **Cloud Metadata / Token Abuse (SSRF/RCE Pivot):**
  - Read AWS IAM temporary tokens from `169.254.169.254/latest/meta-data/iam/security-credentials/`.
  - Steal Kubernetes Service Account tokens from `/var/run/secrets/kubernetes.io/serviceaccount/token`.

---

## 🔗 Pivot & Threat Chains (Putting it together)

| Scenario & Extracted Credential | Possible Chain |
|---------------------------------|----------------|
| **WP-Config.php Password** | Reuse on `SSH` to move from `www-data` to `ubuntu` user, then check `sudo -l`. |
| **NTLM Hash (Local Admin)** | **Pass-the-Hash** via `crackmapexec smb IP -u admin -H [hash]` to gain OS shell. |
| **AWS Metadata IAM Token** | Exfiltrate to local CLI: `aws s3 ls --profile stolen_creds` to dump S3 bucket containing enterprise passwords. |
| **Firefox Session Cookie** | Replace your session cookie in Burp to bypass the 2FA on their Jenkins Admin Portal. |

---

## 🚫 Operational Mistakes to Avoid (The Credential Hunt)

1. **Not Testing Cross-Service Applicability:** You found the MySQL password. Did you test it on FTP? On SSH? On the internal admin panel?
2. **Ignoring "Weak" Hashes:** Don't ignore MD5 or SHA1 hashes just because they seem old. Throw them in a rainbow table (CrackStation) immediately before setting up Hashcat.
3. **Locking Out Accounts:** Do not spray passwords indiscriminately against Active Directory if the lockout policy is set to 3 attempts. You will burn the engagement. Test one valid password against 50 users, NOT 50 passwords against 1 user.
4. **Failing to Re-Verify Keys:** Finding an `id_rsa` or `authorized_keys` file is great, but keys change. Always verify you can establish a connection before relying on it in your threat chain mapping.

## 🧠 Phase 4 Checkpoint
- [ ] Have I searched all dotfiles (`.env`, `.kube/config`, `.aws/credentials`)?
- [ ] Did I test the Web App's database credentials on exposed RDP/SSH services?
- [ ] Have I checked browser storage for hijacked session cookies?
