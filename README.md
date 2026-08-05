# Solo Leveling CTF

Lightweight Node.js CTF web app with three challenge levels (cookie auth, SQL injection, and command injection).

**Repo files:** [app.js](solo-leveling-ctf/app.js#L1-L400) • [package.json](solo-leveling-ctf/package.json#L1-L200)

## Quick summary
- Stack: Node.js, Express, SQLite (in-memory).
- Three progressive challenges exposed as HTTP endpoints:
  - `/` — Level 1: cookie-based privilege escalation (Base64 session cookie)
  - `/level2` — Level 2: SQL injection against an in-memory `hunters` table
  - `/level3` — Level 3: filtered command execution (WAF-style blacklist)

## Setup

1. Install dependencies

```bash
cd solo-leveling-ctf
npm install
```

2. Run

```bash
node app.js
# or set a custom port: PORT=4000 node app.js
```

The server listens on `http://localhost:3000` by default.

## Docker build and run

From the project folder, build the image:

```bash
cd solo-leveling-ctf
docker build -t solo-leveling-ctf .
```

Then start the container with the challenge flags:

```bash
docker run -d --name solo-leveling-ctf -p 3000:3000 \
  -e FLAG1="FLAG{1_ASCENDANT_WARDEN_AWAKES}" \
  -e FLAG2="FLAG{2_SHADOW_SIGIL_DATABASE_REVEALED}" \
  -e FLAG3="FLAG{3_OMNIS_COMMAND_FURY_ROOT}" \
  solo-leveling-ctf
```

Open the app at http://localhost:3000.

To stop and remove the container later:

```bash
docker stop solo-leveling-ctf
docker rm solo-leveling-ctf
```

## Endpoints & behavior

- GET `/` — shows current `system_quest` cookie (Base64). If cookie decodes to include `hunter_rank=S_RANK`, the app displays `FLAG_1`.
- GET + POST `/level2` — search form that executes a vulnerable SQL query against an in-memory SQLite DB. The database includes an entry with the secret stored in `secret_records` (this is `FLAG_2`).
- GET + POST `/level3` — final challenge: user-controlled input is passed to `exec()` after some blacklist checks. The app writes a flag file to `/tmp/shadow_realm/monarch_shadow_core.txt` (this is `FLAG_3`).

## Hints / Analysis (for players)

- Level 1 (Cookie Manipulation)
  - The `system_quest` cookie is Base64-encoded text like `hunter_rank=E_RANK` by default. Modify it so it contains `hunter_rank=S_RANK` and re-visit `/` to claim `FLAG_1`.

- Level 2 (SQL Injection)
  - The server builds SQL with unsanitized input: `SELECT name, rank FROM hunters WHERE name = '${searchTerm}'`.
  - Crafting a payload that injects a `UNION` or uses sqlite master queries can expose rows or the `secret_records` column (which contains `FLAG_2`).

- Level 3 (Command Injection)
  - Input is filtered for spaces and a short blacklist (`;`, `&&`, `||`, `|`, `` ` ``, `cat`, `env`, `flag`, `ls`, etc.). However, the app executes `exec('echo Extraction Status for Subject: ' + target)` and the flag file is present at `/tmp/shadow_realm/monarch_shadow_core.txt`.
  - Consider alternative techniques to influence command execution (encoded newlines, subshell expansions, or other characters not blacklisted) to reveal file contents.

## Security notes (for educators)

- This project intentionally contains severe vulnerabilities for training/CTF purposes: insecure cookie handling, blind SQL concatenation, and unsafe use of `exec()`.
- Do NOT run this code on a public-facing host without proper containment (the code writes files under `/tmp` and executes shell commands).

## Suggested exercises

- Try to obtain all three flags without modifying server code.
- Patch the application to harden each level (use signed cookies, parameterized SQL queries, and avoid `exec()` with user input).
