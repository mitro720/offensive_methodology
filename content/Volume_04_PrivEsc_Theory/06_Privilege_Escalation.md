# 06 - Privilege Escalation (Linux & Windows)

You have a low-privileged shell (`www-data`, `nobody`, or a standard domain user). This phase is entirely focused on escalating horizontally to another user or vertically to `root` / `SYSTEM` / `Domain Admin`.

## 1. Information Gathering (PE Scripts)
Automate the basic checks first to save time.
- **Linux:** `LinPEAS.sh`, `Linux Exploit Suggester`, `pspy` (To sniff chronjobs & processes running in the background without root).
- **Windows:** `WinPEAS.exe`, `Seatbelt.exe`, `PowerUp.ps1`.

## 2. Linux Privilege Escalation Core Paths
- **Sudo Rights:** `sudo -l`. (Check GTFOBins for bypasses allowing shell spawning).
- **SUID/SGID Binaries:** `find / -type f -perm -04000 -ls 2>/dev/null`. Binaries with the S bit set run as owner (root).
- **Cron Jobs:** Look at `/etc/crontab`. Are there scripts running as root that are writable by your low-priv user or world-writable (Wildcard Injection)?
- **Capabilities:** `getcap -r / 2>/dev/null`. Less obvious than SUID but extremely potent (e.g., `cap_setuid` on a Python binary allows you to change UID seamlessly).
- **Kernel Exploits:** (DirtyCow, PwnKit/Polkit). Use these as a last resort in modern environments, as they are noisy and can crash the machine.
- **NFS Root Squashing:** `cat /etc/exports`. If `no_root_squash` is enabled, you can mount it locally, drop a SUID root bash binary, and run it on the target to get root.

## 3. Windows Privilege Escalation Core Paths
- **Unquoted Service Paths & Writable Services:** If a service path has spaces and lacks quotes (`C:\Program Files\App\service.exe`), you can drop a malicious `Program.exe` or `App.exe` to intercept the execution on reboot / restart.
- **Token Impersonation (SeImpersonatePrivilege):** (PrintSpoofer, RogueWinRM, JuicyPotato). Often available to IIS / service accounts.
- **AlwaysInstallElevated:** Registry key check. Allows running any `.msi` file as SYSTEM.
- **Scheduled Tasks / AutoRuns:** Modifying executables called periodically by higher privilege users.
- **Registry & SAM Attacks:** Pull the SAM and SYSTEM hives to crack local administrator hashes (`reg save hklm\sam sam.save`).

## 💡 Advanced Mindset Check (Living Off The Land - LOLBins)
Don't upload massive custom malware to escalate privileges. Use native binaries already on the machine. 
- Windows: `certutil`, `bitsadmin`, `powershell`, `wmic`
- Linux: `tar`, `awk`, `find`, `nmap`
Check the **LOLBAS Project** for Windows and **GTFOBins** for Linux.
