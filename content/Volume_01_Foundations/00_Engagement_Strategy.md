# 00 - Phase Zero: Engagement Strategy & Mental Framework

Tactics without strategy is the noise before defeat. Before you run a single scan or send a single payload, you must contextualize the environment, set your rules of engagement, and prioritize your attack surface. This phase is about the **Mindset of the Attacker**.

---

## 🧭 1. Scope Interpretation & Context

How you attack depends entirely on *why* you are attacking. 

| Environment | Primary Focus | The "Winning" Metric |
|-------------|---------------|----------------------|
| **HTB / OSCP Labs** | **Chain Depth & Breadth.** Vulnerabilities are guaranteed to exist. Do not overthink business logic; look for technical misconfigurations and exploit chains. | Getting `root.txt` / SYSTEM. |
| **Bug Bounty** | **Business Logic & Automation.** Vertical depth. You are testing a heavily battered perimeter. Standard technical flaws (XSS/SQLi) are rare or filtered. Focus on IDOR, mass assignment, and payment logic. | Financial impact & Data leakage. |
| **Red Team (Assumed Breach)** | **Stealth & Lateral Movement.** You already have a foothold. The goal is moving through AD, finding the crown jewels, and avoiding SOC detection. | Objective completion without alarms. |
| **External Penetration Test** | **Breadth & Coverage.** You must find *everything*. The client wants a list of all exposed risks, not just the one that got you in. | A comprehensive report of the perimeter. |

---

## 🎯 2. Attack Surface Prioritization

When you run `rustscan` and see 80 (HTTP), 443 (HTTPS), 445 (SMB), 21 (FTP), and 22 (SSH), what do you test first?

**The Elite Decision Tree:**
1. **Unauthenticated / Anonymous Access First:** Try FTP anonymous login, SMB null sessions, and Redis/Memcached unauthenticated access. These offer the fastest possible information leakage (credentials, backups) with the least effort.
2. **Web Application Surface Second:** Web apps have the largest bespoke attack surface (custom code = custom bugs). Map it completely.
3. **Exploit the Overlap (The Red Team Pivot):** Can you upload a file on the Web App and view it on the FTP server? Can you read the DB credentials from a Web App config, and use them on the exposed MySQL port?
4. **Brute-Forcing Last:** SSH/RDP brute-forcing is noisy, slow, and often triggers lockouts. Save it for when you have actually gathered a valid username/password pair from another service.

---

## ⏱️ 3. Time-Boxing Logic & Rabbit Holes

Rabbit holes kill engagements. Establish strict time-boxing rules:
- **Recon / Fuzzing:** 1-2 hours max before analyzing the data. Run long tasks in the background.
- **Web App Logic Flaws:** Give yourself 30 minutes to understand a feature. If it doesn't break, move to the next feature. Return only if you find new context.
- **Exploitation:** If a public exploit (CVE) fails 3 times, **stop**. Read the exploit code. Does the path match? Does the architecture match? Blindly firing exploits causes crashes.

---

## ❌ 4. Operational Mistakes to Avoid (The Junior Traps)

Most engagements fail not from a lack of skill, but a lack of discipline.

1. **Over-enumerating early:** Running `nmap -p- -sV -sC` on a /24 subnet before doing a basic ping sweep. You drown in data and miss the obvious targets.
2. **Ignoring the small findings:** A PHP info leak isn't critical, but it tells you the absolute path (`/var/www/html`), which you *need* if you find an LFI later.
3. **Siloed Testing:** Testing the web app, finishing it, then testing SMB. **Wrong.** You must test cross-service interactions concurrently.
4. **Assuming, not verifying:** Assuming the backend is MySQL because it’s a PHP app. Break it to see the error message. Verify the tech stack.
5. **Ignoring the Environment Context:** Popping a shell and dropping a Windows kernel exploit without checking if you are in a Docker container or an AWS EC2 instance. (See Phase 7 for Cloud/Container awareness).

---

## 🧠 Phase 0 Checkpoint

Before moving to Phase 1 (Initial Enumeration), ask yourself:
- [ ] Do I understand the goal of this specific engagement (Stealth vs Coverage)?
- [ ] Have I set up my logging (Timestamped terminal logs, Burp project files)?
- [ ] Am I prepared to abandon a vulnerability if it exceeds my time-box?
