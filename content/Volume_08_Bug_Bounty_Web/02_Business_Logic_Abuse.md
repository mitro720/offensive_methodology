# Business Logic Abuse & IDOR

## 🎯 Goal
Bypass the rules the developer assumed you would follow. Applications process logic sequentially, check for variables, process payments, and modify state. Break the workflow.

---

## 🏃 1. Race Conditions (Time-Of-Check to Time-Of-Use)

The server checks if an action is valid (e.g. "Do you have a $10 coupon?"), verifies it, and then executes (applies discounts). Can you execute the action 50 times in the exact millisecond before the server marks the coupon as "Used"?

- **Coupon / Discount Abuse:** Use Burp's Turbo Intruder. Send 1 `GET` verify request, followed immediately by 50 `POST` redeem requests. Wait for connection pooling, then send the last bytes of all packets simultaneously (Single Packet Attack).
- **Over-Drafting Funds:** Attempt to transfer $500 out of an account with a $500 balance, by sending 10 identical API requests at the exact same time. If the DB is lock-less, it may record the transfers but deduct the balance too late.
- **Inventory/Stock Abuse:** Can you reserve an item, add it to the cart multiple times simultaneously, bypassing the "only 1 remaining" check?

## 💸 2. Price Manipulation

E-commerce sites frequently send pricing data back and forth to the client.

- **Negative Values:** Change shipping prices, total amounts, or quantity to `-1`. If `Price = Cart * Quantity`, does `100 * -1` equal `-100`, offsetting your total?
- **Precision Errors:** Pay `$0.0001` instead of `$10`. Most databases store floats or round numbers. Rounding down a very small fraction (like `$0.00`) occasionally processes the transaction for free.
- **Parameter Duplication:** What happens if the API request is `POST /checkout?price=100&price=0`? Sometimes the backend picks up the second parameter instead of the first, honoring the $0 entry.

## 🔓 3. Mass Assignment / Auto-Binding

Modern frameworks map JSON payloads or form inputs directly to database objects. If the API model contains fields the user isn't supposed to touch, they might still automatically bind if sent.

- **Adding Extra Fields:** When registering or updating a profile, try passing attributes like `is_admin=true`, `roleId=1`, or `account_balance=1000`.
- **Finding the Schema:** Always try to intentionally trigger an error message to leak the object schema, or see Phase 2 (GraphQL / API) to extract the allowed parameters.

## 🚪 4. Insecure Direct Object Reference (IDOR)

The server doesn't check if the user requesting an object actually owns it, relying on predictability or client-side trust.

- **Horizontal Privilege Escalation:** Attempt to access or modify resources belonging to another user of the same privilege level. E.g., Changing `/api/users/10/profile` to `/api/users/11/profile`.
- **Vertical Privilege Escalation:** Attempting to access administrative or higher-level resources without an admin token. E.g., `POST /api/admin/deleteUser`.
- **Parameter Pollution (HPP):** If modifying `id=10` is blocked, try `user_id=10&user_id=11`. Which one does the WAF see? Which one does the application process?

---

## 🔗 Pivot Opportunities

| Observation | Possible Pivot |
|-------------|----------------|
| Mass Assignment (Admin Role) | Elevate to Admin, access the `/admin/settings` panel for full ATO/RCE |
| Negative Price Value | Exploit the payment gateway for untraceable testing |
| IDOR on Password Reset | Reset any user's password if the reset mechanism doesn't strictly validate the session token against the user ID |

---

## 📚 References
- PortSwigger - Business Logic Vulnerabilities
- HackTricks - IDOR & Race Conditions
