# 🏛️ Master Offensive Encyclopedia

Welcome to the **Master Offensive Encyclopedia** — not just a checklist, but a lifelong, evolving reference manual for deep offensive operations.

This repository bridges the gap between CTF concepts and Red Team realities. It enforces **Operational Depth**, **Decision Trees**, **Failure Handling Logic**, and **Chaining Patterns**. It covers everything from external web bug bounty to deep internal lateral movement.

---

## 📚 MASTER STRUCTURE

### [VOLUME I — Offensive Foundations](content/Volume_01_Foundations/README.md)
*The attacker mindset, enumeration discipline, chaining vs single vuln thinking, and engagement context Types (External, Internal, CTF vs Red Team).*

### [VOLUME II — Service & Protocol Encyclopedia](content/Volume_02_Service_Encyclopedia/README.md)
*Deep dive into every major service. Includes SMB, FTP, SSH, Databases (SQL/NoSQL/Redis), LDAP, and internal-only protocols like RPC or WinRM.*

### [VOLUME III — Credential Warfare](content/Volume_03_Credential_Warfare/README.md)
*Credentials are everything. Hash theory, token-based auth, config scraping, LSASS dumping, browser storage, and network interception (Responder).*

### [VOLUME IV — Privilege Escalation Theory](content/Volume_04_PrivEsc_Theory/README.md)
*Bypassing the OS. Linux SUIDs, capabilities, and cron. Windows unquoted service paths, token impersonation, UAC bypasses, and AD interaction.*

### [VOLUME V — Network Pivoting & Lateral Movement](content/Volume_05_Lateral_Movement/README.md)
*Flat network theory vs segmentation. SSH port forwarding, Chisel, Proxychains, Pass-the-Hash, and multi-hop compromise modeling.*

### [VOLUME VI — Cloud & Modern Infrastructure](content/Volume_06_Cloud_Infra/README.md)
*Metadata services (`169.254.169.254`), IAM misconfigurations, CI/CD exposure, Docker Trust boundaries, and Kubernetes Role abuse.*

### [VOLUME VII — Red Team & OPSEC Awareness](content/Volume_07_Red_Team_OPSEC/README.md)
*Noise considerations, logging awareness, Living-off-the-Land (LOLBins), evasion tradeoffs, and persistence logic.*

### [VOLUME VIII — Bug Bounty & App-Layer Exploitation](content/Volume_08_Bug_Bounty_Web/README.md)
*Deep web vectors. Business logic vulnerabilities, IDOR chains, multi-step ATOs, Race conditions, and Web-to-System pivoting.*

### [VOLUME IX — Certification Mode (OSCP/CPTS)](content/Volume_09_Certifications/README.md)
*Strategic guides for labs and exams. Time-boxing logic, box failure recovery, and strict methodology.*

### [VOLUME X — Failure Handling & Decision Trees](content/Volume_10_Failure_Handling/README.md)
*The **Elite** tier content. "Nothing is working" playbooks, enumeration blind spots, rabbit hole detection, and pattern recognition guides.*

---

## 🔥 How to Contribute and Expand (Modular Design)
Because this encyclopedia is massive, it is **Modular**. If you learn a new trick for Jenkins exploitation, it doesn't get shoved into a monolithic note. It gets its own node inside Volume 2. If you learn a new Kubernetes escape, it goes into Volume 6.

This repository is designed to be the only offensive security guide you will ever need to maintain. 🚀
