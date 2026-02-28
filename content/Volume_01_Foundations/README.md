# VOLUME I — Offensive Foundations

> *"Amateurs think about attacks. Professionals think about access paths."*

---

## Chapter 1: Offensive Philosophy

### 1.1 — The Attacker Mindset

Checklists are a crutch for beginners. Advanced operators think in **trust models** and **access paths**, not vulnerability classes. Before every engagement, ask:

- **"Who trusts what here?"** — Which services authenticate to each other? Which users have elevated access? What credentials are implicitly shared?
- **"Where does privilege flow?"** — Which accounts, tokens, or keys, if compromised, grant access to more systems?
- **"What is the highest-value asset?"** — Crown jewels first. You win by taking them, not by enumerating endlessly.

### 1.2 — Chaining vs Single Vulnerability Thinking

```
Single Vuln Thinker:          Chain Thinker:
┌─────────────────────┐        ┌──────────────────────────────────────────────────────┐
│ Find IDOR           │        │ IDOR leaks email + phone                             │
│ Severity: Medium    │   VS   │   → email used to trigger password reset             │
│ Report it. Done.    │        │     → reset token sent to attacker (host poisoning)  │
└─────────────────────┘        │       → full admin account takeover = Critical       │
                               └──────────────────────────────────────────────────────┘
```

The difference is not skill. It is **curiosity**. Always ask: "So I can read this object. What else can I *do* with what I just read?"

### 1.3 — The Three Layers of Engagement

1. **Enumerate Everything** — Find every port, service, file, parameter, and interaction point. Don't act yet. Map first.
2. **Exploit Individually** — Test each service for its own weaknesses. Confirm you can establish a foothold.
3. **Chain Across Services** — This is where real compromise happens. Make the services talk to each other in ways the defender never imagined.

> Most people live in Layer 2. Elite operators live in Layer 3.

### 1.4 — Enumeration Discipline

Enumeration is not "running Nikto and gobuster." It is **observing system behavior** scientifically.

- **Document everything** as you go. Not after. During.
- **Trust your scanner output, but verify manually** when something looks wrong.
- **Understand the tech stack** before exploiting it. An SSTI payload against a Jinja2 app is different from one against Freemarker. Know your target.
- **Ask "why?"** constantly. Why is port 8161 open? (ActiveMQ. Default creds: `admin:admin`. CVE-2023-46604 for older versions.)

---

## Chapter 2: Engagement Context Types

The same open port means something completely different depending on why you are there.

| Context | Focus | Noise Tolerance | Time Horizon |
|---------|-------|-----------------|--------------|
| **External Pentest** | Coverage & breadth. Find everything. | Medium — you're contracted | Days/Weeks |
| **Bug Bounty** | Depth on specific features. Business impact. | Low — you can get banned for being loud | Ongoing |
| **HTB / OSCP** | Chain depth. Get root.txt. | High — machines and simulators don't care | Hours |
| **Red Team** | Stealth, persistence, objective-based | Very Low — avoid SOC alerts | Weeks/Months |
| **CTF** | Creativity. Odd vulnerabilities. Think outside the box. | Doesn't matter | Hours |

**The most important question at engagement start:** *"What does 'winning' look like here?"* The methodology you apply must match that definition.

---

## Chapter 3: Phase 0 — Engagement Strategy

See the dedicated **[Phase 0: Engagement Strategy](00_Engagement_Strategy.md)** file for the full operational framework including:
- Attack Surface Prioritization (What to test first and why)
- Time-boxing Logic
- Junior Operational Mistakes to Avoid

---

## Chapter 4: Phase 1 — Initial Enumeration

See the dedicated **[Phase 1: Initial Enumeration](01_Initial_Enumeration.md)** file for:
- Port and Service scanning
- Subdomain and VHost discovery
- Technology fingerprinting
- Content discovery and directory fuzzing
