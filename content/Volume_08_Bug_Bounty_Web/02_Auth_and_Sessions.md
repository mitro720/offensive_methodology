# Authentication & Sessions

## 🎯 Goal
Understand the mechanisms that verify user identity, and systematically break them to achieve Account Takeover (ATO) or bypass the login flow altogether.

---

## 🔑 1. Password Reset Flaws

The password reset process is notoriously difficult to implement securely, making it a prime target for Account Takeover (ATO).

- **Host Header Injection:** Send a password reset request and intercept it in Burp. Change the `Host: target.com` header to `Host: attacker.com`. If the server uses this header to generate the reset link, the victim will receive an email linking to your server. When they click it, their reset token is sent to you!
- **Token Predictability:** Are reset tokens sequential or based on timestamps? Try generating two tokens back-to-back and comparing them.
- **Email Parameter Tampering:** Is the email address passed in the request body? Can you supply an array of emails? e.g., `{"email":["victim@target.com","attacker@vps.com"]}`.

## 🛡️ 2. MFA Bypass & 2FA Flaws

Multi-Factor Authentication is rarely bulletproof. Focus on the integration logic between steps.

- **Response Manipulation:** If the server returns `{"success": false}` upon a failed 2FA attempt, intercept the response in Burp and change it to `{"success": true}`. If the client-side logic dictates success, you will log in.
- **Forced Browsing:** After entering the username and password, try directly jumping to `/dashboard` or `/profile` instead of the 2FA `/otp` page.
- **Brute Forcing 2FA Codes:** If the OTP code is only 4-6 digits, check if rate-limiting is implemented on the OTP endpoint. No rate limiting? Turbo Intruder it.

## 🍪 3. JWT Abuse (JSON Web Tokens)

JWTs contain base64 encoded JSON and a signature. Many libraries have misconfigurations.

- **None Algorithm Bypass:** Change the token's header from `{"alg":"HS256"}` to `{"alg":"none"}`. Delete the signature (but keep the trailing dot). Does the server still accept it?
- **Signature Cracking:** Use `hashcat -a 0 -m 16500 jwt.txt rockyou.txt` to brute-force weak HMAC secrets.
- **Key Confusion (RS256 -> HS256):** If the server expects an RS256 token but doesn't strictly enforce it, change the algorithm to HS256 and sign it using the target's public key (often available at `/.well-known/jwks.json`).
- **Payload Manipulation:** Base64 decode the payload section, change `"role":"user"` to `"role":"admin"`, re-encode it, and sign it if you have the secret or an algorithm bypass.

## 🎫 4. OAuth Misconfigurations

OAuth is complex and frequently misconfigured, particularly during the callback phase.

- **Redirect URI Bypass:** Modify the `redirect_uri` parameter to point to an attacker-controlled domain (e.g., `redirect_uri=https://attacker.com`). When the user authenticates, their code/token is sent to your server.
- **State Token Missing (CSRF on Login):** If the `state` parameter is missing or not validated, you can perform CSRF. You can force a victim to log into your account, tying their actions to your account.
- **Implicit Flow Token Leakage:** If the response type is `token` (Implicit Grant), the token is appended to the URL fragment (`#access_token=`). Ensure this token doesn't leak via the `Referer` header to external sites.

---

## 🔗 Pivot Opportunities

| Observation | Possible Pivot |
|-------------|----------------|
| JWT cracking success | Change payload and elevate privileges to Admin |
| Weak password policy + Credential Stuffing | Use known breached credentials (Phase 3/4) to log into the web app |
| Host Header Injection | Full Account Takeover of an Administrator |

---

## 📚 References
- jwt.io (For quick decoding and debugging)
- HackTricks - OAuth Penetration Testing
- PortSwigger - Authentication
