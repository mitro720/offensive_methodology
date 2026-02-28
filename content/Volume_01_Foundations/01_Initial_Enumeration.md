# 01 - Initial & Surface Enumeration

This is Phase 1. Before you send a single exploit payload, you must fully map the attack surface. 
You are answering the question: **What is exposed, what technologies are running it, and who owns it?**

## 1. Domain & Subdomain Enumeration (External Penetration / Bug Bounty)
- **Passive Subdomain Recon:**
  - `Amass / Subfinder / Assetfinder / crt.sh`
  - GitHub Dorking (`org:Target "password"`)
  - WHOIS / DNS Zone Transfers (`dig axfr`)
- **Active Subdomain Bruteforcing:**
  - `ffuf / gobuster / dnsrecon` using specialized wordlists (SecLists).
- **VHost Discovery:**
  - Many applications are hidden behind the same IP but different Host headers.
  - `ffuf -w vhosts.txt -u http://TARGET_IP -H "Host: FUZZ.target.com" -mc 200`

## 2. Port & Protocol Scanning (OSCP / Red Team)
- **Fast All-Port Scan (TCP):**
  - `rustscan -a TARGET -- -sV -sC -Pn`
  - `nmap -p- --min-rate=1000 -T4 TARGET`
- **Targeted Deep Scan:**
  - `nmap -sC -sV -p <open_ports> TARGET`
- **UDP Port Scanning (Often missed!):**
  - Essential for SNMP (`161`), DNS (`53`), TFTP (`69`), RPC.
  - `nmap -sU --top-ports 20 TARGET`

## 3. Technology Fingerprinting
- **Web App Tech Stack:**
  - `Wappalyzer`, `WhatWeb`, `BuiltWith`.
  - Check HTTP Response Headers (`Server: Apache/2.4.41`, `X-Powered-By: PHP/7.4.3`).
- **Framework Identification:**
  - Spring Boot (look for `/env`, `/actuator`), Django (admin panel), Laravel (`.env`), React/Vue/Angular (check DevTools for Source Maps).

## 4. WAF / IPS Detection
- Before firing heavy brute-force loops, check if a Web Application Firewall is blocking you.
  - `wafw00f https://target.com`
  - Manually test by sending a bad payload (`/?id=1' OR 1=1--`) and observing the response.

## 5. Directory & File Fuzzing (Content Discovery)
- **General Crawling:**
  - Use `hakrawler` or `katana` to pull all known links, forms, and APIs.
- **Hidden Endpoint Fuzzing:**
  - Run `ffuf` or `feroxbuster`.
  - Check for specific extensions relevant to the tech stack (e.g., `-e .php,.txt,.bak,.zip` if PHP).
- **Juicy Files & Dirs:**
  - `.git/`, `.env`, `composer.lock`, `package.json`, `robots.txt`, `sitemap.xml`, `backup.zip`.

## 💡 Advanced Mindset Check
- Do not stop at surface-level ports. If port `443` is open, what is the SSL certificate leaking? Are there other subdomains in the Subject Alternative Name (SAN)?
- If port `80` redirects to a domain, add it to your `/etc/hosts` immediately.
- Never assume an "Empty" HTTP page is dead. Fuzz it for hidden API endpoints or VHosts.
