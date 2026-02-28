# 05 - Service Interaction Mapping & Pivot Chains (The Red Team Brain)

This is what separates the script kiddie from the advanced attacker. You do not just test isolated surfaces; you exploit the connections between them. This phase is all about creating compound vulnerabilities.

## 1. File Upload to Command Execution (The Classic Web-To-System)
If the web application allows file uploads but prevents execution in the webroot (or you can't find it):
- Can you upload via Web and access the file via **SMB** or **FTP**?
- Conversely, can you upload an `.aspx` or `.php` file via an anonymous **FTP** server and execute it by navigating to it on the Web App?

## 2. Server-Side Request Forgery + Internal Services (The Web-To-Internal Pivot)
If you have SSRF on an external-facing Web App:
- Can you reach an internal **Redis** server (`http://127.0.0.1:6379`) to write an SSH key or drop a web shell?
- Can you access an internal **Admin Panel** (`http://192.168.1.10:8080/admin`) that lacks authentication because it trusts the internal network?
- Can you query AWS/GCP Metadata APIs (`169.254.169.254`) for temporary IAM credentials?

## 3. Database Writing Interactions (The DB-To-System)
If you have SQL Injection or direct Database credentials:
- **MySQL (`SELECT INTO OUTFILE`):** Can you write a web shell directly into the Apache/Nginx webroot?
- **MSSQL (`xp_cmdshell` / OLE Automation):** Can you enable `xp_cmdshell` to run OS commands directly from the database context?
- **Postgres (`COPY FROM PROGRAM`):** Can you execute shell commands directly via a crafted COPY statement?

## 4. Cross-Service Protocol Abuse & Relaying
- **NTLM Relaying (SMB to LDAPS / HTTP):**
  - If you capture an NTLM hash (or force a machine account to authenticate to you via Coercion, e.g., PrinterBug/PetitPotam), relay that authentication to LDAPS to create a new Domain Admin or to an admin HTTP portal.
- **Kerberoasting (Active Directory to Offline Cracking):**
  - Extract service principal names (SPNs) from the domain and request their Kerberos tickets, then crack the service account passwords offline using Hashcat.

## 💡 Advanced Mindset Check (Creating the Chain)
When you map out services, ask the critical linking question:
- "If I compromise *Service A*, what permissions or capabilities does that grant me over *Service B*?"
- "Is the account running the database the same as the Windows `SYSTEM` account? If yes, a database flaw is a full OS compromise."
