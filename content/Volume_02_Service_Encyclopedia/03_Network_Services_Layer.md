# 03 – Deep Network Services Layer (Expanded)

This phase expands **Phase 1** surface enumeration into a systematic, **service‑by‑service** deep dive. The goal is to turn every open port into a *potential foothold* and to understand how each service can be leveraged, abused, or chained with the web application.

---

## 📡 Service Overview & Quick‑Reference Table
| Port(s) | Service | Primary Enumeration Node |
|---------|---------|---------------------------|
| 21      | FTP | [FTP Enumeration](03_FTP_Enumeration.md) |
| 22      | SSH | [SSH Enumeration](03_SSH_Enumeration.md) |
| 23      | Telnet | [Telnet Enumeration](03_Telnet_Enumeration.md) |
| 25      | SMTP | [SMTP Enumeration](03_SMTP_Enumeration.md) |
| 53      | DNS | [DNS Enumeration](03_DNS_Enumeration.md) |
| 80/443  | HTTP/HTTPS (Web) | See Phase 2 (Web Application Layer) |
| 139/445 | SMB / NetBIOS | [SMB Enumeration](03_SMB_Enumeration.md) |
| 3306    | MySQL | [Database Enumeration – MySQL](03_Database_Enumeration.md) |
| 5432    | PostgreSQL | [Database Enumeration – PostgreSQL](03_Database_Enumeration.md) |
| 1433    | MSSQL | [Database Enumeration – MSSQL](03_Database_Enumeration.md) |
| 27017   | MongoDB | [Database Enumeration – MongoDB](03_Database_Enumeration.md) |
| 5900    | VNC | [VNC Enumeration](03_VNC_Enumeration.md) |
| 6379    | Redis | [Redis Enumeration](03_Redis_Enumeration.md) |
| 11211   | Memcached | [Memcached Enumeration](03_Memcached_Enumeration.md) |
| 8000/8080 | Web‑admin panels (Jenkins, Tomcat, etc.) | See Phase 2 or specific panel docs |
| 8443    | Tomcat/Java admin consoles | See Phase 2 |
| 9000    | SonarQube / dev tools | See Phase 2 |
| 5000    | Flask/Django dev servers | See Phase 2 |

> **Advanced Mindset:** *Never stop at “service is open”.* Ask: *What does this service *do* on the host?* *What credentials does it share with other services?* *Can it be abused to reach an internal API?*

---

## 📚 How to Use This Layer
1. **Start with the table** – click a link to open the detailed enumeration node for that service.
2. **Run the “Quick‑Commands”** block for your OS (PowerShell examples are provided, with Linux equivalents in comments).
3. **Check the “What to Look For”** checklist – these are the high‑value artefacts that often lead to pivot opportunities.
4. **Map any cross‑service relationships** – after each service, note any shared credentials, writable directories, or internal endpoints that could be abused (see the *Service Interaction Mapping* section at the end of each node).
5. **Proceed to Phase 4 – Credential Hunting** once you have collected artefacts.

---

## 🔗 Service Interaction Mapping (Cross‑Service Pivot Opportunities)
A concise matrix is reproduced at the bottom of each detailed node. It highlights the most common ways services can be chained together (e.g., *Redis → Web Shell*, *SMB ↔ Web Upload*, *SSH ↔ Credential Reuse*). Keep this matrix handy while you enumerate – it helps you think about *chaining* rather than isolated testing.

---

## 📂 Deliverables for This Phase
- **`03_Network_Services_Layer.md`** – this master index.
- **Individual service nodes** (see links above) – each contains deep enumeration steps, tools, checks, and pivot ideas.
- **`tools.md`** – a consolidated cheat‑sheet of one‑liners (still in Phase 2).
- **`service_interaction_matrix.md`** – a master matrix summarising cross‑service exploit ideas.

When you’re ready, we’ll move on to **Phase 4 – Credential Hunting**, where we’ll turn every artefact you collect here into usable credentials and pivot material.

---

*Happy hunting! 🚀*
